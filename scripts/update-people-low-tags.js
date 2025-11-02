#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

function getBaseFromUrl(originalUrl) {
  try {
    const u = new URL(originalUrl);
    const file = u.pathname.split('/').pop() || '';
    return file.replace(/\.[^.]+$/, '').replace(/\d+$/, '');
  } catch {
    return '';
  }
}

function mergeUnique(a, b) {
  const set = new Set([...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])].filter(Boolean));
  return Array.from(set);
}

// 合意済みのベース→追加タグ
const additionsByBase = {
  // john系列
  'john-angry': ['男性','怒る','表情','眉間','叫ぶ','ポーズ'],
  'john-crying': ['男性','泣く','涙','悲しい','うつむく','表情'],
  'john-fight': ['男性','戦う','構え','アクション','格闘','パンチ'],
  'john-happy': ['男性','笑顔','喜ぶ','表情','口角','ポーズ'],
  'john-laugh': ['男性','大笑い','口を開ける','表情','感情','コミカル'],
  'john-nice': ['男性','サムズアップ','ジェスチャー','親指','肯定','ポーズ'],
  'john-smelling': ['男性','匂いを嗅ぐ','鼻','リアクション','表情','驚き'],
  // sarah
  'sarah-laugh': ['女性','笑顔','大笑い','明るい','表情','感情'],
  'sarah-yelling': ['女性','叫ぶ','怒鳴る','口を開ける','強調','表情'],
  // man
  'man-excited': ['男性','興奮','ガッツポーズ','喜ぶ','表情','勢い'],
  // grandma*
  'grandma-fingerpoint': ['おばあちゃん','指さし','ジェスチャー','注意','ポーズ','高齢者'],
  'grandma-hi': ['おばあちゃん','挨拶','手を振る','にこやか','ポーズ','高齢者'],
  'grandma-idk': ['おばあちゃん','分からない','肩をすくめる','困惑','ジェスチャー','高齢者'],
  'grandma-pray': ['おばあちゃん','お祈り','合掌','祈る','静か','高齢者'],
  'grandma-scare': ['おばあちゃん','驚く','びっくり','不安','表情','高齢者'],
  'grandma-scared': ['おばあちゃん','驚く','びっくり','不安','表情','高齢者'],
  // grandmother*
  'grandmother-raisehand': ['おばあちゃん','挙手','参加','返事','ジェスチャー','高齢者'],
  // woman*
  'woman-raisehand': ['女性','挙手','手を挙げる','参加','返答','ジェスチャー'],
  // grandfather*
  'grandfather-raisehand': ['おじいちゃん','挙手','返事','ジェスチャー','高齢者','ポーズ'],
};

async function main() {
  const redis = Redis.fromEnv();
  console.log('✍️  Updating people items (<=4 tags) with agreed additions...');

  const keys = await redis.keys('illustration:*');
  const idKeys = keys.filter(k => /^illustration:\d+$/.test(k));

  let scanned = 0;
  let updated = 0;

  for (const k of idKeys) {
    try {
      const raw = await redis.get(k);
      if (!raw) continue;
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!data || data.category !== 'people') continue;
      const current = Array.isArray(data.tags) ? data.tags : [];
      if (current.length > 4) continue; // 対象: 4個以下

      const base = getBaseFromUrl(data.originalUrl || '');
      const add = additionsByBase[base];
      if (!add || add.length === 0) continue;

      const merged = mergeUnique(current, add);
      const id = data.id || parseInt(k.split(':')[1], 10);
      const payload = { ...data, tags: merged, updatedAt: new Date().toISOString() };
      await redis.set(`illustration:${id}`, JSON.stringify(payload));
      updated++;
      scanned++;
      console.log(`✅ Updated ID ${id} (${base}) -> +${add.join(', ')}`);
    } catch (e) {
      console.warn(`⚠️  Skip ${k}: ${e.message}`);
    }
  }

  console.log(`🎉 Done. Updated ${updated} records.`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Update failed:', err);
    process.exit(1);
  });
}
