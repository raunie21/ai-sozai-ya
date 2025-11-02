#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error('Missing Upstash credentials in .env.local');
  process.exit(1);
}

const redis = Redis.fromEnv();

// Usage: node scripts/duplicate-illustration-for-categories.js <needle> <commaSeparatedCategories>
const args = process.argv.slice(2);
const needleRaw = args[0] || '';
const catsRaw = args[1] || '';
if (!needleRaw || !catsRaw) {
  console.log('Usage: node scripts/duplicate-illustration-for-categories.js <needle> <categoriesCommaSeparated>');
  console.log('Example: node scripts/duplicate-illustration-for-categories.js indoorplants "nature,daily"');
  process.exit(1);
}
const needle = needleRaw.toLowerCase();
const targetCategories = catsRaw.split(',').map(s => s.trim()).filter(Boolean);

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

async function ensureCategoryVariants(baseIll, categories) {
  const all = await listAllIllustrations();
  const sameOriginal = all.filter(i => i.originalUrl === baseIll.originalUrl);

  let created = 0;
  for (const cat of categories) {
    const exists = sameOriginal.some(i => i.category === cat);
    if (exists) continue;
    const nextId = await redis.incr('illustration:next_id');
    const now = new Date().toISOString();
    const payload = {
      ...baseIll,
      id: nextId,
      category: cat,
      createdAt: baseIll.createdAt || now,
      updatedAt: now,
    };
    await redis.set(`illustration:${nextId}`, JSON.stringify(payload));
    await redis.set(`downloads:${nextId}`, Number.isFinite(baseIll.downloads) ? baseIll.downloads : 0);
    created++;
    console.log(`✅ Duplicated ${baseIll.id} -> ${nextId} (${cat})`);
  }
  return created;
}

async function main() {
  console.log(`🔁 Duplicate by needle="${needle}" for categories: ${targetCategories.join(', ')}`);
  const ills = await listAllIllustrations();
  const matches = ills.filter(matchesNeedle);
  if (matches.length === 0) {
    console.log('❌ No illustrations matched the needle');
    return;
  }
  console.log(`📦 Matched ${matches.length} illustrations`);

  let totalCreated = 0;
  for (const ill of matches) {
    totalCreated += await ensureCategoryVariants(ill, targetCategories);
  }
  console.log(`🎉 Done. Created ${totalCreated} new variants.`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Failed:', err);
    process.exit(1);
  });
}



