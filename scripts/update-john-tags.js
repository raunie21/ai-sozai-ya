const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

const redis = Redis.fromEnv();

const TARGET_PATH = '/images/originals/john/';
const TAGS_TO_ADD = ['アメリカ人', 'おじさん', 'ジョン', 'John'];

function mergeTags(existing) {
  const base = Array.isArray(existing) ? existing.slice() : [];
  const set = new Set(base.map(String));
  for (const t of TAGS_TO_ADD) set.add(t);
  return Array.from(set);
}

async function run() {
  const keys = await redis.keys('illustration:*');
  let updated = 0;
  for (const key of keys) {
    if (!/^illustration:\d+$/.test(key)) continue;
    const raw = await redis.get(key);
    if (!raw) continue;
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;

    const urls = [data.originalUrl, data.imageUrl, data.thumbnailUrl].filter(Boolean).map(String);
    const isJohn = urls.some((u) => u.includes(TARGET_PATH));
    if (!isJohn) continue;

    const next = { ...data, tags: mergeTags(data.tags), updatedAt: new Date().toISOString() };
    await redis.set(key, JSON.stringify(next));
    updated++;
    console.log(`Updated tags for ${key}: ${next.tags.join(', ')}`);
  }
  console.log(`Done. Updated ${updated} items.`);
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}
