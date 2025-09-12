#!/usr/bin/env node

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
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

// 画像をリサイズする関数
function resizeImages(imagePath) {
  const fileName = path.basename(imagePath, path.extname(imagePath));
  const dir = path.dirname(imagePath);
  
  console.log(`📐 Resizing images for: ${fileName}`);
  
  try {
    // オリジナル画像をコピー
    const originalPath = path.join(dir, 'originals', `${fileName}.png`);
    if (fs.existsSync(originalPath)) {
      console.log(`✅ Original already exists: ${originalPath}`);
    } else {
      console.log(`⚠️  Original not found: ${originalPath}`);
    }

    // サムネイル画像を作成
    const thumbnailPath = path.join(dir, 'thumbnails', `${fileName}-thumb.png`);
    const thumbnailWebpPath = path.join(dir, 'thumbnails', `${fileName}-thumb.webp`);
    
    if (!fs.existsSync(thumbnailPath)) {
      execSync(`node scripts/resize-images-smart.js "${imagePath}"`, { stdio: 'inherit' });
      console.log(`✅ Thumbnail created: ${thumbnailPath}`);
    } else {
      console.log(`✅ Thumbnail already exists: ${thumbnailPath}`);
    }

    // WebP画像を作成
    const webpPath = imagePath.replace('.png', '.webp');
    if (!fs.existsSync(webpPath)) {
      execSync(`node scripts/resize-images-smart.js "${imagePath}"`, { stdio: 'inherit' });
      console.log(`✅ WebP created: ${webpPath}`);
    } else {
      console.log(`✅ WebP already exists: ${webpPath}`);
    }

    return {
      original: originalPath,
      main: imagePath,
      webp: webpPath,
      thumbnail: thumbnailPath,
      thumbnailWebp: thumbnailWebpPath
    };
  } catch (error) {
    console.error(`❌ Error resizing images for ${fileName}:`, error.message);
    throw error;
  }
}

// 画像をR2にアップロードする関数
async function uploadToR2(filePath, key) {
  try {
    const fileContent = fs.readFileSync(filePath);
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: path.extname(filePath) === '.webp' ? 'image/webp' : 'image/png',
      CacheControl: 'public, max-age=31536000, immutable', // 1年キャッシュ
      Metadata: {
        'optimized': 'true',
        'uploaded-at': new Date().toISOString(),
      },
    });

    await r2Client.send(command);
    console.log(`✅ Uploaded: ${key}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to upload ${key}:`, error.message);
    return false;
  }
}

// imageUrl.tsを更新する関数
function updateImageUrlTs(newImages) {
  const imageUrlPath = 'app/utils/imageUrl.ts';
  let content = fs.readFileSync(imageUrlPath, 'utf8');
  
  // 新しい画像をMIGRATED_IMAGESに追加
  const newImageEntries = newImages.flatMap(img => [
    `${img.main.replace('public/images/illustrations/', '')}`,
    `${img.webp.replace('public/images/illustrations/', '')}`,
    `${img.thumbnail.replace('public/images/thumbnails/', '')}`,
    `${img.thumbnailWebp.replace('public/images/thumbnails/', '')}`
  ]);

  // MIGRATED_IMAGESの配列に新しい画像を追加
  const setStart = content.indexOf('const MIGRATED_IMAGES = new Set([');
  const setEnd = content.indexOf(']);', setStart);
  
  if (setStart !== -1 && setEnd !== -1) {
    const beforeSet = content.substring(0, setStart);
    const afterSet = content.substring(setEnd);
    const currentSet = content.substring(setStart, setEnd + 3);
    
    // 新しい画像エントリを追加
    const newEntries = newImageEntries.map(img => `  '${img}',`).join('\n');
    const updatedSet = currentSet.replace(']);', `  ${newEntries}\n]);`);
    
    content = beforeSet + updatedSet + afterSet;
    
    fs.writeFileSync(imageUrlPath, content);
    console.log(`✅ Updated ${imageUrlPath} with new images`);
  }
}

// メイン処理
async function main() {
  console.log('🚀 Starting new image addition process...');
  
  // 環境変数の確認
  validateEnvironment();
  
  // コマンドライン引数から画像パスを取得
  const imagePath = process.argv[2];
  
  if (!imagePath) {
    console.error('💥 Please provide an image path as an argument');
    console.error('Usage: node scripts/add-new-images.js path/to/image.png');
    process.exit(1);
  }

  if (!fs.existsSync(imagePath)) {
    console.error(`💥 Image file not found: ${imagePath}`);
    process.exit(1);
  }

  try {
    // 画像をリサイズ
    const resizedImages = resizeImages(imagePath);
    
    // 画像をR2にアップロード
    const uploadPromises = [];
    
    // メイン画像
    uploadPromises.push(
      uploadToR2(resizedImages.main, `images/illustrations/${path.basename(resizedImages.main)}`)
    );
    uploadPromises.push(
      uploadToR2(resizedImages.webp, `images/illustrations/${path.basename(resizedImages.webp)}`)
    );
    
    // サムネイル画像
    uploadPromises.push(
      uploadToR2(resizedImages.thumbnail, `images/thumbnails/${path.basename(resizedImages.thumbnail)}`)
    );
    uploadPromises.push(
      uploadToR2(resizedImages.thumbnailWebp, `images/thumbnails/${path.basename(resizedImages.thumbnailWebp)}`)
    );
    
    // オリジナル画像（存在する場合）
    if (fs.existsSync(resizedImages.original)) {
      uploadPromises.push(
        uploadToR2(resizedImages.original, `images/originals/${path.basename(resizedImages.original)}`)
      );
    }
    
    const results = await Promise.all(uploadPromises);
    const successCount = results.filter(Boolean).length;
    
    if (successCount === uploadPromises.length) {
      console.log('🎉 All images uploaded successfully to Cloudflare R2!');
      
      // imageUrl.tsを更新
      updateImageUrlTs([resizedImages]);
      
      console.log('\n📋 Next steps:');
      console.log('1. Update illustrations.ts with new image data');
      console.log('2. Test the new images locally: npm run dev');
      console.log('3. Deploy to Vercel: npx vercel --prod');
      
    } else {
      console.error(`❌ Some uploads failed. ${successCount}/${uploadPromises.length} succeeded.`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('💥 Process failed:', error.message);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { resizeImages, uploadToR2, updateImageUrlTs };
