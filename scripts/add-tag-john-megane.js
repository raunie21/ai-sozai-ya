#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

function startsWithJohn(originalUrl) {
  try {
    const u = new URL(originalUrl);
    const file = (u.pathname.split('/').pop() || '').toLowerCase();
    return file.startsWith('john-');
  } catch {
    return false;
  }
}

function mergeTag(tags, tag) {
  const set = new Set(Array.isArray(tags) ? tags : []);
  set.add(tag);
  return Array.from(set);
}

async function main() {
  const redis = Redis.fromEnv();
  console.log('➕ Adding tag "メガネ" to all john-* illustrations...');

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

      if (!data?.originalUrl || !startsWithJohn(data.originalUrl)) continue;

      const before = Array.isArray(data.tags) ? data.tags : [];
      if (before.includes('メガネ')) continue;

      const id = data.id || parseInt(k.split(':')[1], 10);
      const payload = {
        ...data,
        tags: mergeTag(before, 'メガネ'),
        updatedAt: new Date().toISOString(),
      };
      await redis.set(`illustration:${id}`, JSON.stringify(payload));
      updated++;
      console.log(`✅ Updated ID ${id}`);
    } catch (e) {
      console.warn(`⚠️  Skip ${k}: ${e.message}`);
    }
  }

  console.log(`🎉 Done. Scanned ${scanned} items, updated ${updated} records.`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Update failed:', err);
    process.exit(1);
  });
}
