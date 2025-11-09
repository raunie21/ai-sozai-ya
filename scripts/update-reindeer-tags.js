#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

const TAGS = ["トナカイ","動物","角","冬","雪","サンタ","そり","北欧"];
const TARGET_FILES = new Set([
  'reindeer1.png','reindeer2.png','reindeer3.png','reindeer4.png',
  'reindeer5.png','reindeer6.png','reindeer7.png','reindeer8.png'
]);

function getBaseName(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    const p = u.pathname;
    return p.split('/').pop() || '';
  } catch {
    return (url.split('/').pop() || '').trim();
  }
}

async function main() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('❌ Upstash環境変数が不足しています。 .env.local を確認してください。');
    process.exit(1);
  }
  const redis = Redis.fromEnv();

  const nextIdRaw = await redis.get('illustration:next_id');
  const nextId = Number(nextIdRaw || 0);
  if (!Number.isFinite(nextId) || nextId <= 0) {
    console.log('No illustrations found.');
    return;
  }

  const CHUNK = 300;
  let updated = 0;
  for (let start = 1; start <= nextId; start += CHUNK) {
    const end = Math.min(start + CHUNK - 1, nextId);
    const keys = Array.from({ length: end - start + 1 }, (_, i) => `illustration:${start + i}`);
    const items = await redis.mget(...keys);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const raw = items[i];
      if (!raw) continue;
      let data;
      try {
        data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch {
        continue;
      }
      const file = getBaseName(data.originalUrl || data.imageUrl || data.thumbnailUrl || '');
      if (!TARGET_FILES.has(file)) continue;

      const updatedData = {
        ...data,
        tags: TAGS,
        updatedAt: new Date().toISOString(),
      };
      await redis.set(key, JSON.stringify(updatedData));
      updated++;
      console.log(`✅ Updated ${key} (${file})`);
    }
  }
  console.log(`🎉 Done. Updated ${updated} items.`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error('💥 Error:', e);
    process.exit(1);
  });
}


