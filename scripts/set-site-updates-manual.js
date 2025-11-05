#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

const IDS_KEY = 'site_updates:ids';
const ITEM_KEY = (id) => `site_update:${id}`;
const MANUAL_KEY = 'site_updates:manual';

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.replace(/^--/, '');
      const v = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
      args[k] = v;
    }
  }
  return args;
}

async function main() {
  const redis = Redis.fromEnv();
  const { limit } = parseArgs(process.argv.slice(2));
  const lim = Math.max(1, Math.min(parseInt(limit || '4', 10) || 4, 50));

  const idStrings = await redis.lrange(IDS_KEY, 0, lim - 1);
  if (!idStrings || idStrings.length === 0) {
    console.log('No site updates found in list. Nothing to set.');
    return;
  }
  const rawList = await redis.mget(...idStrings.map(ITEM_KEY));
  const items = (rawList || []).map((raw) => {
    try {
      const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return obj && obj.date && obj.text ? { date: obj.date, text: obj.text } : null;
    } catch {
      return null;
    }
  }).filter(Boolean);

  const manualArray = items.slice(0, lim);
  await redis.set(MANUAL_KEY, JSON.stringify(manualArray));
  console.log(`✅ Set ${MANUAL_KEY} with ${manualArray.length} items (limit=${lim}).`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error('Error:', e?.message || e);
    process.exit(1);
  });
}


