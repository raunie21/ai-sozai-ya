#!/usr/bin/env node

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

const ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

if (!ACCOUNT_ID || !BUCKET_NAME || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
  console.error('💥 Missing Cloudflare R2 environment variables. Check .env.local');
  process.exit(1);
}

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

async function listAll(prefix) {
  const results = [];
  let ContinuationToken = undefined;
  do {
    const resp = await r2.send(new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
      ContinuationToken,
    }));
    (resp.Contents || []).forEach(o => {
      if (!o.Key) return;
      if (/(^|\/)\./.test(o.Key)) return; // skip hidden
      if (!/\.(png|jpg|jpeg|webp|gif)$/i.test(o.Key)) return; // images only
      results.push({
        key: o.Key,
        file: o.Key.split('/').pop(),
        size: o.Size,
        lastModified: o.LastModified,
      });
    });
    ContinuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
  } while (ContinuationToken);
  return results;
}

async function main() {
  const prefixArg = process.argv[2];
  if (!prefixArg) {
    console.error('Usage: node scripts/list-r2-prefix.js <prefix>');
    console.error('Example: node scripts/list-r2-prefix.js images/originals/daily/christmas/');
    process.exit(1);
  }
  const prefix = prefixArg.endsWith('/') ? prefixArg : `${prefixArg}/`;
  const items = await listAll(prefix);
  console.log(JSON.stringify(items, null, 2));
}

if (require.main === module) {
  main().catch(err => {
    console.error('💥 Failed to list objects:', err);
    process.exit(1);
  });
}


