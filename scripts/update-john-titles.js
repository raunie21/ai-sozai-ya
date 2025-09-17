const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

const redis = Redis.fromEnv();

const TARGET_PATH = '/images/originals/john/';

function replaceTitle(title) {
  if (!title || typeof title !== 'string') return title;
  return title.replace(/John/gi, 'ジョン');
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

    const newTitle = replaceTitle(data.title);
    if (newTitle === data.title) continue;

    const next = { ...data, title: newTitle, updatedAt: new Date().toISOString() };
    await redis.set(key, JSON.stringify(next));
    updated++;
    console.log(`Updated title for ${key}: ${data.title} -> ${newTitle}`);
  }
  console.log(`Done. Updated ${updated} items.`);
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}
