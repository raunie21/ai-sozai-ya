#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error('Missing Upstash credentials in .env.local');
  process.exit(1);
}

const redis = Redis.fromEnv();

const args = process.argv.slice(2);
const needleRaw = args[0] || '';
if (!needleRaw) {
  console.log('Usage: node scripts/enforce-nature-for-needle.js <needle>');
  console.log('Example: node scripts/enforce-nature-for-needle.js indoorplants');
  process.exit(1);
}
const needle = needleRaw.toLowerCase();

async function listAllIllustrations() {
  const keys = await redis.keys('illustration:*');
  const idKeys = keys.filter(k => /^illustration:\d+$/.test(k));
  const list = [];
  for (const k of idKeys) {
    const raw = await redis.get(k);
    if (!raw) continue;
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (data && typeof data.id === 'number') list.push(data);
  }
  return list;
}

function matchesNeedle(ill) {
  const arr = [ill?.originalUrl, ill?.imageUrl, ill?.thumbnailUrl, ill?.title].map(x => (x || '').toString().toLowerCase());
  return arr.some(v => v.includes(needle));
}

async function main() {
  console.log(`🌿 Enforce nature-only for needle="${needle}"`);
  const ills = await listAllIllustrations();
  const matches = ills.filter(matchesNeedle);
  if (matches.length === 0) {
    console.log('❌ No illustrations matched the needle');
    return;
  }
  console.log(`📦 Matched ${matches.length} illustrations`);

  // グルーピング: originalUrl 単位
  const groups = new Map();
  for (const ill of matches) {
    const key = ill.originalUrl || ill.imageUrl || `id:${ill.id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(ill);
  }

  let kept = 0, deleted = 0, updated = 0;
  for (const [key, group] of groups.entries()) {
    // 自然カテゴリがあればそれを残し、他は削除
    let nature = group.find(g => g.category === 'nature');
    if (!nature) {
      // なければ先頭を nature に更新
      const candidate = group[0];
      const updatedData = { ...candidate, category: 'nature', updatedAt: new Date().toISOString() };
      await redis.set(`illustration:${candidate.id}`, JSON.stringify(updatedData));
      nature = updatedData;
      updated++;
      console.log(`🔁 Updated ${candidate.id} -> category=nature`);
    }
    // 残りは削除
    for (const g of group) {
      if (g.id === nature.id) continue;
      await redis.del(`illustration:${g.id}`);
      await redis.del(`downloads:${g.id}`);
      deleted++;
      console.log(`🗑️  Deleted duplicate ${g.id} (${g.category})`);
    }
    kept++;
  }

  console.log(`🎉 Done. Kept groups: ${kept}, updated to nature: ${updated}, deleted duplicates: ${deleted}.`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Failed:', err);
    process.exit(1);
  });
}

