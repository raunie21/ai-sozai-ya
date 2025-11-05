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

// Args: --folders=nature,business,daily
const args = process.argv.slice(2);
const foldersArg = (args.find(a => a.startsWith('--folders=')) || '--folders=nature,business,daily').split('=')[1];
const targetFolders = foldersArg.split(',').map(s => s.trim()).filter(Boolean);

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

function tokenizeFileName(name) {
  const noExt = name.replace(/\.[^.]+$/, '');
  const withDashes = noExt.replace(/([a-z])([A-Z])/g, '$1-$2');
  return withDashes
    .toLowerCase()
    .split(/[\-\_\s]+/)
    .filter(Boolean);
}

function toFullWidthNumber(numStr) {
  return numStr.replace(/[0-9]/g, d => String.fromCharCode(d.charCodeAt(0) + 0xFEE0));
}

function extractTrailingNumber(baseName) {
  const m = baseName.match(/(\d+)$/);
  return m ? m[1] : '';
}

const TAG_MAP_COMMON = new Map([
  // general
  ['3d','3D'], ['ai','AI'], ['vector','ベクター'], ['illustration','イラスト'],
]);

const TAG_MAP_BUSINESS = new Map([
  ['business','ビジネス'], ['office','オフィス'], ['meeting','会議'], ['presentation','プレゼン'], ['report','レポート'],
  ['graph','グラフ'], ['chart','グラフ'], ['bar','棒グラフ'], ['pie','円グラフ'], ['line','折れ線グラフ'],
  ['money','お金'], ['coin','コイン'], ['yen','円'], ['cash','現金'], ['wallet','財布'],
  ['credit','クレジットカード'], ['card','カード'], ['creditcard','クレジットカード'], ['credit-card','クレジットカード'],
  ['payment','支払い'], ['cashless','キャッシュレス'], ['shopping','ショッピング'],
  ['invoice','請求書'], ['receipt','領収書'], ['contract','契約'], ['stamp','印鑑'], ['approved','承認'], ['denied','否認'], ['signature','署名'],
  ['document','書類'], ['arrow','矢印'], ['bag','ビジネスバッグ'],
  ['pc','パソコン'], ['computer','パソコン'], ['laptop','ノートPC'], ['smartphone','スマホ'], ['tablet','タブレット'],
]);

const TAG_MAP_DAILY = new Map([
  ['daily','日常'], ['home','家'], ['house','家'], ['room','部屋'], ['kitchen','キッチン'], ['living','リビング'],
  ['family','家族'], ['parent','親'], ['mom','母'], ['mother','母'], ['dad','父'], ['father','父'], ['baby','赤ちゃん'],
  ['kids','子供'], ['kid','子供'], ['child','子供'], ['children','子供'], ['boy','男の子'], ['girl','女の子'],
  ['school','学校'], ['study','勉強'], ['homework','宿題'], ['read','読書'], ['book','本'],
  ['work','仕事'], ['remote','在宅'], ['pc','パソコン'], ['computer','パソコン'], ['laptop','ノートPC'],
  ['life','生活'], ['daily-life','日常'], ['everyday','日常'], ['shopping','買い物'], ['grocery','食料品'],
  ['supermarket','スーパー'], ['market','市場'], ['bag','バッグ'],
  ['park','公園'], ['play','遊ぶ'], ['game','ゲーム'], ['walk','散歩'], ['mail','メール'], ['pricetag','値札'], ['price','価格'], ['tag','タグ'], ['recycle','リサイクル'], ['trash','ゴミ箱'], ['bin','ゴミ箱'],
  ['cook','料理'], ['cooking','料理'], ['kitchenware','調理'], ['dish','料理'], ['dishes','食器'], ['wash','洗う'], ['washing','洗う'],
  ['clean','掃除'], ['cleaning','掃除'], ['vacuum','掃除機'], ['broom','ほうき'], ['mop','モップ'], ['laundry','洗濯'], ['cloth','布'], ['clothes','服'],
]);

