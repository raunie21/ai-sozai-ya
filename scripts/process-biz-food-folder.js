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

// Args
const args = process.argv.slice(2);
const folder = (args[0] || '').toLowerCase(); // business | food | daily
if (!folder || !['business','food','daily'].includes(folder)) {
  console.log('Usage: node scripts/process-biz-food-folder.js <business|food|daily>');
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

const TAG_MAP = new Map([
  // business
  ['business', 'ビジネス'], ['office','オフィス'], ['graph','グラフ'], ['chart','グラフ'], ['presentation','プレゼン'], ['report','レポート'],
  ['meeting','会議'], ['money','お金'], ['coin','コイン'], ['yen','円'], ['stack','積み上げ'], ['3d','3D'],
  // food
  ['food','食べ物'], ['meal','食事'], ['drink','飲み物'], ['coffee','コーヒー'], ['tea','お茶'],
  ['sushi','寿司'], ['rice','ごはん'], ['noodle','麺'], ['ramen','ラーメン'], ['udon','うどん'], ['soba','そば'],
  ['pasta','パスタ'], ['spaghetti','スパゲッティ'], ['pizza','ピザ'],
  ['burger','ハンバーガー'], ['hamburger','ハンバーガー'], ['sandwich','サンドイッチ'],
  ['curry','カレー'], ['gyoza','餃子'], ['dumpling','餃子'], ['fried-rice','チャーハン'],
  ['takoyaki','たこ焼き'], ['okonomiyaki','お好み焼き'], ['miso-soup','みそ汁'], ['miso','みそ'],
  ['fruit','果物'], ['apple','りんご'], ['banana','バナナ'], ['orange','オレンジ'],
  // daily
  ['daily','日常'], ['home','家'], ['house','家'], ['room','部屋'], ['kitchen','キッチン'], ['living','リビング'],
  ['family','家族'], ['parent','親'], ['mom','母'], ['mother','母'], ['dad','父'], ['father','父'], ['baby','赤ちゃん'],
  ['kids','子供'], ['kid','子供'], ['child','子供'], ['children','子供'], ['boy','男の子'], ['girl','女の子'],
  ['school','学校'], ['study','勉強'], ['homework','宿題'], ['read','読書'], ['book','本'],
  ['work','仕事'], ['remote','在宅'], ['pc','パソコン'], ['computer','パソコン'], ['laptop','ノートPC'],
  ['life','生活'], ['daily-life','日常'], ['everyday','日常'],
  ['shopping','買い物'], ['grocery','食料品'], ['supermarket','スーパー'], ['market','市場'], ['bag','バッグ'],
  ['park','公園'], ['play','遊ぶ'], ['game','ゲーム'], ['walk','散歩'],
  ['cook','料理'], ['cooking','料理'], ['kitchenware','調理'], ['dish','料理'], ['dishes','食器'], ['wash','洗う'], ['washing','洗う'],
  ['clean','掃除'], ['cleaning','掃除'], ['vacuum','掃除機'], ['broom','ほうき'], ['mop','モップ'], ['laundry','洗濯'], ['cloth','布'], ['clothes','服'],
]);

const CATEGORY_BY_FOLDER = new Map([
  ['business','business'],
  ['food','food'],
  ['daily','daily'],
]);

function extractTrailingNumber(baseName) {
  const m = baseName.match(/(\d+)$/);
  return m ? m[1] : '';
}

function toFullWidthNumber(numStr) {
  return numStr.replace(/[0-9]/g, d => String.fromCharCode(d.charCodeAt(0) + 0xFEE0));
}

function generateJapaneseTitleAndTags(fileBase, folder) {
  const tokens = tokenizeFileName(fileBase)
    .map(t => t.replace(/\d+$/, ''))
    .filter(t => !['img', 'image', 'illust', 'illustration', 'ver', 'pose', 'a', 'b'].includes(t));

  const tags = new Set();
  const category = CATEGORY_BY_FOLDER.get(folder) || 'people';
  let subject = folder === 'business' ? 'ビジネス' : folder === 'food' ? '食べ物' : '日常';
  const found = {
    activity: new Set(), // 料理/掃除/洗濯/勉強/仕事/買い物/散歩/遊ぶ
    scene: new Set(), // 家/部屋/キッチン/公園/学校/市場
    people: new Set(), // 家族/母/父/子供/男の子/女の子/赤ちゃん
    item: new Set(), // パソコン/ノートPC/本/バッグ/掃除機 など
  };

  for (const t of tokens) {
    const mapped = TAG_MAP.get(t);
    if (mapped) {
      tags.add(mapped);
      if (['料理','掃除','洗濯','勉強','仕事','買い物','散歩','遊ぶ','在宅','読書'].includes(mapped)) found.activity.add(mapped);
      if (['家','部屋','キッチン','リビング','公園','学校','市場','スーパー'].includes(mapped)) found.scene.add(mapped);
      if (['家族','母','父','親','子供','男の子','女の子','赤ちゃん'].includes(mapped)) found.people.add(mapped);
      if (['パソコン','ノートPC','本','バッグ','掃除機','食器','服'].includes(mapped)) found.item.add(mapped);
    }
  }

  if (folder === 'business') tags.add('資料');
  if (folder === 'daily') tags.add('暮らし');

  // 料理名（food）を優先してタイトル化
  const DISH_NAMES = [
    'ラーメン','寿司','カレー','ピザ','パスタ','スパゲッティ','うどん','そば','餃子','チャーハン',
    'たこ焼き','お好み焼き','ハンバーガー','サンドイッチ','みそ汁'
  ];
  const hasTag = (name) => Array.from(tags).includes(name);
  const dishCandidate = folder === 'food' ? DISH_NAMES.find(name => hasTag(name)) : undefined;

  // 料理ごとの派生タグ（同義語など）
  if (dishCandidate) {
    switch (dishCandidate) {
      case 'ラーメン':
        tags.add('らーめん');
        tags.add('麺');
        tags.add('中華');
        break;
      case '寿司':
        tags.add('和食');
        tags.add('海鮮');
        tags.add('魚');
        break;
      case 'カレー':
        tags.add('スパイス');
        tags.add('インド');
        tags.add('ライス');
        break;
      case 'パスタ':
      case 'スパゲッティ':
        tags.add('イタリアン');
        tags.add('麺');
        break;
      case 'ピザ':
        tags.add('イタリアン');
        break;
      case 'ハンバーガー':
        tags.add('ファストフード');
        break;
      case 'サンドイッチ':
        tags.add('パン');
        break;
      case 'うどん':
      case 'そば':
        tags.add('和食');
        tags.add('麺');
        break;
      case '餃子':
        tags.add('中華');
        break;
      case 'チャーハン':
        tags.add('中華');
        tags.add('ごはん');
        break;
      case 'たこ焼き':
      case 'お好み焼き':
        tags.add('粉もの');
        tags.add('屋台');
        break;
      case 'みそ汁':
        tags.add('和食');
        break;
      default:
        break;
    }
  }

  // subject の補正（daily）
  if (folder === 'daily') {
    if (found.people.has('母')) subject = '母';
    else if (found.people.has('父')) subject = '父';
    else if (found.people.has('家族')) subject = '家族';
    else if (found.people.has('子供')) subject = '子供';
    else if (found.people.has('男の子')) subject = '男の子';
    else if (found.people.has('女の子')) subject = '女の子';
  }

  // タイトル主要語の優先順位: activity > scene > item
  let main = '';
  if (!dishCandidate) {
    if (found.activity.size > 0) main = Array.from(found.activity)[0];
    else if (found.scene.size > 0) main = Array.from(found.scene)[0];
    else if (found.item.size > 0) main = Array.from(found.item)[0];
  }

  // 末尾番号をタイトルに反映（全角）
  const baseNameNoExt = fileBase.replace(/\.[^.]+$/, '');
  const trailingNum = extractTrailingNumber(baseNameNoExt);
  const numSuffix = trailingNum ? ` ${toFullWidthNumber(trailingNum)}` : '';

  // food の場合は料理名を優先
  const title = dishCandidate
    ? `${dishCandidate}${numSuffix}`
    : (main ? `${subject} ${main}${numSuffix}` : `${subject}${numSuffix}`);

  // 派生タグの追加
  if (found.activity.has('料理')) tags.add('家事');
  if (found.activity.has('掃除') || found.item.has('掃除機')) tags.add('家事');
  if (found.activity.has('洗濯') || tags.has('服')) tags.add('家事');
  if (found.activity.has('勉強') || tags.has('宿題')) tags.add('学習');
  if (found.activity.has('仕事') || tags.has('在宅')) tags.add('ライフスタイル');
  if (found.activity.has('買い物') || tags.has('スーパー') || tags.has('市場')) tags.add('買い物');

  return { title, tags: Array.from(tags), category };
}

async function listObjects(folder) {
  const Prefix = `images/originals/${folder}/`;
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
      if (o.Key.endsWith('/')) return;
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
  console.log(`📊 Processing folder: ${folder} ...`);
  const keys = await listObjects(folder);
  if (keys.length === 0) {
    console.log(`❌ No images found under: images/originals/${folder}/`);
    return;
  }
  console.log(`📦 Found ${keys.length} files`);

  let success = 0;
  for (const key of keys) {
    try {
      const base = key.split('/').pop() || '';
      const { title, tags, category } = generateJapaneseTitleAndTags(base, folder);

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




