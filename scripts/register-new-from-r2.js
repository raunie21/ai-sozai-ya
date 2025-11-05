#!/usr/bin/env node

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

// Config
const ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;
const FOLDERS = ['nature', 'business', 'daily'];

if (!ACCOUNT_ID || !BUCKET_NAME || !R2_PUBLIC_URL) {
  console.error('Missing R2 env (CLOUDFLARE_R2_ACCOUNT_ID/BUCKET/ PUBLIC_URL)');
  process.exit(1);
}
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error('Missing Upstash credentials');
  process.exit(1);
}

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});
const redis = Redis.fromEnv();

function toFullWidthNumber(numStr) {
  return numStr.replace(/[0-9]/g, d => String.fromCharCode(d.charCodeAt(0) + 0xFEE0));
}
function extractTrailingNumber(baseName) {
  const m = baseName.match(/(\d+)$/);
  return m ? m[1] : '';
}

function titleAndTagsFromBase(base, folder) {
  const baseNoExt = base.replace(/\.[^.]+$/, '');
  const numStr = extractTrailingNumber(baseNoExt);
  const numSuffix = numStr ? ` ${toFullWidthNumber(numStr)}` : '';

  const starts = (prefix) => baseNoExt.toLowerCase().startsWith(prefix.toLowerCase());

  // business
  if (starts('businessBag')) return {
    title: `ビジネスバッグ${numSuffix}`,
    tags: ['ビジネスバッグ','通勤','持ち物','革','取っ手','収納','ビジネスシーン']
  };
  if (starts('businessCard')) return {
    title: `名刺${numSuffix}`,
    tags: ['名刺交換','連絡先','会社','肩書','ロゴ','紙','印刷']
  };
  if (starts('creditCard')) return {
    title: `クレジットカード${numSuffix}`,
    tags: ['クレジットカード','ICチップ','カード番号','有効期限','磁気ストライプ','決済端末','ポイント','キャッシュレス']
  };
  if (starts('curvedArrow')) return {
    title: `カーブ矢印${numSuffix}`,
    tags: ['矢印','カーブ','フロー','ナビゲーション','強調','方向','UI','図解']
  };
  if (starts('documentChart')) return {
    title: `グラフ${numSuffix}`,
    tags: ['書類','グラフ','棒グラフ','折れ線','円グラフ','統計','KPI','レポート']
  };
  if (starts('moneyCoin')) return {
    title: `コイン${numSuffix}`,
    tags: ['硬貨','スタック','積み上げ','金額','貯金','投資','家計','富']
  };
  if (starts('receipt')) return {
    title: `領収書${numSuffix}`,
    tags: ['金額','明細','日付','店名','小計','合計','税','取引']
  };
  if (starts('signature')) return {
    title: `署名${numSuffix}`,
    tags: ['サイン','契約書','筆記','ペン','署名欄','締結','書類','手続き']
  };

  // daily（buket は綴りミスを想定）
  if (starts('buket') || starts('bucket')) return {
    title: `バケツ${numSuffix}`,
    tags: ['掃除','清掃','水汲み','取っ手','収納','ベランダ','家事','用具']
  };
  if (starts('mail')) return {
    title: `メール${numSuffix}`,
    tags: ['封筒','郵便','宛名','切手','投函','受信','通信','メッセージ']
  };
  if (starts('priceTag')) return {
    title: `値札${numSuffix}`,
    tags: ['価格','吊り下げ','バーコード','割引','セール','POP','タグ穴','表示']
  };
  if (starts('recycleCan')) return {
    title: `リサイクル缶${numSuffix}`,
    tags: ['リサイクル','分別','エコ','缶回収','資源','ごみ出し','環境','リサイクルマーク']
  };
  if (starts('trashCan')) return {
    title: `ゴミ箱${numSuffix}`,
    tags: ['フタ','ペダル','分別','家庭ごみ','清掃','ダストボックス','生活','室内']
  };

  // nature
  if (starts('bamboo')) return {
    title: `竹${numSuffix}`,
    tags: ['竹林','節','笹','和風庭園','緑','成長','木質','自然']
  };
  if (starts('cherryBlossom')) return {
    title: `桜${numSuffix}`,
    tags: ['花びら','満開','春','花見','薄桃色','日本','並木','風景']
  };
  if (starts('dandelion')) return {
    title: `たんぽぽ${numSuffix}`,
    tags: ['黄色い花','綿毛','野原','春','道端','植物','草花','風景']
  };
  if (starts('morningGlory')) return {
    title: `朝顔${numSuffix}`,
    tags: ['蔓','夏','青い花','園芸','鉢植え','朝の花','つる植物','葉']
  };
  if (starts('orchid')) return {
    title: `蘭${numSuffix}`,
    tags: ['花弁','洋蘭','上品','観賞用','室内','白い花','植物','風合い']
  };
  if (starts('palmtree')) return {
    title: `ヤシの木${numSuffix}`,
    tags: ['南国','トロピカル','ビーチ','葉','幹','リゾート','影','風景']
  };
  if (starts('ricePlant')) return {
    title: `稲${numSuffix}`,
    tags: ['稲穂','田んぼ','農業','黄金色','収穫','苗','農地','風']
  };
  if (starts('rose')) return {
    title: `バラ${numSuffix}`,
    tags: ['トゲ','蕾','香り','花束','ガーデニング','赤い花','花弁','観賞']
  };
  if (starts('sunflower')) return {
    title: `ひまわり${numSuffix}`,
    tags: ['大輪','種','畑','向日性','真夏','青空','背丈','花芯']
  };
  if (starts('wheat')) return {
    title: `麦${numSuffix}`,
    tags: ['小麦','穂','畑','収穫前','黄金色','農地','風になびく','農業']
  };

  // fallback（基本的に来ない想定）
  return { title: `${folder}${numSuffix}`, tags: [] };
}

