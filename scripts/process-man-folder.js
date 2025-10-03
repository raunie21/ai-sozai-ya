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
    .split(/[\-\_\s]+/)
    .filter(Boolean);
}

// 英単語 -> 日本語タグの簡易辞書
const TAG_MAP = new Map([
  // 基本
  ['man', '男性'], ['male', '男性'], ['boy', '男性'], ['guy', '男性'], ['person', '人物'],
  // ビジネス/服装
  ['business', 'ビジネス'], ['office', 'オフィス'], ['worker', 'ビジネスマン'],
  ['suit', 'スーツ'], ['tie', 'ネクタイ'], ['shirt', 'シャツ'], ['jacket', 'ジャケット'], ['casual', 'カジュアル'],
  // 表情
  ['smile', '笑顔'], ['happy', '笑顔'], ['angry', '怒り'], ['mad', '怒り'], ['sad', '悲しい'], ['cry', '涙'],
  ['excited', '興奮'], ['excite', '興奮'], ['yell', '叫ぶ'], ['yelling', '叫ぶ'],
  ['surprise', '驚き'], ['surprised', '驚き'], ['shock', '驚き'], ['confused', '困惑'], ['think', '考える'], ['thinking', '考える'],
  // ジェスチャ/姿勢
  ['point', '指差し'], ['pointing', '指差し'], ['ok', 'OKサイン'], ['okay', 'OKサイン'], ['good', 'グッドサイン'], ['great', 'グッドサイン'], ['thumb', 'サムズアップ'], ['thumbs', 'サムズアップ'], ['thumbsup', 'サムズアップ'],
  ['ng', 'バツサイン'], ['no', 'バツサイン'], ['armscross', '腕組み'], ['arms', '腕組み'], ['cross', '腕組み'],
  ['sit', '座る'], ['sitting', '座る'], ['stand', '立つ'], ['standing', '立つ'], ['walk', '歩く'], ['run', '走る'], ['jump', 'ジャンプ'],
  // 物/シーン
  ['phone', 'スマホ'], ['smartphone', 'スマホ'], ['call', '通話'], ['talk', '会話'], ['chat', '会話'],
  ['pc', 'パソコン'], ['computer', 'パソコン'], ['laptop', 'ノートPC'], ['present', 'プレゼン'], ['presentation', 'プレゼン'], ['meeting', '会議'],
  ['document', '書類'], ['money', 'お金'], ['coin', 'コイン'], ['yen', '円'],
  // 属性
  ['japanese', '日本人'], ['young', '若者'], ['old', '高齢'], ['elderly', '高齢'],
]);

// 日本語タグの同義語拡張
const TAG_SYNONYMS = new Map([
  ['笑顔', ['スマイル']],
  ['怒り', ['怒る']],
  ['叫ぶ', ['怒鳴る']],
  ['スマホ', ['携帯']],
  ['サムズアップ', ['いいね', '親指', 'グッド']],
  ['OKサイン', ['オーケー', 'OK']],
]);

function addTagWithSynonyms(tagSet, tag) {
  tagSet.add(tag);
  const syns = TAG_SYNONYMS.get(tag);
  if (syns && syns.length > 0) {
    for (const s of syns) tagSet.add(s);
  }
}

function toFullWidthNumber(numStr) {
  return numStr.replace(/[0-9]/g, d => String.fromCharCode(d.charCodeAt(0) + 0xFEE0));
}

function extractTrailingNumber(baseName) {
  const m = baseName.match(/(\d+)$/);
  return m ? m[1] : '';
}

