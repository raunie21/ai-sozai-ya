const { S3Client, ListObjectsV2Command, CopyObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Redis } = require('@upstash/redis');
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

// キャラクター名のマッピング（ファイル名からキャラクター名を推測）
const characterMapping = {
  'boy-friend': 'Kids',
  'boy-smile': 'Kids',
  'girl-smile': 'Kids',
  'grandfather': 'Elderly',
  'man-japanese': 'Business-Man',
  'man-old': 'Elderly',
  'man-smile': 'Business-Man',
  'american-man': 'Business-Man'
};

// 既存のイラストデータを取得
async function getExistingIllustrations() {
  try {
    const keys = await redis.keys('illustration:*');
    const illustrations = await redis.mget(...keys);
    
    return illustrations.map((illustration, index) => {
      if (!illustration) return null;
      const data = typeof illustration === 'string' ? JSON.parse(illustration) : illustration;
      return data;
    }).filter(Boolean);
  } catch (error) {
    console.error('Error fetching illustrations:', error);
    return [];
  }
}

// ファイル名からキャラクター名を推測
function guessCharacterName(fileName) {
  for (const [pattern, character] of Object.entries(characterMapping)) {
    if (fileName.includes(pattern)) {
      return character;
    }
  }
  return 'General';
}

// 画像をキャラクター別フォルダに移動
async function moveImageToCharacterFolder(oldKey, newKey) {
  try {
    // コピー
    await r2Client.send(new CopyObjectCommand({
      Bucket: BUCKET_NAME,
      CopySource: `${BUCKET_NAME}/${oldKey}`,
      Key: newKey,
    }));
    
    // 元ファイルを削除
    await r2Client.send(new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: oldKey,
    }));
    
    console.log(`✅ Moved: ${oldKey} → ${newKey}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to move ${oldKey}:`, error.message);
    return false;
  }
}

// イラストデータのURLを更新
async function updateIllustrationUrls(illustrationId, newOriginalUrl, newThumbnailUrl, newImageUrl) {
  try {
    const existing = await redis.get(`illustration:${illustrationId}`);
    if (!existing) return false;
    
    const data = typeof existing === 'string' ? JSON.parse(existing) : existing;
    const updatedData = {
      ...data,
      originalUrl: newOriginalUrl,
      thumbnailUrl: newThumbnailUrl,
      imageUrl: newImageUrl,
      updatedAt: new Date().toISOString()
    };
    
    await redis.set(`illustration:${illustrationId}`, JSON.stringify(updatedData));
    console.log(`✅ Updated URLs for illustration ${illustrationId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to update illustration ${illustrationId}:`, error.message);
    return false;
  }
}

// メイン実行関数
async function main() {
  try {
    console.log('🚀 Organizing images by character...');
    
    // 既存のイラストデータを取得
    const illustrations = await getExistingIllustrations();
    console.log(`📊 Found ${illustrations.length} illustrations`);
    
    let movedCount = 0;
    let updatedCount = 0;
    
    for (const illustration of illustrations) {
      const originalUrl = illustration.originalUrl;
      if (!originalUrl) continue;
      
      // URLからファイル名を抽出
      const urlParts = originalUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const oldKey = `images/originals/${fileName}`;
      
      // キャラクター名を推測
      const characterName = guessCharacterName(fileName);
      const newKey = `images/originals/${characterName}/${fileName}`;
      
      // ファイルを移動
      const moved = await moveImageToCharacterFolder(oldKey, newKey);
      if (moved) {
        movedCount++;
        
        // サムネイルも移動（存在する場合）
        const thumbnailUrl = illustration.thumbnailUrl;
        if (thumbnailUrl) {
          const thumbUrlParts = thumbnailUrl.split('/');
          const thumbFileName = thumbUrlParts[thumbUrlParts.length - 1];
          const oldThumbKey = `images/thumbnails/${thumbFileName}`;
          const newThumbKey = `images/originals/${characterName}/${thumbFileName}`;
          
          await moveImageToCharacterFolder(oldThumbKey, newThumbKey);
        }
        
        // 新しいURLを生成
        const newOriginalUrl = originalUrl.replace(`images/originals/${fileName}`, `images/originals/${characterName}/${fileName}`);
        const newThumbnailUrl = illustration.thumbnailUrl?.replace(`images/thumbnails/`, `images/originals/${characterName}/`);
        const newImageUrl = illustration.imageUrl?.replace(`images/originals/${fileName}`, `images/originals/${characterName}/${fileName}`);
        
        // データベースのURLを更新
        const updated = await updateIllustrationUrls(
          illustration.id,
          newOriginalUrl,
          newThumbnailUrl,
          newImageUrl
        );
        
        if (updated) {
          updatedCount++;
        }
      }
    }
    
    console.log('🎉 Organization completed!');
    console.log(`📁 Moved ${movedCount} images`);
    console.log(`🔄 Updated ${updatedCount} database records`);
    
  } catch (error) {
    console.error('💥 Organization failed:', error.message);
    process.exit(1);
  }
}

// スクリプトが直接実行された場合のみ実行
if (require.main === module) {
  main();
}

module.exports = { moveImageToCharacterFolder, updateIllustrationUrls };
