#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

function mergeUnique(a, b) {
  const set = new Set([...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])].filter(Boolean));
  return Array.from(set);
}

const ranges = {
  bread: [343, 344, 345, 346],
  ramen: [371, 372, 373],
  whiteRice: [374, 375],
  rice: [376, 377],
  sandwiches: [378, 379, 380, 381],
  soba: [382, 383],
  udon: [387, 388, 389, 390],
};

const additionsById = {};

// パン１〜４: トースト, バター, ジャム
for (const id of ranges.bread) {
  additionsById[id] = ['トースト','バター','ジャム'];
}
// ラーメン１〜３: 卵、餃子, ねぎ, 海苔
for (const id of ranges.ramen) {
  additionsById[id] = ['卵','餃子','ねぎ','海苔'];
}
// 白米１〜２: 米, ご飯, 白飯, 和食, 主食
for (const id of ranges.whiteRice) {
  additionsById[id] = ['米','ご飯','白飯','和食','主食'];
}
// お米１〜２: 米, 白飯, 主食, 和食, 日本
for (const id of ranges.rice) {
  additionsById[id] = ['米','白飯','主食','和食','日本'];
}
// サンドイッチ１〜４: レタス, ハム, チーズ, カフェ, 卵, マヨネーズ, ピクニック, トマト
for (const id of ranges.sandwiches) {
  additionsById[id] = ['レタス','ハム','チーズ','カフェ','卵','マヨネーズ','ピクニック','トマト'];
}
// そば１〜２: つゆ, ねぎ, わさび, ざるそば, 海苔, 和食
for (const id of ranges.soba) {
  additionsById[id] = ['つゆ','ねぎ','わさび','ざるそば','海苔','和食'];
}
// うどん１〜３: だし, ねぎ, 天ぷら, 和食, 卵, 生姜, 天かす, つゆ
for (const id of ranges.udon) {
  additionsById[id] = ['だし','ねぎ','天ぷら','和食','卵','生姜','天かす','つゆ'];
}

async function main() {
  const redis = Redis.fromEnv();
  console.log('➕ Merging user-specified detailed tags into food items...');

  let updated = 0;
  for (const [idStr, addList] of Object.entries(additionsById)) {
    const id = Number(idStr);
    const key = `illustration:${id}`;
    const raw = await redis.get(key);
    if (!raw) {
      console.warn(`⚠️  Skip ID ${id}: not found`);
      continue;
    }
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (data?.category !== 'food') {
      console.warn(`⚠️  Skip ID ${id}: not food category`);
      continue;
    }
    const current = Array.isArray(data.tags) ? data.tags : [];
    const merged = mergeUnique(current, addList);
    const payload = { ...data, tags: merged, updatedAt: new Date().toISOString() };
    await redis.set(key, JSON.stringify(payload));
    updated++;
    console.log(`✅ Updated ID ${id}: +${addList.join(', ')}`);
  }
  console.log(`🎉 Done. Updated ${updated}/${Object.keys(additionsById).length} records.`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Update failed:', err);
    process.exit(1);
  });
}
