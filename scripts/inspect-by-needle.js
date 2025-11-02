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
  console.log('Usage: node scripts/inspect-by-needle.js <needle>');
  process.exit(1);
}
const needle = needleRaw.toLowerCase();

async function listAll() {
  const keys = await redis.keys('illustration:*');
  const idKeys = keys.filter(k => /^illustration:\d+$/.test(k));
  const out = [];
  for (const k of idKeys) {
    try {
      const raw = await redis.get(k);
      if (!raw) continue;
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (data) out.push(data);
    } catch (e) {
      console.warn('Skip invalid JSON at', k);
    }
  }
  return out;
}

function match(ill) {
  const arr = [ill?.title, ill?.originalUrl, ill?.imageUrl, ill?.thumbnailUrl].map(v => (v || '').toString().toLowerCase());
  return arr.some(v => v.includes(needle));
}

async function main() {
  const all = await listAll();
  const hits = all.filter(match);
  console.log(`Matched ${hits.length}`);
  for (const h of hits) {
    console.log({ id: h.id, title: h.title, category: h.category, imageUrl: h.imageUrl, thumbnailUrl: h.thumbnailUrl, originalUrl: h.originalUrl });
  }
}

if (require.main === module) {
  main().catch(err => { console.error(err); process.exit(1); });
}