const TAG_MAP_NATURE = new Map([
  ['nature','自然'], ['scenery','風景'], ['landscape','風景'], ['view','風景'],
  ['forest','森'], ['wood','森'], ['woods','森'], ['tree','木'], ['trees','木'], ['leaf','葉'], ['leaves','葉'],
  ['flower','花'], ['flowers','花'], ['blossom','開花'], ['sakura','桜'], ['cherry','桜'], ['rose','バラ'], ['tulip','チューリップ'], ['sunflower','ひまわり'],
  ['plant','植物'], ['plants','植物'], ['indoorplant','観葉植物'], ['indoorplants','観葉植物'],
  ['mountain','山'], ['mountains','山'], ['river','川'], ['lake','湖'], ['sea','海'], ['ocean','海'], ['beach','砂浜'],
  ['sky','空'], ['cloud','雲'], ['clouds','雲'], ['sunset','夕日'], ['sunrise','朝日'], ['night','夜空'], ['star','星'], ['stars','星'], ['moon','月'], ['sun','太陽'],
  ['rain','雨'], ['snow','雪'], ['wind','風'], ['rainbow','虹'], ['waterfall','滝'],
  ['grass','草原'], ['field','野原'], ['desert','砂漠'], ['rock','岩場'], ['moss','苔'], ['bamboo','竹'], ['mushroom','きのこ'], ['wheat','麦'], ['rice','稲'],
  ['spring','春'], ['summer','夏'], ['autumn','秋'], ['fall','秋'], ['winter','冬'],
]);

function ensureTagCount(baseTags, folder) {
  const t = new Set(baseTags);
  if (folder === 'business') {
    t.add('資料');
  } else if (folder === 'daily') {
    t.add('暮らし');
  } else if (folder === 'nature') {
    t.add('風景');
  }
  // 共通で少なければ補完
  const COMMON_FALLBACK = ['イラスト', '無料素材', '高画質', 'シンプル', '背景透過'];
  for (const add of COMMON_FALLBACK) {
    if (t.size >= 6) break;
    t.add(add);
  }
  return Array.from(t).slice(0, 10);
}

function expandDerivedTags(folder, baseTags) {
  const t = new Set(baseTags);
  // business derived
  if (t.has('クレジットカード')) {
    ['キャッシュレス','決済','支払い','ショッピング','金融'].forEach(v => t.add(v));
  }
  if (t.has('領収書')) {
    ['経費','会計','記帳'].forEach(v => t.add(v));
  }
  if (t.has('グラフ')) {
    ['データ','統計','分析'].forEach(v => t.add(v));
  }
  if (t.has('コイン') || t.has('円')) {
    ['お金','通貨','金融','貯金'].forEach(v => t.add(v));
  }
  if (t.has('署名') || t.has('契約') || t.has('印鑑')) {
    ['書類','手続き'].forEach(v => t.add(v));
  }
  // daily derived
  if (t.has('掃除') || t.has('掃除機')) t.add('家事');
  if (t.has('洗濯') || t.has('服')) t.add('家事');
  if (t.has('料理')) ['家事','キッチン'].forEach(v => t.add(v));
  if (t.has('勉強') || t.has('読書')) t.add('学習');
  if (t.has('買い物') || t.has('市場') || t.has('スーパー')) t.add('買い物');
  // nature derived
  if (t.has('桜')) ['春','花見','花'].forEach(v => t.add(v));
  if (t.has('ひまわり')) ['夏','花','畑'].forEach(v => t.add(v));
  if (t.has('バラ')) ['花','園芸'].forEach(v => t.add(v));
  if (t.has('竹')) ['和風','植物'].forEach(v => t.add(v));
  if (t.has('森') || t.has('木') || t.has('植物')) ['自然','緑'].forEach(v => t.add(v));
  if (t.has('海') || t.has('川') || t.has('湖') || t.has('滝')) ['水','自然'].forEach(v => t.add(v));
  if (t.has('空') || t.has('雲') || t.has('夕日') || t.has('朝日') || t.has('星') || t.has('月')) ['空模様'].forEach(v => t.add(v));
  return t;
}

