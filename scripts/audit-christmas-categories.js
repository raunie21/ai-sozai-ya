#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

function isChristmasPath(url) {
  try {
    const u = new URL(url);
    return u.pathname.includes('/images/originals/daily/christmas/');
  } catch {
    return (url || '').includes('/images/originals/daily/christmas/');
  }
}

function getBaseName(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    return (u.pathname.split('/').pop() || '').trim();
  } catch {
    return (url.split('/').pop() || '').trim();
  }
}

async function main() {
  const redis = Redis.fromEnv();
  const nextIdRaw = await redis.get('illustration:next_id');
  const nextId = Number(nextIdRaw || 0);
  let total = 0;
  let dailyCount = 0;
  for (let id = 1; id <= nextId; id += 300) {
    const end = Math.min(id + 299, nextId);
    const keys = Array.from({ length: end - id + 1 }, (_, i) => `illustration:${id + i}`);
    const rows = await redis.mget(...keys);
    rows.forEach((row, idx) => {
      if (!row) return;
      const data = typeof row === 'string' ? JSON.parse(row) : row;
      const url = data.originalUrl || data.imageUrl || data.thumbnailUrl || '';
      if (!isChristmasPath(url)) return;
      total++;
      if (data.category === 'daily') dailyCount++;
      console.log(`${id + idx}\t${data.category}\t${getBaseName(url)}`);
    });
  }
  console.log(`SUMMARY: total_christmas=${total} daily=${dailyCount}`);
}

if (require.main === module) {
  main().catch(e => {
    console.error(e);
    process.exit(1);
  });
}


