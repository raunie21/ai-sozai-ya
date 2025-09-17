const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

// Env
const ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

if (!ACCOUNT_ID || !BUCKET_NAME) {
  console.error('Missing CLOUDFLARE_R2_ACCOUNT_ID or CLOUDFLARE_R2_BUCKET_NAME');
  process.exit(1);
}
if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.error('Missing Upstash credentials in .env.local');
  process.exit(1);
}
if (!R2_PUBLIC_URL) {
  console.warn('CLOUDFLARE_R2_PUBLIC_URL is not set. URLs may be invalid.');
}

// Clients
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});
const redis = Redis.fromEnv();

// Args
const args = process.argv.slice(2);
const characterName = args[0];
const category = args[1] || 'people';
const tagsArg = args[2] || '';
const tags = tagsArg ? tagsArg.split(',').map(s => s.trim()).filter(Boolean) : [];

if (!characterName) {
  console.log('Usage: node scripts/import-folder.js <CharacterName> [category] [tagsCommaSeparated]');
  console.log('Example: node scripts/import-folder.js John people "男性,笑顔"');
  process.exit(1);
}

function buildResizedUrl(originalKey, width) {
  // originalKey like images/originals/John/file.png
  if (!R2_PUBLIC_URL) return '';
  return `${R2_PUBLIC_URL}/cdn-cgi/image/width=${width},height=${width},fit=cover,gravity=center/${originalKey}`;
}

function extractTitleFromFile(fileKey) {
  const base = fileKey.split('/').pop() || '';
  return base.replace(/[-_]/g, ' ').replace(/\.[^.]+$/, '');
}

async function addToDb({ title, imageUrl, thumbnailUrl, originalUrl }) {
  const nextId = await redis.incr('illustration:next_id');
  const now = new Date().toISOString();
  const payload = {
    id: nextId,
    title,
    imageUrl,
    thumbnailUrl,
    originalUrl,
    category,
    tags,
    downloads: 0,
    createdAt: now,
    updatedAt: now,
  };
  await redis.set(`illustration:${nextId}`, JSON.stringify(payload));
  await redis.set(`downloads:${nextId}`, 0);
  return payload;
}

async function listCharacterObjects() {
  const Prefix = `images/originals/${characterName}/`;
  const results = [];
  let ContinuationToken = undefined;
  do {
    const resp = await r2Client.send(new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix,
      ContinuationToken,
    }));
    (resp.Contents || []).forEach(o => {
      if (!o.Key) return;
      // skip thumbnails or hidden files
      if (/(^|\/)\./.test(o.Key)) return;
      if (/-thumb\.(webp|png|jpg|jpeg)$/i.test(o.Key)) return;
      if (!/\.(png|jpg|jpeg|webp|gif)$/i.test(o.Key)) return;
      results.push(o.Key);
    });
    ContinuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return results;
}

async function main() {
  console.log(`🚀 Importing images for character: ${characterName}`);
  const keys = await listCharacterObjects();
  if (keys.length === 0) {
    console.log('No images found under:', `images/originals/${characterName}/`);
    return;
  }
  console.log(`📦 Found ${keys.length} files`);

  let success = 0;
  for (const key of keys) {
    const title = extractTitleFromFile(key);
    const originalUrl = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${key}` : '';
    const imageUrl = buildResizedUrl(key, 600);
    const thumbnailUrl = buildResizedUrl(key, 300);

    const created = await addToDb({ title, imageUrl, thumbnailUrl, originalUrl });
    success++;
    console.log(`✅ Imported: ${created.id} - ${title}`);
  }
  console.log(`🎉 Done. Imported ${success}/${keys.length} images.`);
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Import failed:', err);
    process.exit(1);
  });
}