async function listR2Candidates() {
  const all = [];
  for (const folder of FOLDERS) {
    const Prefix = `images/originals/${folder}/`;
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
        const base = o.Key.split('/').pop() || '';
        if (base.startsWith('._')) return; // ignore macOS artifacts
        if (/-thumb\.(webp|png|jpg|jpeg)$/i.test(o.Key)) return;
        if (!/\.(png|jpg|jpeg|webp|gif)$/i.test(o.Key)) return;
        all.push({ key: o.Key, base, folder });
      });
      ContinuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
    } while (ContinuationToken);
  }
  return all;
}

async function getExistingOriginalUrlSet() {
  const keys = await redis.keys('illustration:*');
  const idKeys = keys.filter(k => /^illustration:\d+$/.test(k));
  const set = new Set();
  for (const k of idKeys) {
    const raw = await redis.get(k);
    if (!raw) continue;
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (data && data.originalUrl) set.add(data.originalUrl);
  }
  return set;
}

async function upsertToDb({ title, imageUrl, thumbnailUrl, originalUrl, category, tags }) {
  const now = new Date().toISOString();
  // try find existing by originalUrl
  const keys = await redis.keys('illustration:*');
  const idKeys = keys.filter(k => /^illustration:\d+$/.test(k));
  let existingId = null;
  for (const k of idKeys) {
    const raw = await redis.get(k);
    if (!raw) continue;
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (data && data.originalUrl === originalUrl) {
      existingId = data.id;
      break;
    }
  }

  if (existingId) {
    const existingRaw = await redis.get(`illustration:${existingId}`);
    const existing = typeof existingRaw === 'string' ? JSON.parse(existingRaw) : existingRaw;
    const mergedTags = Array.from(new Set([...(Array.isArray(existing?.tags) ? existing.tags : []), ...tags]));
    const updated = { ...existing, title, imageUrl, thumbnailUrl, category, tags: mergedTags, updatedAt: now };
    await redis.set(`illustration:${existingId}`, JSON.stringify(updated));
    return updated;
  } else {
    const nextId = await redis.incr('illustration:next_id');
    const payload = { id: nextId, title, imageUrl, thumbnailUrl, originalUrl, category, tags, downloads: 0, fileSize: '', dimensions: '', createdAt: now, updatedAt: now };
    await redis.set(`illustration:${nextId}`, JSON.stringify(payload));
    await redis.set(`downloads:${nextId}`, 0);
    return payload;
  }
}

async function main() {
  console.log('🚀 Registering new images from R2 (nature/business/daily) ...');
  const existingSet = await getExistingOriginalUrlSet();
  const all = await listR2Candidates();

  const newOnes = all.filter(({ key }) => !existingSet.has(`${R2_PUBLIC_URL}/${key}`));
  console.log(`📦 Found ${all.length} files under folders, ${newOnes.length} appear new.`);

  let success = 0;
  for (const { key, base, folder } of newOnes) {
    const { title, tags } = titleAndTagsFromBase(base, folder);
    // enforce 6-10 tags
    const finalTags = Array.from(new Set(tags)).slice(0, 10);
    if (finalTags.length < 6) {
      // best-effort: skip if tags too few (should not happen with our mappings)
      console.warn('⚠️ Skipping (insufficient tags):', key);
      continue;
    }
    const originalUrl = `${R2_PUBLIC_URL}/${key}`;
    const imageUrl = `${R2_PUBLIC_URL}/cdn-cgi/image/width=600,height=600,fit=cover,gravity=center/${key}`;
    const thumbnailUrl = `${R2_PUBLIC_URL}/cdn-cgi/image/width=300,height=300,fit=cover,gravity=center/${key}`;

    const created = await upsertToDb({ title, imageUrl, thumbnailUrl, originalUrl, category: folder, tags: finalTags });
    success++;
    console.log(`✅ Upserted: ${created.id} - ${title}`);
  }

  console.log(`🎉 Done. Upserted ${success}/${newOnes.length} images.`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Register failed:', err.message);
    process.exit(1);
  });
}


