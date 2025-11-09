#!/usr/bin/env node

/**
 * 指定ファイル群のカテゴリをピンポイントで修正します。
 * - book-pen-cup*.png → business
 * - (kids-)?boy-*(suprised/surprised)* → people
 * いずれも christmas 配下は対象外。現在 daily のものを優先して修正します。
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

function targetCategory(baseLower) {
  if (/^book-pen-cup\d*\.png$/.test(baseLower)) {
    return 'business';
  }
  if (/^(kids-)?boy-.*(suprised|surprised)\d*\.png$/.test(baseLower)) {
    return 'people';
  }
  return null;
}

async function main() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('❌ Upstashの環境変数が不足しています。 .env.local を確認してください。');
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
    const rows = await redis.mget(...keys);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const raw = rows[i];
      if (!raw) continue;
      let data;
      try {
        data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch {
        continue;
      }
      const originalUrl = data.originalUrl || data.imageUrl || data.thumbnailUrl || '';
      if (isChristmasPath(originalUrl)) continue;
      const base = getBaseName(originalUrl).toLowerCase();
      const desired = targetCategory(base);
      if (!desired) continue;
      if (data.category === desired) continue;
      const updatedData = { ...data, category: desired, updatedAt: new Date().toISOString() };
      await redis.set(key, JSON.stringify(updatedData));
      updated++;
      console.log(`✅ ${key}: ${data.category} -> ${desired} (${base})`);
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


