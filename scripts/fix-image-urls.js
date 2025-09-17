const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

const redis = Redis.fromEnv();
const PUBLIC = process.env.CLOUDFLARE_R2_PUBLIC_URL; // e.g. https://img.ai-sozaiya.com

function buildMainUrl(key) {
  return `${PUBLIC}/cdn-cgi/image/width=600,height=600,fit=cover,gravity=center/${key}`;
}
function buildThumbUrl(key) {
  return `${PUBLIC}/cdn-cgi/image/width=300,height=300,fit=cover,gravity=center/${key}`;
}

async function run() {
  if (!PUBLIC) {
    console.error('CLOUDFLARE_R2_PUBLIC_URL is not set.');
    process.exit(1);
  }
  const keys = await redis.keys('illustration:*');
  let updated = 0;
  for (const k of keys) {
    if (!/^illustration:\d+$/.test(k)) continue;
    const raw = await redis.get(k);
    if (!raw) continue;
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;

    // 旧ローカルやr2.cloudflarestorage.comを新ドメインに統一
    // 元のオリジナルキー推定
    // 1) originalUrl が /images/originals/... or <domain>/images/originals/...
    let originalKey = null;
    if (data.originalUrl) {
      const m = data.originalUrl.match(/\/images\/originals\/.*$/);
      if (m) originalKey = m[0].replace(/^\//, '');
    } else if (data.imageUrl) {
      const m2 = data.imageUrl.match(/\/images\/originals\/.*\.(png|jpg|jpeg|webp|gif)/i);
      if (m2) originalKey = m2[0].replace(/^\//, '');
    }
    if (!originalKey) continue;

    const newOriginalUrl = `${PUBLIC}/${originalKey}`;
    const newImageUrl = buildMainUrl(originalKey);
    const newThumbUrl = buildThumbUrl(originalKey);

    const next = {
      ...data,
      originalUrl: newOriginalUrl,
      imageUrl: newImageUrl,
      thumbnailUrl: newThumbUrl,
      updatedAt: new Date().toISOString(),
    };
    await redis.set(k, JSON.stringify(next));
    updated++;
    console.log(`Updated ${k} => ${originalKey}`);
  }
  console.log(`Done. Updated ${updated} records.`);
}

if (require.main === module) {
  run().catch((e) => { console.error(e); process.exit(1); });
}
