#!/usr/bin/env node

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

// Env
const ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

if (!ACCOUNT_ID || !BUCKET_NAME) {
  console.error('Missing CLOUDFLARE_R2_ACCOUNT_ID or CLOUDFLARE_R2_BUCKET_NAME');
  process.exit(1);
}
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error('Missing Upstash credentials in .env.local');
  process.exit(1);
}
if (!R2_PUBLIC_URL) {
  console.warn('CLOUDFLARE_R2_PUBLIC_URL is not set. URLs may be invalid.');
}

// Clients
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});
const redis = Redis.fromEnv();

function buildResizedUrl(originalKey, width) {
  if (!R2_PUBLIC_URL) return '';
  return `${R2_PUBLIC_URL}/cdn-cgi/image/width=${width},height=${width},fit=cover,gravity=center/${originalKey}`;
}

function tokenizeFileName(name) {
  return name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .split(/[\-_\s]+/)
    .filter(Boolean);
}

// 英単語 -> 日本語タグの簡易辞書
const TAG_MAP = new Map([
  ['man', '男性'],
  ['male', '男性'],
  ['boy', '男性'],
  ['business', 'ビジネス'],
  ['office', 'オフィス'],
  ['worker', 'ビジネス'],
  ['suit', 'スーツ'],
  ['tie', 'ネクタイ'],
  ['casual', 'カジュアル'],
  ['smile', '笑顔'],
  ['happy', '笑顔'],
  ['sad', '悲しい'],
  ['angry', '怒り'],
  ['thinking', '考える'],
  ['idea', 'ひらめき'],
  ['point', '指差し'],
  ['pointing', '指差し'],
  ['ok', 'OKサイン'],
  ['good', 'グッドサイン'],
  ['no', 'バツサイン'],
  ['ng', 'バツサイン'],
  ['thumb', 'サムズアップ'],
  ['thumbs', 'サムズアップ'],
  ['phone', 'スマホ'],
  ['smartphone', 'スマホ'],
  ['pc', 'パソコン'],
  ['laptop', 'ノートPC'],
  ['computer', 'パソコン'],
  ['meeting', '会議'],
  ['present', 'プレゼン'],
  ['presentation', 'プレゼン'],
  ['talk', '会話'],
  ['call', '通話'],
  ['run', '走る'],
  ['walk', '歩く'],
  ['stand', '立つ'],
  ['sitting', '座る'],
  ['sit', '座る'],
  ['surprised', '驚き'],
  ['shock', '驚き'],
  ['confused', '困惑'],
  ['question', '疑問'],
  ['idea', 'ひらめき'],
  ['money', 'お金'],
  ['coin', 'コイン'],
  ['yen', '円'],
  ['japanese', '日本人'],
]);

function generateJapaneseTitleAndTags(fileBase) {
  const tokens = tokenizeFileName(fileBase);

  const baseTags = new Set(['男性', '人物', 'イラスト']);
  let domain = '';
  const actionTags = [];

  for (const t of tokens) {
    const mapped = TAG_MAP.get(t);
    if (mapped) {
      baseTags.add(mapped);
      if (['ビジネス', 'オフィス', 'スーツ'].includes(mapped)) domain = 'ビジネス';
      if ([
        '笑顔','悲しい','怒り','考える','ひらめき','指差し','OKサイン','グッドサイン','バツサイン','サムズアップ','会議','プレゼン','会話','通話','走る','歩く','立つ','座る','驚き','困惑','疑問','お金'
      ].includes(mapped)) {
        actionTags.push(mapped);
      }
    }
  }

  // タイトル構築（重要度順に並べる）
  const titleParts = ['男性'];
  if (domain) titleParts.push(domain);
  // 代表的なアクション1-2個
  if (actionTags.length > 0) titleParts.push(actionTags[0]);
  if (actionTags.length > 1) titleParts.push(actionTags[1]);

  const title = titleParts.join('・');
  return { title, tags: Array.from(baseTags) };
}

async function listManObjects() {
  const Prefix = `images/originals/man/`;
  const results = [];
  let ContinuationToken = undefined;
  do {
    const resp = await r2Client.send(new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix,
      ContinuationToken,
    }));
    (resp.Contents || []).forEach(o => {
      if (!o.Key) return;
      if (/(^|\/)\./.test(o.Key)) return;
      if (/-thumb\.(webp|png|jpg|jpeg)$/i.test(o.Key)) return;
      if (!/\.(png|jpg|jpeg|webp|gif)$/i.test(o.Key)) return;
      results.push(o.Key);
    });
    ContinuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return results;
}

async function addToDb({ title, imageUrl, thumbnailUrl, originalUrl, category, tags }) {
  const nextId = await redis.incr('illustration:next_id');
  const now = new Date().toISOString();
  const payload = {
    id: nextId,
    title,
    imageUrl,
    thumbnailUrl,
    originalUrl,
    category,
    tags,
    downloads: 0,
    fileSize: '',
    dimensions: '',
    createdAt: now,
    updatedAt: now,
  };
  await redis.set(`illustration:${nextId}`, JSON.stringify(payload));
  await redis.set(`downloads:${nextId}`, 0);
  return payload;
}

function decideCategory(tags) {
  return tags.includes('ビジネス') ? 'business' : 'people';
}

async function main() {
  console.log('👨 Processing man folder...');
  const keys = await listManObjects();
  if (keys.length === 0) {
    console.log('❌ No images found under: images/originals/man/');
    return;
  }
  console.log(`📦 Found ${keys.length} files`);

  let success = 0;
  for (const key of keys) {
    try {
      const base = key.split('/').pop() || '';
      const { title, tags } = generateJapaneseTitleAndTags(base);
      const category = decideCategory(tags);

      const originalUrl = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : '';
      const imageUrl = buildResizedUrl(key, 600);
      const thumbnailUrl = buildResizedUrl(key, 300);

      const created = await addToDb({ title, imageUrl, thumbnailUrl, originalUrl, category, tags });
      success++;
      console.log(`✅ Imported: ${created.id} - ${title}`);
    } catch (e) {
      console.error('❌ Failed to import', key, e.message);
    }
  }
  console.log(`🎉 Done. Imported ${success}/${keys.length} images.`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Process failed:', err);
    process.exit(1);
  });
}


