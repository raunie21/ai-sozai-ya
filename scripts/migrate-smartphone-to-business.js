#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error('Missing Upstash credentials in .env.local');
  process.exit(1);
}

const redis = Redis.fromEnv();

function hasSmartphoneTagOrHint(data) {
  const tags = Array.isArray(data?.tags) ? data.tags : [];
  const title = (data?.title || '').toString().toLowerCase();
  const url = (data?.originalUrl || data?.imageUrl || '').toString().toLowerCase();
  const tagSet = new Set(tags);
  // 日本語タグ優先（これまでの生成ロジック）
  if (tagSet.has('スマホ') || tagSet.has('携帯')) return true;
  // タイトル/URL の英語ヒント
  if (title.includes('smartphone') || title.includes('phone')) return true;
  if (url.includes('smartphone') || url.includes('phone')) return true;
  return false;
}

async function main() {
  console.log('📱 Migrating smartphone-related images to business category...');
  const keys = await redis.keys('illustration:*');
  const idKeys = keys.filter(k => /^illustration:\d+$/.test(k));
  let updated = 0;
  for (const k of idKeys) {
    const raw = await redis.get(k);
    if (!raw) continue;
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!data) continue;
    if (hasSmartphoneTagOrHint(data) && data.category !== 'business') {
      const newData = { ...data, category: 'business', updatedAt: new Date().toISOString() };
      await redis.set(k, JSON.stringify(newData));
      updated++;
      console.log(`✅ Updated ${k} -> business`);
    }
  }
  console.log(`🎉 Done. Updated ${updated}/${idKeys.length} records.`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Migration failed:', err);
    process.exit(1);
  });
}

