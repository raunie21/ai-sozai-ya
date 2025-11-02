#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const redis = Redis.fromEnv();
  console.log('🔎 Listing food items with 4 or fewer tags...');

  const keys = await redis.keys('illustration:*');
  const idKeys = keys.filter(k => /^illustration:\d+$/.test(k));

  const results = [];
  for (const k of idKeys) {
    try {
      const raw = await redis.get(k);
      if (!raw) continue;
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!data || data.category !== 'food') continue;
      const tags = Array.isArray(data.tags) ? data.tags : [];
      if (tags.length <= 4) {
        results.push({ id: data.id, title: data.title || '', tags });
      }
    } catch (e) {
      // skip malformed
    }
  }

  results.sort((a,b) => a.id - b.id);
  console.log(JSON.stringify({ count: results.length, items: results }, null, 2));
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 List failed:', err);
    process.exit(1);
  });
}