function generateTitleAndTags(fileBase, folder) {
  const baseNameNoExt = fileBase.replace(/\.[^.]+$/, '');
  const tokens = tokenizeFileName(fileBase).map(t => t.replace(/\d+$/, ''));

  const tags = new Set();
  let subject = folder === 'business' ? 'ビジネス' : folder === 'daily' ? '日常' : '自然';

  const applyMap = (map) => {
    for (const tk of tokens) {
      const mapped = map.get(tk);
      if (mapped) tags.add(mapped);
    }
  };

  applyMap(TAG_MAP_COMMON);
  if (folder === 'business') applyMap(TAG_MAP_BUSINESS);
  if (folder === 'daily') applyMap(TAG_MAP_DAILY);
  if (folder === 'nature') applyMap(TAG_MAP_NATURE);

  // タイトルの主要語推定
  const PRIORITY_SETS = {
    business: [
      ['クレジットカード','請求書','領収書','契約','印鑑','承認','否認','財布','支払い','キャッシュレス','グラフ','プレゼン','会議'],
      ['パソコン','ノートPC','スマホ','オフィス']
    ],
    daily: [
      ['料理','掃除','洗濯','勉強','読書','買い物','在宅','遊ぶ','散歩'],
      ['家族','母','父','子供','男の子','女の子'],
      ['家','部屋','キッチン','リビング','公園','学校','市場','スーパー']
    ],
    nature: [
      ['桜','ひまわり','バラ','チューリップ','花','植物','観葉植物'],
      ['山','海','川','湖','滝','森','草原','砂漠','岩場'],
      ['空','雲','夕日','朝日','夜空','星','月','太陽'],
      ['春','夏','秋','冬']
    ]
  };

  const pickMain = () => {
    const groups = PRIORITY_SETS[folder] || [];
    for (const group of groups) {
      for (const g of group) {
        if (tags.has(g)) return g;
      }
    }
    return '';
  };

  const trailingNum = extractTrailingNumber(baseNameNoExt);
  const numSuffix = trailingNum ? ` ${toFullWidthNumber(trailingNum)}` : '';
  const main = pickMain();
  const title = main ? `${main}${numSuffix}` : `${subject}${numSuffix}`;

  const expanded = expandDerivedTags(folder, tags);
  const ensuredTags = ensureTagCount(expanded, folder);
  return { title, tags: ensuredTags, category: folder };
}

async function listR2KeysUnder(folder) {
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
      const base = o.Key.split('/').pop() || '';
      if (base.startsWith('._')) return; // ignore macOS dot-underscore artifacts
      if (/-thumb\.(webp|png|jpg|jpeg)$/i.test(o.Key)) return;
      if (!/\.(png|jpg|jpeg|webp|gif)$/i.test(o.Key)) return;
      results.push({ key: o.Key, lastModified: o.LastModified ? new Date(o.LastModified).toISOString() : '' });
    });
    ContinuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return results;
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

async function main() {
  console.log('🔎 Planning new proposals from R2...');
  console.log('Folders:', targetFolders.join(', '));

  const existingSet = await getExistingOriginalUrlSet();

  const allKeys = [];
  for (const folder of targetFolders) {
    const keys = await listR2KeysUnder(folder);
    allKeys.push(...keys.map(k => ({ ...k, folder })));
  }

  // Filter: only those not yet in DB
  const candidates = allKeys.filter(({ key }) => {
    const orig = `${R2_PUBLIC_URL}/${key}`;
    return !existingSet.has(orig);
  });

  console.log(`Found ${allKeys.length} files under folders, ${candidates.length} appear new (not in DB).`);

  const proposals = candidates.map(({ key, folder }) => {
    const base = key.split('/').pop() || '';
    const { title, tags, category } = generateTitleAndTags(base, folder);
    return {
      key,
      category,
      title,
      tags,
      originalUrl: `${R2_PUBLIC_URL}/${key}`,
      imageUrl: `${R2_PUBLIC_URL}/cdn-cgi/image/width=600,height=600,fit=cover,gravity=center/${key}`,
      thumbnailUrl: `${R2_PUBLIC_URL}/cdn-cgi/image/width=300,height=300,fit=cover,gravity=center/${key}`,
    };
  });

  // Sort for stable output
  proposals.sort((a, b) => a.key.localeCompare(b.key));

  // Output JSON for consumption
  console.log(JSON.stringify({ count: proposals.length, proposals }, null, 2));
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Planning failed:', err.message);
    process.exit(1);
  });
}


