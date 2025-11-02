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

// 英単語 -> 日本語タグ（animal向け: cat/dog中心）
const TAG_MAP = new Map([
  ['animal', '動物'], ['cat', '猫'], ['kitten', '子猫'], ['dog', '犬'], ['puppy', '子犬'],
  ['smile', '笑顔'], ['smiling', '笑顔'], ['angry', '怒り'], ['mad', '怒り'], ['sad', '悲しい'], ['disappointed', '落胆'], ['sleepy', '眠い'], ['sleep', '眠る'], ['sleeping', '眠る'],
  ['sit', '座る'], ['sitting', '座る'], ['running', '走る'], ['run', '走る'], ['walk', '歩く'], ['walking', '歩く'], ['jump', 'ジャンプ'], ['eat', '食べる'],
  ['openmouth', '口を開ける'],
  // 犬種（英語表記）
  ['shiba', '柴犬'], ['shibainu', '柴犬'], ['shiba-inu', '柴犬'],
  ['poodle', 'プードル'], ['toypoodle', 'トイプードル'], ['toy-poodle', 'トイプードル'],
  ['labrador', 'ラブラドール'],
  ['goldenretriever', 'ゴールデンレトリバー'], ['golden-retriever', 'ゴールデンレトリバー'], ['retriever', 'レトリバー'],
  ['beagle', 'ビーグル'], ['bulldog', 'ブルドッグ'], ['corgi', 'コーギー'], ['dachshund', 'ダックスフンド'],
  ['chihuahua', 'チワワ'], ['pomeranian', 'ポメラニアン'], ['shihtzu', 'シーズー'], ['shih-tzu', 'シーズー'], ['schnauzer', 'シュナウザー'],
  // 色（毛色）
  ['black', '黒'], ['white', '白'], ['brown', '茶'], ['gray', '灰'], ['grey', '灰'], ['red', '赤'], ['cream', 'クリーム'], ['tan', 'タン'], ['blue', '青'],
  ['brindle', 'ブリンドル'], ['merle', 'マール'],
]);

const TAG_SYNONYMS = new Map([
  ['猫', ['ねこ']],
  ['犬', ['いぬ']],
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

function generateJapaneseTitleAndTags(fileBase, keyForDetect) {
  const tokens = tokenizeFileName(fileBase)
    .map(t => t.replace(/\d+$/, ''))
    .filter(t => !['img', 'image', 'illust', 'illustration', 'ver', 'pose', 'a', 'b'].includes(t));

  const tags = new Set(['動物']);
  let subject = '';
  const subjectCandidates = new Set();
  let mainState = '';
  let mainAction = '';
  let hasEmotion = false;
  let hasAction = false;
  let hasState = false;
  let hasColor = false;

  const COLOR_TAGS = new Set(['黒','白','茶','灰','赤','クリーム','タン','青','ブリンドル','マール']);

  for (const t of tokens) {
    const mapped = TAG_MAP.get(t);
    if (mapped) {
      addTagWithSynonyms(tags, mapped);
      if (['猫','子猫','犬','子犬'].includes(mapped)) {
        subjectCandidates.add(mapped);
        // 既存のロジックは最初のものを採用していたが、
        // kitten/puppy を優先させるため後で最終決定する
        subject = subject || mapped;
      }
      if (['笑顔','怒り','悲しい','落胆','眠い'].includes(mapped)) { mainState = mainState || mapped; hasEmotion = true; }
      if (['口を開ける','眠る'].includes(mapped)) { mainState = mainState || mapped; hasState = true; }
      if (['走る','歩く','ジャンプ','座る','食べる'].includes(mapped)) { mainAction = mainAction || mapped; hasAction = true; }
      if (COLOR_TAGS.has(mapped)) { hasColor = true; }
    }
  }

  // 主語の優先順位: 子猫 > 子犬 > 猫 > 犬
  if (subjectCandidates.size > 0) {
    const pref = ['子猫', '子犬', '猫', '犬'];
    for (const p of pref) {
      if (subjectCandidates.has(p)) {
        subject = p;
        break;
      }
    }
  }

  const baseNameNoExt = fileBase.replace(/\.[^.]+$/, '');
  const trailingNum = extractTrailingNumber(baseNameNoExt);
  const numSuffix = trailingNum ? toFullWidthNumber(trailingNum) : '';

  const mainTerm = mainState || mainAction;
  const subjectWord = subject || '動物';
  const title = mainTerm ? `${subjectWord} ${mainTerm}${numSuffix}` : `${subjectWord}${numSuffix ? ' ' + numSuffix : ''}`;
  // 追加の派生タグ
  if (subjectWord.includes('猫') || subjectWord.includes('子猫')) {
    tags.add('ペット');
    tags.add('ネコ科');
  }
  if (subjectWord.includes('犬') || subjectWord.includes('子犬')) {
    tags.add('ペット');
    tags.add('イヌ科');
  }
  // dog画像では『感情』『動作』を付与しない
  const isDog = (keyForDetect || '').includes('/animal/dog/') || subjectWord.includes('犬') || subjectWord.includes('子犬');
  if (!isDog) {
    if (hasEmotion) tags.add('感情');
    if (hasAction) tags.add('動作');
  }
  if (hasState) tags.add('状態');
  if (hasColor) tags.add('毛色');
  return { title, tags: Array.from(tags) };
}

async function listAnimalObjects() {
  const prefixes = [
    'images/originals/animal/cat/',
    'images/originals/animal/dog/',
  ];
  const results = [];
  for (const Prefix of prefixes) {
    let ContinuationToken = undefined;
    do {
      const resp = await r2Client.send(new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        Prefix,
        ContinuationToken,
      }));
      (resp.Contents || []).forEach(o => {
        if (!o.Key) return;
        if (o.Key.endsWith('/')) return;
        if (/-thumb\.(webp|png|jpg|jpeg)$/i.test(o.Key)) return;
        if (!/\.(png|jpg|jpeg|webp|gif)$/i.test(o.Key)) return;
        results.push(o.Key);
      });
      ContinuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
    } while (ContinuationToken);
  }
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
    const mergedTags = Array.from(new Set([...(Array.isArray(existing?.tags) ? existing.tags : []), ...tags]));
    const updated = {
      ...existing,
      title,
      imageUrl,
      thumbnailUrl,
      category,
      tags: mergedTags,
      updatedAt: now,
    };
    await redis.set(`illustration:${existingId}`, JSON.stringify(updated));
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

async function main() {
  console.log('🐾 Processing animal folder (cat/dog)...');
  const keys = await listAnimalObjects();
  if (keys.length === 0) {
    console.log('❌ No images found under: images/originals/animal/(cat|dog)/');
    return;
  }
  console.log(`📦 Found ${keys.length} files`);

  let success = 0;
  for (const key of keys) {
    try {
      const base = key.split('/').pop() || '';
      const { title, tags } = generateJapaneseTitleAndTags(base, key);
      const category = 'animals';

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


