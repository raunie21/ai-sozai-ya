const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { Redis } = require('@upstash/redis');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
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

// Upstash Redis クライアント
const redis = Redis.fromEnv();

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL;

// コマンドライン引数からパラメータを取得
const args = process.argv.slice(2);
const imagePath = args[0];
const title = args[1];
const characterName = args[2] || 'General'; // キャラクター名（デフォルト: General）
const category = args[3] || 'people';
const tags = args[4] ? args[4].split(',') : [];

if (!imagePath || !title) {
  console.log('使用方法: node add-image-with-db.js <画像パス> <タイトル> [キャラクター名] [カテゴリ] [タグ(カンマ区切り)]');
  console.log('例: node add-image-with-db.js ./new-image.png "新しいイラスト" John people "タグ1,タグ2"');
  console.log('例: node add-image-with-db.js ./new-image.png "新しいイラスト" Sarah business "タグ1,タグ2"');
  process.exit(1);
}

// 画像をR2にアップロードする関数
async function uploadImageToR2(filePath, key) {
  try {
    const fileContent = fs.readFileSync(filePath);
    
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileContent,
      ContentType: getContentType(filePath),
      CacheControl: 'public, max-age=31536000, immutable',
      Metadata: {
        'optimized': 'true',
        'uploaded-at': new Date().toISOString(),
      },
    });

    await r2Client.send(command);
    console.log(`✅ Uploaded: ${key}`);
    return `${R2_PUBLIC_URL}/${key}`;
  } catch (error) {
    console.error(`❌ Failed to upload ${key}:`, error.message);
    throw error;
  }
}

// サムネイル画像を生成
async function generateThumbnail(inputPath, outputPath, size = 300) {
  try {
    await sharp(inputPath)
      .resize(size, size, { fit: 'cover', position: 'center' })
      .webp({ quality: 80 })
      .toFile(outputPath);
    console.log(`✅ Generated thumbnail: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Failed to generate thumbnail:`, error.message);
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

// ファイルサイズを取得
function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  const fileSizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(1);
  return `${fileSizeInMB}MB`;
}

// 画像の寸法を取得
async function getImageDimensions(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    return `${metadata.width}x${metadata.height}`;
  } catch (error) {
    console.warn('Could not get image dimensions:', error.message);
    return 'unknown';
  }
}

// 新しいイラストをDBに追加
async function addIllustrationToDB(illustrationData) {
  try {
    // 新しいIDを生成
    const nextId = await redis.incr('illustration:next_id');
    
    const now = new Date().toISOString();
    const illustration = {
      ...illustrationData,
      id: nextId,
      downloads: 0,
      createdAt: now,
      updatedAt: now
    };

    // Upstashに保存
    await redis.set(`illustration:${nextId}`, JSON.stringify(illustration));
    
    // ダウンロード数の初期化
    await redis.set(`downloads:${nextId}`, 0);

    console.log(`✅ Added to database: ID ${nextId}`);
    return illustration;
  } catch (error) {
    console.error('❌ Failed to add to database:', error.message);
    throw error;
  }
}

// メイン実行関数
async function main() {
  try {
    console.log('🚀 Adding new image to R2 and database...');
    
    // 環境変数の確認
    if (!process.env.CLOUDFLARE_R2_ACCOUNT_ID || 
        !process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || 
        !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ||
        !process.env.UPSTASH_REDIS_REST_URL ||
        !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error('Missing required environment variables. Please check your .env file.');
    }

    // 画像ファイルの存在確認
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Image file not found: ${imagePath}`);
    }

    // ファイル名を生成
    const fileName = path.basename(imagePath, path.extname(imagePath));
    const fileExt = path.extname(imagePath);
    
    // 画像の寸法とファイルサイズを取得
    const dimensions = await getImageDimensions(imagePath);
    const fileSize = getFileSize(imagePath);

    // 1. オリジナル画像をR2にアップロード（キャラクター名フォルダに保存）
    const originalKey = `images/originals/${characterName}/${fileName}${fileExt}`;
    const originalUrl = await uploadImageToR2(imagePath, originalKey);

    // 2. サムネイル画像を生成してアップロード（キャラクター名フォルダに保存）
    const tempThumbnailPath = path.join(__dirname, '..', 'temp', `${fileName}-thumb.webp`);
    const thumbnailKey = `images/originals/${characterName}/${fileName}-thumb.webp`;
    
    // 一時ディレクトリを作成
    const tempDir = path.dirname(tempThumbnailPath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    await generateThumbnail(imagePath, tempThumbnailPath);
    const thumbnailUrl = await uploadImageToR2(tempThumbnailPath, thumbnailKey);
    
    // 一時ファイルを削除
    fs.unlinkSync(tempThumbnailPath);

    // 3. メイン画像（リサイズ版）のURLを生成（Cloudflare Image Resizing使用）
    const mainImageUrl = `${R2_PUBLIC_URL}/cdn-cgi/image/width=600,height=600,fit=cover,gravity=center/images/originals/${characterName}/${fileName}${fileExt}`;

    // 4. イラストデータを作成
    const illustrationData = {
      title,
      imageUrl: mainImageUrl,
      thumbnailUrl: thumbnailUrl,
      originalUrl: originalUrl,
      category,
      tags,
      fileSize,
      dimensions
    };

    // 5. データベースに追加
    const illustration = await addIllustrationToDB(illustrationData);

    console.log('🎉 Image added successfully!');
    console.log(`📊 ID: ${illustration.id}`);
    console.log(`👤 Character: ${characterName}`);
    console.log(`📝 Title: ${illustration.title}`);
    console.log(`🏷️  Category: ${illustration.category}`);
    console.log(`🏷️  Tags: ${illustration.tags.join(', ')}`);
    console.log(`📏 Dimensions: ${illustration.dimensions}`);
    console.log(`💾 File Size: ${illustration.fileSize}`);
    console.log(`🔗 Original URL: ${illustration.originalUrl}`);
    console.log(`🔗 Thumbnail URL: ${illustration.thumbnailUrl}`);
    console.log(`🔗 Main Image URL: ${illustration.imageUrl}`);
    
  } catch (error) {
    console.error('💥 Failed to add image:', error.message);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  main();
}

module.exports = { addIllustrationToDB };
