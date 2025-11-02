#!/usr/bin/env node

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

// Env
const ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;
const DEFAULT_FOLDER = 'images/originals/animal/dog/';

// Args
const args = process.argv.slice(2);
const targetPrefix = args[0] && args[0] !== 'dog' ? args[0] : DEFAULT_FOLDER;
const apiKey = process.env.GOOGLE_VISION_API_KEY || process.env.GCLOUD_VISION_API_KEY || process.env.VISION_API_KEY || args[1] || '';

if (!ACCOUNT_ID || !BUCKET_NAME) {
  console.error('Missing CLOUDFLARE_R2_ACCOUNT_ID or CLOUDFLARE_R2_BUCKET_NAME');
  process.exit(1);
}
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error('Missing Upstash credentials in .env.local');
  process.exit(1);
}
if (!R2_PUBLIC_URL) {
  console.error('CLOUDFLARE_R2_PUBLIC_URL is required for public image URLs');
  process.exit(1);
}
if (!apiKey) {
  console.error('Google Vision API key is required. Set GOOGLE_VISION_API_KEY in .env.local or pass as 2nd arg.');
  process.exit(1);
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

async function listObjects(prefix) {
  const results = [];
  let ContinuationToken = undefined;
  do {
    const resp = await r2Client.send(new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      ContinuationToken,
    }));
    (resp.Contents || []).forEach(o => {
      if (!o.Key) return;
      if (o.Key.endsWith('/')) return;
      if (!/\.(png|jpg|jpeg|webp|gif)$/i.test(o.Key)) return;
      results.push(o.Key);
    });
    ContinuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return results;
}

function buildPublicUrl(key) {
  return `${R2_PUBLIC_URL}/${key}`;
}

// Mapping (English labels -> Japanese tags)
const BREED_MAP = new Map([
  ['shiba inu', '柴犬'],
  ['shiba', '柴犬'],
  ['akita inu', '秋田犬'],
  ['akita', '秋田犬'],
  ['labrador retriever', 'ラブラドール'],
  ['golden retriever', 'ゴールデンレトリバー'],
  ['retriever', 'レトリバー'],
  ['poodle', 'プードル'],
  ['toy poodle', 'トイプードル'],
  ['miniature poodle', 'プードル'],
  ['chihuahua', 'チワワ'],
  ['pomeranian', 'ポメラニアン'],
  ['shih tzu', 'シーズー'],
  ['miniature schnauzer', 'シュナウザー'],
  ['schnauzer', 'シュナウザー'],
  ['beagle', 'ビーグル'],
  ['bulldog', 'ブルドッグ'],
  ['frenchie', 'フレンチブルドッグ'],
  ['french bulldog', 'フレンチブルドッグ'],
  ['corgi', 'コーギー'],
  ['welsh corgi', 'コーギー'],
  ['pembroke welsh corgi', 'コーギー'],
  ['cardigan welsh corgi', 'コーギー'],
  ['dachshund', 'ダックスフンド'],
  ['pug', 'パグ'],
  ['border collie', 'ボーダーコリー'],
  ['collie', 'コリー'],
  ['siberian husky', 'シベリアンハスキー'],
  ['german shepherd dog', 'ジャーマンシェパード'],
  ['german shepherd', 'ジャーマンシェパード'],
  ['alsatian', 'ジャーマンシェパード'],
  ['samoyed', 'サモエド'],
]);

const COLOR_MAP = new Map([
  ['black', '黒'],
  ['white', '白'],
  ['brown', '茶'],
  ['golden', 'ゴールド'],
  ['cream', 'クリーム'],
  ['tan', 'タン'],
  ['gray', '灰'],
  ['grey', '灰'],
  ['red', '赤'],
  ['brindle', 'ブリンドル'],
  ['merle', 'マール'],
]);

