#!/usr/bin/env node

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

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

// R2の全ファイルを確認
async function checkAllR2Files() {
  console.log('🗄️  Checking all R2 storage contents...');
  
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 1000, // 最大1000ファイル
    });
    
    const response = await r2Client.send(command);
    const files = response.Contents || [];
    
    console.log(`📁 Found ${files.length} total files in bucket: ${BUCKET_NAME}`);
    
    if (files.length === 0) {
      console.log('❌ No files found in R2 bucket');
      return;
    }
    
    // フォルダ構造を分析
    const folderStructure = {};
    files.forEach(file => {
      const key = file.Key;
      const parts = key.split('/');
      let current = folderStructure;
      
      for (let i = 0; i < parts.length - 1; i++) {
        const folder = parts[i];
        if (!current[folder]) {
          current[folder] = {};
        }
        current = current[folder];
      }
    });
    
    console.log('\n📋 Folder structure:');
    console.log(JSON.stringify(folderStructure, null, 2));
    
    // 全ファイル一覧（最初の50個まで）
    console.log('\n📁 Files (first 50):');
    files.slice(0, 50).forEach((file, index) => {
      console.log(`  ${index + 1}: ${file.Key} (${file.Size} bytes)`);
    });
    
    if (files.length > 50) {
      console.log(`  ... and ${files.length - 50} more files`);
    }
    
    // kidsフォルダを探す
    const kidsFiles = files.filter(file => file.Key.includes('kids'));
    if (kidsFiles.length > 0) {
      console.log('\n👶 Kids-related files:');
      kidsFiles.forEach(file => {
        console.log(`  ${file.Key}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to check R2 storage:', error.message);
  }
}

// メイン処理
async function main() {
  try {
    await checkAllR2Files();
  } catch (error) {
    console.error('💥 Check failed:', error.message);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main().catch(console.error);
}
