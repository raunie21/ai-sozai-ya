#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error('Missing Upstash credentials in .env.local');
  process.exit(1);
}
if (!R2_PUBLIC_URL) {
  console.error('CLOUDFLARE_R2_PUBLIC_URL is required');
  process.exit(1);
}

const redis = Redis.fromEnv();

const args = process.argv.slice(2);
const needleRaw = args[0] || '';
const folder = args[1] || 'daily';
if (!needleRaw) {
  console.log('Usage: node scripts/fix-url-by-needle.js <needle> [folder=daily]');
  process.exit(1);
}
const needle = needleRaw.toLowerCase();

async function listAll() {
  const keys = await redis.keys('illustration:*');
  const idKeys = keys.filter(k => /^illustration:\d+$/.test(k));
  const out = [];
  for (const k of idKeys) {
    const raw = await redis.get(k);
    if (!raw) continue;
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (data) out.push(data);
  }
  return out;
}

function match(ill) {
  const arr = [ill?.title, ill?.originalUrl, ill?.imageUrl, ill?.thumbnailUrl].map(v => (v || '').toString().toLowerCase());
  return arr.some(v => v.includes(needle));
}

function buildUrls(fileName, folder) {
  const orig = `${R2_PUBLIC_URL}/images/originals/${folder}/${fileName}`;
  const thumb = `${R2_PUBLIC_URL}/cdn-cgi/image/width=300,height=300,fit=cover,gravity=center/images/originals/${folder}/${fileName}`;
  const main = `${R2_PUBLIC_URL}/cdn-cgi/image/width=600,height=600,fit=cover,gravity=center/images/originals/${folder}/${fileName}`;
  return { orig, thumb, main };
}

async function main() {
  const all = await listAll();
  const hits = all.filter(match);
  console.log(`Matched ${hits.length}`);
  for (const h of hits) {
    // derive filename from any url
    const any = h.originalUrl || h.imageUrl || h.thumbnailUrl || '';
    const file = any.split('/').pop();
    if (!file) continue;
    const { orig, thumb, main } = buildUrls(file, folder);
    const updated = { ...h, originalUrl: orig, thumbnailUrl: thumb, imageUrl: main, updatedAt: new Date().toISOString() };
    await redis.set(`illustration:${h.id}`, JSON.stringify(updated));
    console.log(`✅ Fixed URLs for ${h.id} -> folder=${folder}`);
  }
}

if (require.main === module) {
  main().catch(err => { console.error(err); process.exit(1); });
}