function normalizeLabelToTags(label) {
  const l = label.toLowerCase();
  const tags = new Set();
  // breed
  for (const [k, v] of BREED_MAP.entries()) {
    if (l.includes(k)) tags.add(v);
  }
  // color
  for (const [k, v] of COLOR_MAP.entries()) {
    if (l.includes(k)) tags.add(v);
  }
  return Array.from(tags);
}

async function annotateImage(url) {
  const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${encodeURIComponent(apiKey)}`;
  const body = {
    requests: [
      {
        image: { source: { imageUri: url } },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 10 },
          { type: 'WEB_DETECTION', maxResults: 10 }
        ]
      }
    ]
  };
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Vision API error: ${res.status} ${text}`);
  }
  const json = await res.json();
  return json;
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

async function upsertTagsByOriginalUrl(originalUrl, addTags) {
  const id = await findExistingIdByOriginalUrl(originalUrl);
  if (!id) return null;
  const raw = await redis.get(`illustration:${id}`);
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const currentTags = Array.isArray(data?.tags) ? data.tags : [];
  const merged = Array.from(new Set([...currentTags, ...addTags]));
  const now = new Date().toISOString();
  const updated = { ...data, tags: merged, updatedAt: now };
  await redis.set(`illustration:${id}`, JSON.stringify(updated));
  return updated;
}

function extractTagsFromVisionResponse(resp) {
  const tags = new Set();
  const results = resp?.responses?.[0] || {};
  const labels = results.labelAnnotations || [];
  const webEntities = results.webDetection?.webEntities || [];
  const bestGuesses = results.webDetection?.bestGuessLabels || [];

  const addFromArray = (arr, scoreKey) => {
    for (const item of arr) {
      const desc = (item.description || item.entityId || '').toString();
      const score = item[scoreKey] ?? item.score ?? 0;
      if (!desc) continue;
      // しきい値（精度向上のため厳しめ）
      if ((scoreKey === 'score' && score >= 0.8) || (scoreKey !== 'score' && (item.score || 0.8) >= 0.8)) {
        for (const t of normalizeLabelToTags(desc)) tags.add(t);
      }
    }
  };

  addFromArray(labels, 'score');
  addFromArray(webEntities, '');
  // best guess はスコアが無いが、breedにマッチした語のみ採用
  for (const g of bestGuesses) {
    const desc = (g.label || g).toString().toLowerCase();
    for (const [k, v] of BREED_MAP.entries()) {
      if (desc.includes(k)) tags.add(v);
    }
  }

  // 補助タグ（犬種の汎用タグは付与しない）
  if (Array.from(tags).some(t => ['黒','白','茶','灰','赤','クリーム','タン','青','ブリンドル','マール','ゴールド'].includes(t))) {
    tags.add('毛色');
  }
  // 犬系は固定付与
  tags.add('犬');
  tags.add('ペット');
  tags.add('イヌ科');

  return Array.from(tags);
}

async function main() {
  console.log(`🔎 Vision enrich start for prefix: ${targetPrefix}`);
  const keys = await listObjects(targetPrefix);
  if (keys.length === 0) {
    console.log('❌ No images found under:', targetPrefix);
    return;
  }
  console.log(`📦 Found ${keys.length} files`);

  let success = 0;
  for (const key of keys) {
    try {
      const imageUrl = buildPublicUrl(key);
      const vision = await annotateImage(imageUrl);
      const newTags = extractTagsFromVisionResponse(vision);
      if (newTags.length === 0) {
        console.log('ℹ️  No tags extracted for:', key);
        continue;
      }
      const updated = await upsertTagsByOriginalUrl(imageUrl, newTags);
      if (updated) {
        success++;
        console.log(`✅ Enriched (${updated.id}): +${newTags.join(',')}`);
      } else {
        console.log('⚠️  DB record not found for:', key);
      }
      // Rate limit: small delay
      await new Promise(r => setTimeout(r, 200));
    } catch (e) {
      console.error('❌ Vision enrich failed for', key, e.message);
    }
  }
  console.log(`🎉 Done. Enriched ${success}/${keys.length} images.`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Process failed:', err);
    process.exit(1);
  });
}
