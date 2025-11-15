#!/usr/bin/env node

/**
 * 指定ファイル名（ベース名）のイラストURLに ?v=xxx を付与してキャッシュをバイパスします。
 * 例: node scripts/bust-cache-version.js cherryBlossom1.png 20251112
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

function addVersionParam(url, v) {
  if (!url) return url;
  if (/\?v=/.test(url)) {
    return url.replace(/([?&])v=[^&]+/, `$1v=${v}`);
  }
  return url + (url.includes('?') ? `&v=${v}` : `?v=${v}`);
}

async function main() {
  const baseFile = process.argv[2];
  const version = process.argv[3] || String(Date.now());
  if (!baseFile) {
    console.error('Usage: node scripts/bust-cache-version.js <baseFileName.png> [version]');
    process.exit(1);
  }

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

  let updated = 0;
  const CHUNK = 300;
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
      const url = data.originalUrl || data.imageUrl || data.thumbnailUrl || '';
      const base = getBaseName(url);
      if (base !== baseFile) continue;

      const updatedData = {
        ...data,
        imageUrl: addVersionParam(data.imageUrl, version),
        thumbnailUrl: addVersionParam(data.thumbnailUrl, version),
        originalUrl: addVersionParam(data.originalUrl, version),
        updatedAt: new Date().toISOString(),
      };
      await redis.set(key, JSON.stringify(updatedData));
      updated++;
      console.log(`✅ ${key} version bumped -> v=${version}`);
    }
  }

  console.log(`🎉 Done. Updated ${updated} items for ${baseFile}.`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error('💥 Error:', e);
    process.exit(1);
  });
}


