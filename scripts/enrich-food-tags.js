#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

function unique(array) {
  return Array.from(new Set(array.filter(Boolean)));
}

function normalizeTitle(title = '') {
  return String(title).trim();
}

function guessDishFromTitle(title) {
  // 優先的に含有チェック（日本語・一般名）
  const t = title.toLowerCase();
  const pairs = [
    ['ラーメン', ['ラーメン','らーめん','麺','中華','丼','醤油','味噌','豚骨']],
    ['スパゲッティ', ['スパゲッティ','パスタ','イタリアン','麺','トマト','ソース']],
    ['パスタ', ['パスタ','スパゲッティ','イタリアン','麺','トマト','ソース']],
    ['そば', ['そば','和食','麺','日本料理','つゆ']],
    ['うどん', ['うどん','和食','麺','日本料理','だし']],
    ['サンドイッチ', ['サンドイッチ','パン','軽食','具材','ランチ']],
    ['寿司', ['寿司','和食','海鮮','魚','にぎり']],
    ['カレー', ['カレー','スパイス','ライス','インド','ルウ']],
    ['ピザ', ['ピザ','イタリアン','チーズ','トマト','生地']],
    ['餃子', ['餃子','中華','点心','焼き餃子','にんにく']],
    ['チャーハン', ['チャーハン','中華','炒飯','ごはん','卵']],
    ['みそ汁', ['みそ汁','和食','味噌','汁物','だし']],
    ['たこ焼き', ['たこ焼き','粉もの','屋台','関西','ソース']],
    ['お好み焼き', ['お好み焼き','粉もの','関西','キャベツ','ソース']],
    ['りんご', ['りんご','果物','フルーツ','アップル','デザート']],
    ['バナナ', ['バナナ','果物','フルーツ','デザート','甘い']],
    ['オレンジ', ['オレンジ','果物','フルーツ','柑橘','デザート']],
    ['コーヒー', ['コーヒー','飲み物','カフェ','ドリンク','ホット']],
    ['紅茶', ['紅茶','飲み物','カフェ','ドリンク','ティー']]
  ];
  for (const [keyword, tags] of pairs) {
    if (title.includes(keyword) || t.includes(keyword)) {
      return { dish: keyword, tags };
    }
  }
  // デフォルト（食べ物の汎用タグ）
  return { dish: '食べ物', tags: ['食べ物','料理','食事','フード','おいしい'] };
}

function generateTagsFromTitle(title) {
  const norm = normalizeTitle(title);
  const { dish, tags } = guessDishFromTitle(norm);
  // タイトル由来の補助タグも追加
  const extra = [];
  if (/\d/.test(norm)) extra.push('バリエーション');
  if (/[Ａ-Ｚａ-ｚ0-9]/.test(norm)) extra.push('英数字');
  // 合成
  const result = unique([dish, ...tags, ...extra]);
  // 5件以上を保証（足りない場合は汎用語で埋める）
  const fillers = ['フリー素材','商用利用OK','背景透過','イラスト','素材'];
  let i = 0;
  while (result.length < 5 && i < fillers.length) {
    result.push(fillers[i++]);
  }
  return result;
}

async function main() {
  const redis = Redis.fromEnv();
  console.log('🍽️ Enriching tags for food items with empty tags...');

  const keys = await redis.keys('illustration:*');
  const idKeys = keys.filter(k => /^illustration:\d+$/.test(k));

  let scanned = 0;
  let updated = 0;

  for (const k of idKeys) {
    try {
      const raw = await redis.get(k);
      if (!raw) continue;
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      scanned++;

      if (!data || data.category !== 'food') continue;

      const currentTags = Array.isArray(data.tags) ? data.tags : [];
      if (currentTags.length > 0) continue; // タグが空のものだけ

      const title = data.title || '';
      const newTags = generateTagsFromTitle(title);
      const payload = { ...data, tags: newTags, updatedAt: new Date().toISOString() };
      const id = data.id || parseInt(k.split(':')[1], 10);
      await redis.set(`illustration:${id}`, JSON.stringify(payload));
      updated++;
      console.log(`✅ Updated ID ${id} (${title}) -> ${newTags.join(', ')}`);
    } catch (e) {
      console.warn(`⚠️  Skip ${k}: ${e.message}`);
    }
  }

  console.log(`🎉 Done. Scanned ${scanned} items, updated ${updated} records.`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Enrichment failed:', err);
    process.exit(1);
  });
}
