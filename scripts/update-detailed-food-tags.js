#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

const updates = [
  // Pancake
  { id: 369, tags: ['スイーツ','デザート','朝食','メープルシロップ','ホイップクリーム','ふわふわ','カフェ'] },
  { id: 370, tags: ['スイーツ','デザート','朝食','メープルシロップ','ホイップクリーム','ふわふわ','カフェ'] },
  // Toasts
  { id: 384, tags: ['パン','朝食','バター','トースト','焼き目','ベーカリー','ジャム'] },
  { id: 385, tags: ['パン','朝食','バター','トースト','焼き目','ベーカリー','ジャム'] },
  { id: 386, tags: ['パン','朝食','バター','トースト','焼き目','ベーカリー','ジャム'] },
  // Yakisoba (modifications applied)
  { id: 391, tags: ['焼きそば','ソース','屋台','中華麺','鉄板','祭り','キャベツ'] },
  // Zakkokumai (modifications applied)
  { id: 392, tags: ['雑穀米','玄米','ヘルシー','主食','健康','和食','ごはん'] },
];

async function main() {
  const redis = Redis.fromEnv();
  console.log('✍️  Overwriting detailed tags for specific food items...');

  let updated = 0;

  for (const { id, tags } of updates) {
    const key = `illustration:${id}`;
    const raw = await redis.get(key);
    if (!raw) {
      console.warn(`⚠️  Skip ID ${id}: not found`);
      continue;
    }
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const payload = {
      ...data,
      tags,
      updatedAt: new Date().toISOString(),
    };
    await redis.set(key, JSON.stringify(payload));
    updated++;
    console.log(`✅ Updated ID ${id}`);
  }

  console.log(`🎉 Done. Updated ${updated}/${updates.length} records.`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Update failed:', err);
    process.exit(1);
  });
}
