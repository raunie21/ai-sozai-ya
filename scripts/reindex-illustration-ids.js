const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

const redis = Redis.fromEnv();

async function run() {
  const keys = await redis.keys('illustration:*');
  const items = [];
  for (const key of keys) {
    if (!/^illustration:\d+$/.test(key)) continue;
    const raw = await redis.get(key);
    if (!raw) continue;
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    items.push({ key, id: data.id, data });
  }
  if (items.length === 0) {
    console.log('No illustrations found.');
    return;
  }
  // 安定のためid昇順で並べ、1から連番を振り直す
  items.sort((a,b)=> (a.id||0)-(b.id||0));

  let newId = 1;
  let moved = 0;
  for (const item of items) {
    const oldId = item.id;
    if (oldId === newId) { newId++; continue; }

    // 既存の新IDが万が一存在する場合は一時退避（衝突回避）
    const tempKey = `illustration:tmp:${newId}`;
    const existsNew = await redis.get(`illustration:${newId}`);
    if (existsNew) {
      await redis.set(tempKey, JSON.stringify(existsNew));
    }

    // 元データを新IDにコピー
    const updated = { ...item.data, id: newId, updatedAt: new Date().toISOString() };
    await redis.set(`illustration:${newId}`, JSON.stringify(updated));

    // downloads を移設
    const oldDl = await redis.get(`downloads:${oldId}`);
    if (oldDl !== null && oldDl !== undefined) {
      await redis.set(`downloads:${newId}`, Number(oldDl) || 0);
    }

    // 旧キー削除
    await redis.del(`illustration:${oldId}`);
    await redis.del(`downloads:${oldId}`);

    // 衝突退避から戻す（ほぼ発生しない想定）
    if (existsNew) {
      const restored = await redis.get(tempKey);
      if (restored) {
        await redis.set(`illustration:${oldId}`, JSON.stringify(restored));
      }
      await redis.del(tempKey);
    }

    console.log(`Reindexed ${oldId} -> ${newId}`);
    moved++;
    newId++;
  }

  // next_id を更新
  const finalMaxId = items.length; // 1..N
  await redis.set('illustration:next_id', finalMaxId + 1);
  console.log(`Done. Moved ${moved} items. next_id=${finalMaxId + 1}`);
}

if (require.main === module) {
  run().catch((e)=>{ console.error(e); process.exit(1); });
}
