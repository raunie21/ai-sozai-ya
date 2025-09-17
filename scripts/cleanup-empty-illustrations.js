const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

const redis = Redis.fromEnv();

function isEmpty(str) {
  return !str || (typeof str === 'string' && str.trim() === '');
}

function isInvalidIllustration(data) {
  if (!data || typeof data !== 'object') return true;
  const hasId = typeof data.id === 'number' && Number.isFinite(data.id);
  const hasTitle = !isEmpty(data.title);
  const hasOriginal = !isEmpty(data.originalUrl);
  const hasImage = !isEmpty(data.imageUrl);
  // 最低限: id, title, originalUrl or imageUrl のいずれか
  if (!hasId || !hasTitle) return true;
  if (!hasOriginal && !hasImage) return true;
  return false;
}

async function run() {
  const keys = await redis.keys('illustration:*');
  let deleted = 0;
  let flagged = 0;
  for (const key of keys) {
    if (!/^illustration:\d+$/.test(key)) continue;
    const raw = await redis.get(key);
    if (!raw) {
      // データが無い場合は関連downloadsも削除
      const id = key.split(':')[1];
      await redis.del(key);
      await redis.del(`downloads:${id}`);
      deleted++;
      console.log(`Deleted empty key ${key}`);
      continue;
    }
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (isInvalidIllustration(data)) {
      const id = String(data?.id ?? key.split(':')[1]);
      console.log(`Deleting invalid illustration ${key}:`, {
        id,
        title: data?.title,
        imageUrl: data?.imageUrl,
        originalUrl: data?.originalUrl,
      });
      await redis.del(`illustration:${id}`);
      await redis.del(`downloads:${id}`);
      deleted++;
    } else if (isEmpty(data.thumbnailUrl) && !isEmpty(data.originalUrl)) {
      // サムネ無しはResizingで自動補完
      const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;
      if (publicUrl) {
        const m = String(data.originalUrl).match(/\/images\/originals\/.*$/);
        if (m) {
          const keyPart = m[0].replace(/^\//, '');
          data.thumbnailUrl = `${publicUrl}/cdn-cgi/image/width=300,height=300,fit=cover,gravity=center/${keyPart}`;
          data.updatedAt = new Date().toISOString();
          await redis.set(key, JSON.stringify(data));
          flagged++;
          console.log(`Patched missing thumbnail for ${key}`);
        }
      }
    }
  }
  console.log(`Done. Deleted ${deleted} invalid items. Patched ${flagged} items.`);
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}
