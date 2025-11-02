#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const redis = Redis.fromEnv();
  console.log('🧹 Removing "グルメ" tag from food category illustrations...');

  const keys = await redis.keys('illustration:*');
  const idKeys = keys.filter(k => /^illustration:\d+$/.test(k));

  let scanned = 0;
  let updated = 0;

  for (const k of idKeys) {
    try {
      const raw = await redis.get(k);
      if (!raw) continue;
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      scanned++;

      if (!data || data.category !== 'food') continue;

      const before = Array.isArray(data.tags) ? data.tags : [];
      const filtered = before.filter(t => t !== 'グルメ');
      if (filtered.length !== before.length) {
        const id = data.id || parseInt(k.split(':')[1], 10);
        const payload = { ...data, tags: filtered, updatedAt: new Date().toISOString() };
        await redis.set(`illustration:${id}`, JSON.stringify(payload));
        updated++;
        console.log(`✅ Updated ID ${id}`);
      }
    } catch (e) {
      console.warn(`⚠️  Skip ${k}: ${e.message}`);
    }
  }

  console.log(`🎉 Done. Scanned ${scanned} items, updated ${updated} records.` );
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Cleanup failed:', err);
    process.exit(1);
  });
}