function generateJapaneseTitleAndTags(fileBase) {
  const tokens = tokenizeFileName(fileBase)
    .map(t => t.replace(/\d+$/, '')) // 語尾の番号は除去 ex) pose1 -> pose
    .filter(t => !['img', 'image', 'illust', 'illustration', 'ver'].includes(t));

  // 初期タグから「イラスト」は除去
  const tags = new Set(['男性', '人物']);
  const baseNameNoExt = fileBase.replace(/\.[^.]+$/, '');
  const trailingNum = extractTrailingNumber(baseNameNoExt);

  const found = {
    domain: new Set(), // ビジネス/カジュアル等
    clothing: new Set(),
    gesture: new Set(),
    emotion: new Set(),
    action: new Set(),
    item: new Set(),
    attribute: new Set(),
  };

  for (const t of tokens) {
    const mapped = TAG_MAP.get(t);
    if (mapped) {
      addTagWithSynonyms(tags, mapped);
      if (['ビジネス', 'オフィス', 'ビジネスマン'].includes(mapped)) found.domain.add('ビジネス');
      if (['カジュアル'].includes(mapped)) found.domain.add('カジュアル');
      if (['スーツ','ネクタイ','シャツ','ジャケット'].includes(mapped)) found.clothing.add(mapped);
      if (['スマホ','パソコン','ノートPC','書類','お金','コイン','円'].includes(mapped)) found.item.add(mapped);
      if (['指差し','OKサイン','グッドサイン','サムズアップ','バツサイン','腕組み'].includes(mapped)) found.gesture.add(mapped);
      if (['笑顔','悲しい','怒り','驚き','困惑','考える','興奮'].includes(mapped)) found.emotion.add(mapped);
      if (['走る','歩く','立つ','座る','ジャンプ','会議','プレゼン','会話','通話','叫ぶ'].includes(mapped)) found.action.add(mapped);
      if (['日本人','若者','高齢'].includes(mapped)) found.attribute.add(mapped);
    }
  }

  // タイトルは「男性 {主要語}{番号}」形式
  const numSuffix = trailingNum ? toFullWidthNumber(trailingNum) : '';
  let mainTerm = '';
  if (found.gesture.size > 0) mainTerm = Array.from(found.gesture)[0];
  else if (found.emotion.size > 0) mainTerm = Array.from(found.emotion)[0];
  else if (found.action.size > 0) mainTerm = Array.from(found.action)[0];
  const title = mainTerm ? `男性 ${mainTerm}${numSuffix}` : `男性${numSuffix ? ' ' + numSuffix : ''}`;
  return { title, tags: Array.from(tags) };
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
      if (/(^|\/)/.test(o.Key)) return;
      if (/-thumb\.(webp|png|jpg|jpeg)$/i.test(o.Key)) return;
      if (!/\.(png|jpg|jpeg|webp|gif)$/i.test(o.Key)) return;
      results.push(o.Key);
    });
    ContinuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return results;
}

async function findExistingIdByOriginalUrl(originalUrl) {
  const keys = await redis.keys('illustration:*');
  const idKeys = keys.filter(k => /^illustration:\d+$/.test(k));
  for (const k of idKeys) {
    const raw = await redis.get(k);
    if (!raw) continue;
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (data && data.originalUrl === originalUrl) {
      return data.id;
    }
  }
  return null;
}

async function upsertToDb({ title, imageUrl, thumbnailUrl, originalUrl, category, tags }) {
  const now = new Date().toISOString();
  const existingId = await findExistingIdByOriginalUrl(originalUrl);
  if (existingId) {
    const existingRaw = await redis.get(`illustration:${existingId}`);
    const existing = typeof existingRaw === 'string' ? JSON.parse(existingRaw) : existingRaw;
    const updated = {
      ...existing,
      title,
      imageUrl,
      thumbnailUrl,
      category,
      tags,
      updatedAt: now,
    };
    await redis.set(`illustration:${existingId}`, JSON.stringify(updated));
    // downloads は維持
    return updated;
  } else {
    const nextId = await redis.incr('illustration:next_id');
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

      const created = await upsertToDb({ title, imageUrl, thumbnailUrl, originalUrl, category, tags });
      success++;
      console.log(`✅ Upserted: ${created.id} - ${title}`);
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


