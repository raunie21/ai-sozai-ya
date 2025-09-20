#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

const redis = Redis.fromEnv();

// Cloudflare R2 クライアントの設定
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;

// 現在のDB状況を確認
async function checkDatabase() {
  console.log('📊 Checking current database state...');
  
  const keys = await redis.keys('illustration:*');
  const illustrationKeys = keys.filter(key => /^illustration:\d+$/.test(key));
  
  console.log(`📁 Found ${illustrationKeys.length} illustrations in database`);
  
  const items = [];
  for (const key of illustrationKeys) {
    const raw = await redis.get(key);
    if (raw) {
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      items.push({ id: data.id, title: data.title, category: data.category });
    }
  }
  
  // ID順でソート
  items.sort((a, b) => a.id - b.id);
  
  console.log('\n📋 Current illustrations:');
  items.forEach(item => {
    console.log(`  ID ${item.id}: ${item.title} (${item.category})`);
  });
  
  return items;
}

// R2の状況を確認
async function checkR2Storage() {
  console.log('\n🗄️  Checking R2 storage...');
  
  try {
    // illustrations フォルダ
    const illustrationsCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: 'images/illustrations/',
    });
    const illustrationsResponse = await r2Client.send(illustrationsCommand);
    const illustrationFiles = illustrationsResponse.Contents || [];
    
    console.log(`📁 Found ${illustrationFiles.length} files in images/illustrations/`);
    
    // kids フォルダ
    const kidsCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: 'images/kids/',
    });
    const kidsResponse = await r2Client.send(kidsCommand);
    const kidsFiles = kidsResponse.Contents || [];
    
    console.log(`👶 Found ${kidsFiles.length} files in images/kids/`);
    
    if (kidsFiles.length > 0) {
      console.log('\n📋 Kids folder contents:');
      kidsFiles.forEach(file => {
        console.log(`  ${file.Key}`);
      });
    }
    
    // ID 1-13の画像を確認
    console.log('\n🔍 Checking images for IDs 1-13:');
    for (let i = 1; i <= 13; i++) {
      const imagesToCheck = [
        `images/illustrations/${i}.png`,
        `images/illustrations/${i}.webp`,
        `images/thumbnails/${i}-thumb.png`,
        `images/thumbnails/${i}-thumb.webp`,
        `images/originals/${i}.png`,
      ];
      
      let foundFiles = [];
      for (const imageKey of imagesToCheck) {
        const found = illustrationFiles.some(file => file.Key === imageKey);
        if (found) {
          foundFiles.push(imageKey);
        }
      }
      
      if (foundFiles.length > 0) {
        console.log(`  ID ${i}: ${foundFiles.join(', ')}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Failed to check R2 storage:', error.message);
  }
}

// メイン処理
async function main() {
  try {
    await checkDatabase();
    await checkR2Storage();
  } catch (error) {
    console.error('💥 Check failed:', error.message);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main().catch(console.error);
}
