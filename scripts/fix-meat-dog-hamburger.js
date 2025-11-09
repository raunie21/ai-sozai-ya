#!/usr/bin/env node

/**
 * daily のまま残っている「ミートスパゲッティ」「ハンバーガー」「犬」の画像を
 * それぞれ food / animals に再分類します（christmas配下は除外）。
 */

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

function getBaseName(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    return (u.pathname.split('/').pop() || '').trim();
  } catch {
    return (url.split('/').pop() || '').trim();
  }
}

function isChristmasPath(url) {
  try {
    const u = new URL(url);
    return u.pathname.includes('/images/originals/daily/christmas/');
  } catch {
    return (url || '').includes('/images/originals/daily/christmas/');
  }
}

function classifySpecial(baseLower) {
  // 犬 → animals
  if (/^%20?dog|^dog-/.test(baseLower)) return 'animals';

  // ハンバーガー（スペルの揺れ含む）→ food
  if (/ham?burger\d*/i.test(baseLower) || /humburger\d*/i.test(baseLower)) return 'food';

  // ミートスパゲッティ（スペル揺れ spagehtti/spaghetti）→ food
  if (/meat-?spag(e|h)etti\d*/i.test(baseLower) || /meat-?spagehtti\d*/i.test(baseLower)) return 'food';

  return null;
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
    console.log('No illustrations.');
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
      // daily かつ christmas配下でないもののみ対象
      if (data.category !== 'daily') continue;
      const originalUrl = data.originalUrl || data.imageUrl || data.thumbnailUrl || '';
      if (isChristmasPath(originalUrl)) continue;

      const baseLower = (getBaseName(originalUrl) || '').toLowerCase();
      if (!baseLower) continue;

      const newCat = classifySpecial(baseLower);
      if (newCat && newCat !== data.category) {
        const updatedData = { ...data, category: newCat, updatedAt: new Date().toISOString() };
        await redis.set(key, JSON.stringify(updatedData));
        updated++;
        console.log(`✅ ${key}: daily -> ${newCat} (${baseLower})`);
      }
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


