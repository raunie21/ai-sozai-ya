#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error('Missing Upstash credentials in .env.local');
  process.exit(1);
}

const redis = Redis.fromEnv();

async function main() {
  console.log('🔁 Migrating category: kids -> people');
  const keys = await redis.keys('illustration:*');
  const idKeys = keys.filter(k => /^illustration:\d+$/.test(k));
  let updated = 0;
  for (const k of idKeys) {
    const raw = await redis.get(k);
    if (!raw) continue;
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (data?.category === 'kids') {
      const newData = { ...data, category: 'people', updatedAt: new Date().toISOString() };
      await redis.set(k, JSON.stringify(newData));
      updated++;
      console.log(`✅ Updated ${k} -> people`);
    }
  }
  console.log(`🎉 Done. Updated ${updated}/${idKeys.length} records.`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Migration failed:', err);
    process.exit(1);
  });
}

