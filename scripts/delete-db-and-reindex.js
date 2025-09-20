#!/usr/bin/env node

const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
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

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const redis = Redis.fromEnv();

// R2のオブジェクト一覧を取得
async function listR2Objects(prefix = '') {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    });
    const response = await r2Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error(`❌ Failed to list objects:`, error.message);
    return [];
  }
}

// 指定されたIDのイラストをDBから削除（R2は触らない）
async function deleteIllustrationsFromDB(idsToDelete) {
  console.log(`🗑️  Deleting illustrations from DB with IDs: ${idsToDelete.join(', ')}`);
  
  for (const id of idsToDelete) {
    try {
      // DBから削除
      await redis.del(`illustration:${id}`);
      await redis.del(`downloads:${id}`);
      console.log(`✅ Deleted from DB: illustration:${id}`);
      
    } catch (error) {
      console.error(`❌ Error deleting illustration ${id}:`, error.message);
    }
  }
}

// 残ったイラストのIDを再配置
async function reindexRemainingIllustrations() {
  console.log('🔄 Reindexing remaining illustrations...');
  
  const keys = await redis.keys('illustration:*');
  const items = [];
  
  for (const key of keys) {
    if (!/^illustration:\d+$/.test(key)) continue;
    const raw = await redis.get(key);
    if (!raw) continue;
    const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
    items.push({ key, id: data.id, data });
  }
  
  if (items.length === 0) {
    console.log('No illustrations found.');
    return;
  }
  
  // ID昇順で並べ替え
  items.sort((a, b) => (a.id || 0) - (b.id || 0));
  
  let newId = 1;
  let moved = 0;
  
  for (const item of items) {
    const oldId = item.id;
    if (oldId === newId) { 
      newId++; 
      continue; 
    }
    
    // 既存の新IDが万が一存在する場合は一時退避（衝突回避）
    const tempKey = `illustration:tmp:${newId}`;
    const existsNew = await redis.get(`illustration:${newId}`);
    if (existsNew) {
      await redis.set(tempKey, JSON.stringify(existsNew));
    }
    
    // 元データを新IDにコピー
    const updated = { ...item.data, id: newId, updatedAt: new Date().toISOString() };
    await redis.set(`illustration:${newId}`, JSON.stringify(updated));
    
    // downloads を移設
    const oldDl = await redis.get(`downloads:${oldId}`);
    if (oldDl !== null && oldDl !== undefined) {
      await redis.set(`downloads:${newId}`, Number(oldDl) || 0);
    }
    
    // 旧キー削除
    await redis.del(`illustration:${oldId}`);
    await redis.del(`downloads:${oldId}`);
    
    // 衝突退避から戻す（ほぼ発生しない想定）
    if (existsNew) {
      const restored = await redis.get(tempKey);
      if (restored) {
        await redis.set(`illustration:${oldId}`, JSON.stringify(restored));
      }
      await redis.del(tempKey);
    }
    
    console.log(`✅ Reindexed ${oldId} -> ${newId}`);
    moved++;
    newId++;
  }
  
  // next_id を更新
  const finalMaxId = items.length; // 1..N
  await redis.set('illustration:next_id', finalMaxId + 1);
  console.log(`🎉 Done. Moved ${moved} items. next_id=${finalMaxId + 1}`);
}

// kidsフォルダの画像を処理してDB登録
async function processKidsFolder() {
  console.log('👶 Processing kids folder...');
  
  // R2のkidsフォルダ内の画像を取得
  const kidsObjects = await listR2Objects('images/originals/kids/');
  
  if (kidsObjects.length === 0) {
    console.log('❌ No images found in kids folder');
    return;
  }
  
  console.log(`📁 Found ${kidsObjects.length} objects in kids folder`);
  
  // 画像ファイルのみフィルタリング
  const imageFiles = kidsObjects.filter(obj => {
    const key = obj.Key;
    return key.match(/\.(png|jpg|jpeg|webp)$/i) && !key.includes('-thumb');
  });
  
  console.log(`🖼️  Found ${imageFiles.length} image files to process`);
  
  for (const imageFile of imageFiles) {
    const key = imageFile.Key;
    const fileName = key.split('/').pop().replace(/\.(png|jpg|jpeg|webp)$/i, '');
    
    try {
      // ファイル名から情報を抽出 (kid-boy-dance1 -> Boy Dance 1)
      let title = fileName.replace(/^kid-/, '').replace(/_/g, ' ').replace(/-/g, ' ');
      // 最初の文字を大文字に
      title = title.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      
      const category = 'kids';
      const tags = ['子供', 'キッズ', 'イラスト'];
      
      // 男の子か女の子かを判定してタグに追加
      if (fileName.includes('boy')) {
        tags.push('男の子');
      }
      if (fileName.includes('girl')) {
        tags.push('女の子');
      }
      
      // アクションを判定してタグに追加
      if (fileName.includes('dance')) {
        tags.push('ダンス');
      }
      if (fileName.includes('jump')) {
        tags.push('ジャンプ');
      }
      if (fileName.includes('run')) {
        tags.push('走る');
      }
      
      // 新しいIDを取得
      const nextId = await redis.incr('illustration:next_id');
      
      const now = new Date().toISOString();
      const illustration = {
        id: nextId,
        title: title,
        imageUrl: `https://${process.env.CLOUDFLARE_R2_PUBLIC_URL}/images/originals/kids/${fileName}.png`,
        thumbnailUrl: `https://${process.env.CLOUDFLARE_R2_PUBLIC_URL}/images/originals/kids/${fileName}.png`,
        originalUrl: `https://${process.env.CLOUDFLARE_R2_PUBLIC_URL}/images/originals/kids/${fileName}.png`,
        category: category,
        tags: tags,
        downloads: 0,
        fileSize: '',
        dimensions: '',
        createdAt: now,
        updatedAt: now
      };
      
      // DBに保存
      await redis.set(`illustration:${nextId}`, JSON.stringify(illustration));
      await redis.set(`downloads:${nextId}`, 0);
      
      console.log(`✅ Added illustration ${nextId}: ${title}`);
      
    } catch (error) {
      console.error(`❌ Failed to process ${fileName}:`, error.message);
    }
  }
}

// メイン処理
async function main() {
  try {
    console.log('🚀 Starting delete and reindex process...');
    
    // 環境変数の確認
    if (!process.env.CLOUDFLARE_R2_ACCOUNT_ID || 
        !process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || 
        !process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ||
        !process.env.CLOUDFLARE_R2_BUCKET_NAME) {
      throw new Error('Missing required R2 environment variables');
    }
    
    // ステップ1: id1-13のイラストをDBから削除
    const idsToDelete = Array.from({length: 13}, (_, i) => i + 1);
    await deleteIllustrationsFromDB(idsToDelete);
    
    // ステップ2: 残った画像のIDを再配置
    await reindexRemainingIllustrations();
    
    // ステップ3: kidsフォルダの画像を処理
    await processKidsFolder();
    
    console.log('🎉 All operations completed successfully!');
    
  } catch (error) {
    console.error('💥 Process failed:', error.message);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { deleteIllustrationsFromDB, reindexRemainingIllustrations, processKidsFolder };
