#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

const redis = Redis.fromEnv();

const IDS_KEY = 'site_updates:ids';
const NEXT_ID = 'site_update:next_id';
const ITEM_KEY = (id) => `site_update:${id}`;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.replace(/^--/, '');
      const next = argv[i + 1];
      if (next && !next.startsWith('--')) {
        args[key] = next;
        i++;
      } else {
        args[key] = true;
      }
    } else if (!args._) {
      args._ = [a];
    } else {
      args._.push(a);
    }
  }
  args._ = args._ || [];
  return args;
}

async function addUpdate({ date, text }) {
  if (!date || !text) throw new Error('Missing --date or --text');
  const nextId = await redis.incr(NEXT_ID);
  const payload = { id: nextId, date, text, createdAt: new Date().toISOString() };
  await redis.set(ITEM_KEY(nextId), JSON.stringify(payload));
  await redis.lpush(IDS_KEY, String(nextId));
  console.log(`Added site update id=${nextId}: ${date} ${text}`);
}

async function listUpdates({ limit = 8, json = false }) {
  const lim = Math.max(1, Math.min(parseInt(limit, 10) || 8, 100));
  const idStrings = await redis.lrange(IDS_KEY, 0, lim - 1);
  if (!idStrings || idStrings.length === 0) {
    console.log('No updates');
    return;
  }
  const rawList = await redis.mget(...idStrings.map(ITEM_KEY));
  const items = (rawList || []).map((raw, i) => {
    try {
      const obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
      return { id: Number(idStrings[i]), date: obj?.date, text: obj?.text, createdAt: obj?.createdAt };
    } catch {
      return null;
    }
  }).filter(Boolean);
  if (json) {
    console.log(JSON.stringify(items, null, 2));
  } else {
    for (const it of items) {
      console.log(`${it.id}\t${it.date}\t${it.text}`);
    }
  }
}

async function deleteUpdate({ id }) {
  if (!id) throw new Error('Missing --id');
  const key = ITEM_KEY(id);
  await redis.del(key);
  // Remove id from list (lrem all occurrences)
  await redis.lrem(IDS_KEY, 0, String(id));
  console.log(`Deleted site update id=${id}`);
}

async function editUpdate({ id, date, text }) {
  if (!id) throw new Error('Missing --id');
  const key = ITEM_KEY(id);
  const raw = await redis.get(key);
  if (!raw) throw new Error(`Not found id=${id}`);
  const cur = typeof raw === 'string' ? JSON.parse(raw) : raw;
  const updated = {
    ...cur,
    date: date || cur.date,
    text: text || cur.text,
    updatedAt: new Date().toISOString(),
  };
  await redis.set(key, JSON.stringify(updated));
  console.log(`Updated site update id=${id}`);
}

async function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0];
  const args = parseArgs(argv.slice(1));

  try {
    switch (cmd) {
      case 'add':
        await addUpdate({ date: args.date, text: args.text });
        break;
      case 'list':
        await listUpdates({ limit: args.limit, json: !!args.json });
        break;
      case 'delete':
        await deleteUpdate({ id: args.id });
        break;
      case 'edit':
        await editUpdate({ id: args.id, date: args.date, text: args.text });
        break;
      default:
        console.log('Usage:');
        console.log('  node scripts/site-updates.js add --date 11/05 --text "テキスト"');
        console.log('  node scripts/site-updates.js list [--limit 8] [--json]');
        console.log('  node scripts/site-updates.js edit --id 123 [--date 11/05] [--text "修正"]');
        console.log('  node scripts/site-updates.js delete --id 123');
        process.exit(1);
    }
  } catch (e) {
    console.error('Error:', e.message || e);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
