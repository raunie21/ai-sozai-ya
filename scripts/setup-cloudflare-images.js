#!/usr/bin/env node

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
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

// 環境変数の確認
function validateEnvironment() {
  const requiredVars = [
    'CLOUDFLARE_R2_ACCOUNT_ID',
    'CLOUDFLARE_R2_ACCESS_KEY_ID',
    'CLOUDFLARE_R2_SECRET_ACCESS_KEY',
    'CLOUDFLARE_R2_BUCKET_NAME',
    'CLOUDFLARE_R2_PUBLIC_URL'
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('💥 Missing required environment variables:', missing.join(', '));
    console.error('Please check your .env.local file.');
    process.exit(1);
  }
}

// 画像リサイズ用のURL生成関数
function generateResizedImageUrl(originalUrl, width, height, format = 'auto', quality = 'auto') {
  const baseUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || 
    `https://${process.env.CLOUDFLARE_R2_BUCKET_NAME}.${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  
  // Cloudflare画像リサイズのパラメータ
  const params = new URLSearchParams({
    width: width.toString(),
    height: height.toString(),
    format: format,
    quality: quality,
    fit: 'cover', // アスペクト比を維持してクロップ
    gravity: 'center', // 中央からクロップ
  });
  
  return `${baseUrl}/${originalUrl}?${params.toString()}`;
}

// 画像URLを生成する関数（リサイズ対応版）
function generateImageUrl(imagePath, options = {}) {
  const {
    width = null,
    height = null,
    format = 'auto',
    quality = 'auto'
  } = options;
  
  // 画像パスからファイル名を抽出
  const fileName = path.basename(imagePath);
  const r2Path = `images/originals/${fileName}`;
  
  if (width || height) {
    // リサイズが必要な場合
    return generateResizedImageUrl(r2Path, width, height, format, quality);
  } else {
    // オリジナルサイズ
    return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${r2Path}`;
  }
}

// メイン処理
async function main() {
  console.log('🚀 Setting up Cloudflare image resizing...');
  
  // 環境変数の確認
  validateEnvironment();
  
  console.log('✅ Environment variables validated');
  console.log('📋 Next steps:');
  console.log('1. Enable Cloudflare Image Resizing in your Cloudflare dashboard');
  console.log('2. Update your image components to use the new resizing URLs');
  console.log('3. Test the resizing functionality');
  
  // サンプルURLの生成
  console.log('\n📸 Sample resized URLs:');
  const sampleImage = 'boy-friend.png';
  console.log(`Original: ${generateImageUrl(sampleImage)}`);
  console.log(`Thumbnail (200x200): ${generateImageUrl(sampleImage, { width: 200, height: 200 })}`);
  console.log(`Medium (400x400): ${generateImageUrl(sampleImage, { width: 400, height: 400 })}`);
  console.log(`Large (800x800): ${generateImageUrl(sampleImage, { width: 800, height: 800 })}`);
  console.log(`WebP format: ${generateImageUrl(sampleImage, { width: 400, height: 400, format: 'webp' })}`);
  console.log(`High quality: ${generateImageUrl(sampleImage, { width: 400, height: 400, quality: '90' })}`);
}

// スクリプト実行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateImageUrl, generateResizedImageUrl };

