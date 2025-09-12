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

// 画像をR2にアップロードする関数
async function uploadImageToR2(filePath, key) {
  try {
    const fileContent = fs.readFileSync(filePath);
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: getContentType(filePath),
      CacheControl: 'public, max-age=31536000, immutable', // 1年キャッシュ
      Metadata: {
        'optimized': 'true',
        'uploaded-at': new Date().toISOString(),
      },
    });

    await r2Client.send(command);
    console.log(`✅ Uploaded: ${key}`);
    return `https://${BUCKET_NAME}.${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
  } catch (error) {
    console.error(`❌ Failed to upload ${key}:`, error.message);
    throw error;
  }
}

// ファイル拡張子からContent-Typeを取得
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentTypes = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  return contentTypes[ext] || 'application/octet-stream';
}

// ディレクトリ内の画像を再帰的にアップロード
async function uploadDirectoryToR2(dirPath, baseKey = '') {
  const items = fs.readdirSync(dirPath);
  
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const key = baseKey ? `${baseKey}/${item}` : item;
    
    if (fs.statSync(fullPath).isDirectory()) {
      await uploadDirectoryToR2(fullPath, key);
    } else if (isImageFile(item)) {
      await uploadImageToR2(fullPath, key);
    }
  }
}

// 画像ファイルかどうかを判定
function isImageFile(filename) {
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
  return imageExtensions.some(ext => filename.toLowerCase().endsWith(ext));
}

// メイン実行関数
async function main() {
  try {
    console.log('🚀 Starting image upload to Cloudflare R2...');
    
    // 環境変数の確認
    if (!process.env.CLOUDFLARE_R2_ACCOUNT_ID || 
        !process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || 
        !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
      throw new Error('Missing required environment variables. Please check your .env file.');
    }

    // public/images ディレクトリをアップロード
    const imagesDir = path.join(__dirname, '..', 'public', 'images');
    
    if (!fs.existsSync(imagesDir)) {
      throw new Error('Images directory not found. Please check the path.');
    }

    await uploadDirectoryToR2(imagesDir, 'images');
    
    console.log('🎉 All images uploaded successfully to Cloudflare R2!');
    console.log(`📁 Bucket: ${BUCKET_NAME}`);
    console.log(`🌐 Public URL: https://${BUCKET_NAME}.${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`);
    
  } catch (error) {
    console.error('💥 Upload failed:', error.message);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  main();
}

module.exports = { uploadImageToR2, uploadDirectoryToR2 };
