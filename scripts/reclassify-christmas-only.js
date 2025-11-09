#!/usr/bin/env node

/**
 * クリスマス配下（/images/originals/daily/christmas/）の画像のみを対象に、
 * ご指定のカテゴリ規則に厳密に再分類します。
 * それ以外のフォルダの画像は一切変更しません。
 */

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

function getBaseName(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    return (u.pathname.split('/').pop() || '').trim();
  } catch {
    return (url.split('/').pop() || '').trim();
  }
}

function isChristmasPath(url) {
  try {
    const u = new URL(url);
    return u.pathname.includes('/images/originals/daily/christmas/');
  } catch {
    return (url || '').includes('/images/originals/daily/christmas/');
  }
}

function classifyChristmas(baseLower) {
  // 人物（people）
  if (/^santaclaus/.test(baseLower)) return 'people';

  // 動物（animals）
  if (/^(reindeer(-illustration)?\d+|penguin\d+)$/.test(baseLower)) return 'animals';

  // 食べ物（food）
  if (
    /^(cake\d+|christmascake\d+|stollen\d+|hotchocolate1|wine\d+|christmascookie\d+|gingerbreadman(-illustration)?\d+|gingerbreadman1|candycane\d+|macarons1|roastedturkey\d+)$/.test(
      baseLower
    )
  ) {
    return 'food';
  }

  // 自然（nature）
  if (
    /^(hollybranch\d+|poinsettiaflower\d+|christmastree(-illustration)?\d+|chrismastree-illustration(3|4)|cranberries\d+)$/.test(
      baseLower
    )
  ) {
    return 'nature';
  }

  // ビジネス（business）
  if (
    /^(borderframe-(16by9|1by1|4by3)-\d+|borderframe-circle\d+|checkpattern(1|2)|snowflake\d+|stars\d+|badge(-sale)?\d+|arrowpointing\d+|merrychristmastext1|happyholidays(1|2))$/.test(
      baseLower
    )
  ) {
    return 'business';
  }

  // 日常（daily）
  if (
    /^(christmasvillage\d+|mittens1|wreath\d+|ribbon\d+|christmasstocking-illustration\d+|chrismasstocking\d+|christmasgoods(1|4)|christmasgood(2|3)|fireplace\d+|snowman\d+)$/.test(
      baseLower
    )
  ) {
    return 'daily';
  }

  return null;
}

async function main() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('❌ Upstashの環境変数が不足しています。 .env.local を確認してください。');
    process.exit(1);
  }
  const redis = Redis.fromEnv();
  const nextIdRaw = await redis.get('illustration:next_id');
  const nextId = Number(nextIdRaw || 0);
  if (!Number.isFinite(nextId) || nextId <= 0) {
    console.log('No illustrations found.');
    return;
  }

  const CHUNK = 300;
  let updated = 0;
  for (let start = 1; start <= nextId; start += CHUNK) {
    const end = Math.min(start + CHUNK - 1, nextId);
    const keys = Array.from({ length: end - start + 1 }, (_, i) => `illustration:${start + i}`);
    const rows = await redis.mget(...keys);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const raw = rows[i];
      if (!raw) continue;
      let data;
      try {
        data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch {
        continue;
      }
      const url = data.originalUrl || data.imageUrl || data.thumbnailUrl || '';
      if (!isChristmasPath(url)) continue; // クリスマス配下のみ

      const baseLower = (getBaseName(url) || '').toLowerCase();
      const name = baseLower.replace(/\.[^.]+$/, ''); // 拡張子除去
      if (!baseLower) continue;
      const desired = classifyChristmas(name);
      if (!desired) continue;
      if (data.category === desired) continue;
      const updatedData = { ...data, category: desired, updatedAt: new Date().toISOString() };
      await redis.set(key, JSON.stringify(updatedData));
      updated++;
      console.log(`✅ ${key}: ${data.category} -> ${desired} (${baseLower})`);
    }
  }

  console.log(`🎉 Done. Reclassified ${updated} christmas items.`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error('💥 Error:', e);
    process.exit(1);
  });
}


