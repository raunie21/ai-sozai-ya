#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

const GENERIC_TAGS = new Set([
  '食べ物','料理','食事','フード','おいしい',
  'フリー素材','商用利用OK','背景透過','イラスト','素材',
  '英数字','バリエーション'
]);

async function main() {
  const redis = Redis.fromEnv();
  console.log('🧹 Removing generic tags from food category illustrations...');

  const keys = await redis.keys('illustration:*');
  const idKeys = keys.filter(k => /^illustration:\\d+$/.test(k));

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
      const filtered = before.filter(t => !GENERIC_TAGS.has(String(t)));
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

  console.log(`🎉 Done. Scanned ${scanned} items, updated ${updated} records.`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Cleanup failed:', err);
    process.exit(1);
  });
}
