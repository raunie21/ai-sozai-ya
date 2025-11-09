#!/usr/bin/env node

/**
 * christmas配下の画像のカテゴリを一括更新します。
 * 要望反映:
 * - christmasVillage1〜4 → daily
 * - フレーム/パターン/雪・星/バッジ/矢印/文字 → business
 * - それ以外は既定の分類ロジックで people/animals/food/nature/daily へ
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

function toLowerBase(data) {
  const base = getBaseName(data.originalUrl || data.imageUrl || data.thumbnailUrl || '');
  return base.toLowerCase();
}

function classifyCategoryByFilename(baseLower) {
  // people (サンタ)
  if (/^santaclaus/.test(baseLower)) return 'people';

  // animals
  if (/^(reindeer(-illustration)?\d+|penguin\d+)$/.test(baseLower)) return 'animals';

  // food
  if (
    /^(cake\d+|christmascake\d+|stollen\d+|hotchocolate1|wine\d+|christmascookie\d+|gingerbreadman(-illustration)?\d+|gingerbreadman1|candycane\d+|macarons1|roastedturkey\d+)$/.test(
      baseLower
    )
  ) {
    return 'food';
  }

  // nature
  if (
    /^(hollybranch\d+|poinsettiaflower\d+|christmastree(-illustration)?\d+|chrismastree-illustration(3|4)|cranberries\d+)$/.test(
      baseLower
    )
  ) {
    return 'nature';
  }

  // business（要望: フレーム/パターン/雪・星/バッジ/矢印/文字）
  if (
    /^(borderframe(-\dby\d-\d+|-(circle)\d+)|checkpattern\d*|snowflake\d+|stars\d+|badge(-sale)?\d+|arrowpointing\d+|merrychristmastext1|happyholidays[12])$/.test(
      baseLower
    )
  ) {
    return 'business';
  }

  // daily（装飾品・暖炉・雪だるま・ストッキング・雑貨・リース/リボン・手袋・村）
  if (
    /^(mittens1|wreath\d+|ribbon\d+|christmasstocking-illustration\d+|chrismasstocking\d+|christmasgoods?[14]?|christmasgood[23]|fireplace\d+|snowman\d+|christmasvillage\d+)$/.test(
      baseLower
    )
  ) {
    return 'daily';
  }

  // 既定: daily（安全側）
  return 'daily';
}

async function main() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('❌ Upstash環境変数が不足しています。 .env.local を確認してください。');
    process.exit(1);
  }
  const redis = Redis.fromEnv();

  const nextIdRaw = await redis.get('illustration:next_id');
  const nextId = Number(nextIdRaw || 0);
  if (!Number.isFinite(nextId) || nextId <= 0) {
    console.log('No illustrations.');
    return;
  }

  const CHUNK = 300;
  let updated = 0;
  for (let start = 1; start <= nextId; start += CHUNK) {
    const end = Math.min(start + CHUNK - 1, nextId);
    const keys = Array.from({ length: end - start + 1 }, (_, i) => `illustration:${start + i}`);
    const items = await redis.mget(...keys);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const raw = items[i];
      if (!raw) continue;
      let data;
      try {
        data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      } catch {
        continue;
      }
      const baseLower = toLowerBase(data);
      // 対象はchristmas配下と想定。basenameで判定するが、非対象はスキップ可
      // ただし basename が空ならスキップ
      if (!baseLower) continue;

      const newCategory = classifyCategoryByFilename(baseLower);
      if (newCategory && data.category !== newCategory) {
        const updatedData = { ...data, category: newCategory, updatedAt: new Date().toISOString() };
        await redis.set(key, JSON.stringify(updatedData));
        updated++;
        console.log(`✅ ${key}: ${data.category} -> ${newCategory} (${baseLower})`);
      }
    }
  }
  console.log(`🎉 Done. Updated ${updated} items.`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error('💥 Error:', e);
    process.exit(1);
  });
}


