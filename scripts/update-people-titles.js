#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

function toFileParts(originalUrl) {
  try {
    const u = new URL(originalUrl);
    const file = u.pathname.split('/').pop() || '';
    const baseNoExt = file.replace(/\.[^.]+$/, '');
    const base = baseNoExt.replace(/\d+$/, '');
    const numMatch = baseNoExt.match(/(\d+)$/);
    const num = numMatch ? numMatch[1] : '';
    return { file, base, num };
  } catch {
    return { file: '', base: '', num: '' };
  }
}

function toFullWidthNumber(numStr) {
  if (!numStr) return '';
  return String(numStr).replace(/[0-9]/g, d => String.fromCharCode(d.charCodeAt(0) + 0xFEE0));
}

// ベース→タイトル先頭（主語＋端的な説明）
const titleByBase = {
  // john*
  'john-angry': 'おじさん 怒る',
  'john-crying': 'おじさん 泣く',
  'john-fight': 'おじさん 構え',
  'john-happy': 'おじさん 笑顔',
  'john-laugh': 'おじさん 大笑い',
  'john-nice': 'おじさん サムズアップ',
  'john-smelling': 'おじさん 匂いを嗅ぐ',
  // sarah*
  'sarah-laugh': '女性 大笑い',
  'sarah-yelling': '女性 叫ぶ',
  // man*
  'man-excited': '男性 ガッツポーズ',
  // grandma*
  'grandma-fingerpoint': 'おばあちゃん 指さし',
  'grandma-hi': 'おばあちゃん 手を振る',
  'grandma-idk': 'おばあちゃん 困惑',
  'grandma-pray': 'おばあちゃん 合掌',
  'grandma-scare': 'おばあちゃん 驚く',
  'grandma-scared': 'おばあちゃん 驚く',
  // grandmother*
  'grandmother-raisehand': 'おばあちゃん 挙手',
  // woman*
  'woman-raisehand': '女性 挙手',
  // grandfather*
  'grandfather-raisehand': 'おじいちゃん 挙手',
};

async function main() {
  const redis = Redis.fromEnv();
  console.log('📝 Updating titles for people items to approved pattern...');

  const keys = await redis.keys('illustration:*');
  const idKeys = keys.filter(k => /^illustration:\d+$/.test(k));

  let checked = 0;
  let updated = 0;

  for (const k of idKeys) {
    try {
      const raw = await redis.get(k);
      if (!raw) continue;
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!data || data.category !== 'people') continue;

      const { base, num } = toFileParts(data.originalUrl || '');
      const head = titleByBase[base];
      if (!head) continue;

      const suffix = num ? ` ${toFullWidthNumber(num)}` : '';
      const newTitle = `${head}${suffix}`;

      if (data.title === newTitle) {
        checked++;
        continue;
      }

      const id = data.id || parseInt(k.split(':')[1], 10);
      const payload = { ...data, title: newTitle, updatedAt: new Date().toISOString() };
      await redis.set(`illustration:${id}`, JSON.stringify(payload));
      updated++;
      checked++;
      console.log(`✅ Updated ID ${id} -> ${newTitle}`);
    } catch (e) {
      console.warn(`⚠️  Skip ${k}: ${e.message}`);
    }
  }

  console.log(`🎉 Done. Titles updated: ${updated}. Checked: ${checked}.`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Title update failed:', err);
    process.exit(1);
  });
}
