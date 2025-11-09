#!/usr/bin/env node

/**
 * 現在 category === 'daily' だが、christmas配下ではない画像を
 * ファイル名ヒューリスティックで元カテゴリに近いものへ修復するスクリプト。
 * 失敗時は daily のままにする（安全側）。
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

function classify(baseLower) {
  // people
  if (/(^|-)john-|^man-|^woman-|^grand(ma|mother)|^grand(fa|father)|^boy-|^girl-|^kid-|^people-|^sarah/.test(baseLower)) {
    return 'people';
  }
  // animals
  if (/^dog|^cat|^animal-/.test(baseLower)) return 'animals';
  // business
  if (/business|creditcard|money|cash|document|documents|documentchart|signature|receipt|smartphone|laptop|light-bulb|3dgragh|earth-3d|businessbag|businesscard|curvedarrow/i.test(baseLower)) {
    return 'business';
  }
  // food
  if (/ramen|udon|soba|rice|rice-bowl|onigiri|pancake|bread|toast|gratin|curry|friedrice|meat-?spag(e|h)tti|mochi|zakkokumai|yakiyaba|brownrice|carbonara|cereal|sandwich|yakisoba|yakitori/i.test(baseLower)) {
    return 'food';
  }
  // nature
  if (/rose|sunflower|dandelion|bamboo|palmtree|wheat|cherryblossom|morningglory|orchid|riceplant|indoorplants|plant|tree|leaf|flower/i.test(baseLower)) {
    return 'nature';
  }
  // icons
  if (/^icon-|icons?/.test(baseLower)) return 'icons';
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
  let fixed = 0;
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
      const originalUrl = data.originalUrl || data.imageUrl || data.thumbnailUrl || '';
      if (data.category !== 'daily') continue;
      if (isChristmasPath(originalUrl)) continue; // クリスマスは触らない

      const base = getBaseName(originalUrl);
      const baseLower = (base || '').toLowerCase();
      if (!baseLower) continue;
      const newCat = classify(baseLower);
      if (newCat && newCat !== 'daily') {
        const updated = { ...data, category: newCat, updatedAt: new Date().toISOString() };
        await redis.set(key, JSON.stringify(updated));
        fixed++;
        console.log(`🔧 ${key}: daily -> ${newCat} (${base})`);
      }
    }
  }
  console.log(`🎉 Repaired ${fixed} items (non-Christmas daily -> classified).`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error('💥 Error:', e);
    process.exit(1);
  });
}


