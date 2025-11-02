#!/usr/bin/env node

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

const ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

if (!ACCOUNT_ID || !BUCKET_NAME) {
  console.error('Missing CLOUDFLARE_R2_ACCOUNT_ID or CLOUDFLARE_R2_BUCKET_NAME');
  process.exit(1);
}
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error('Missing Upstash credentials in .env.local');
  process.exit(1);
}
if (!R2_PUBLIC_URL) {
  console.error('CLOUDFLARE_R2_PUBLIC_URL is required');
  process.exit(1);
}

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});
const redis = Redis.fromEnv();

async function listDogKeys() {
  const Prefix = 'images/originals/animal/dog/';
  const results = [];
  let ContinuationToken = undefined;
  do {
    const resp = await r2Client.send(new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix,
      ContinuationToken,
    }));
    (resp.Contents || []).forEach(o => {
      if (!o.Key) return;
      if (o.Key.endsWith('/')) return;
      if (!/\.(png|jpg|jpeg|webp|gif)$/i.test(o.Key)) return;
      results.push(o.Key);
    });
    ContinuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return results;
}

function buildUrl(key) { return `${R2_PUBLIC_URL}/${key}`; }

async function findIdByOriginalUrl(originalUrl) {
  const keys = await redis.keys('illustration:*');
  const idKeys = keys.filter(k => /^illustration:\d+$/.test(k));
  for (const k of idKeys) {
    const raw = await redis.get(k);
    if (!raw) continue;
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (data && data.originalUrl === originalUrl) return data.id;
  }
  return null;
}

async function main() {
  console.log('🧹 Removing action/emotion tags from dog images...');
  const keys = await listDogKeys();
  if (keys.length === 0) {
    console.log('No dog images found.');
    return;
  }
  let changed = 0;
  for (const key of keys) {
    const url = buildUrl(key);
    const id = await findIdByOriginalUrl(url);
    if (!id) continue;
    const raw = await redis.get(`illustration:${id}`);
    if (!raw) continue;
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    const before = Array.isArray(data?.tags) ? data.tags : [];
    const filtered = before.filter(t => t !== '動作' && t !== '感情');
    if (filtered.length !== before.length) {
      const updated = { ...data, tags: filtered, updatedAt: new Date().toISOString() };
      await redis.set(`illustration:${id}`, JSON.stringify(updated));
      changed++;
      console.log(`✅ Cleaned (${id})`);
    }
  }
  console.log(`🎉 Done. Cleaned ${changed}/${keys.length} dog records.`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Cleanup failed:', err);
    process.exit(1);
  });
}

