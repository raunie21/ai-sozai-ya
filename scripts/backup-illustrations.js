#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const redis = Redis.fromEnv();

// イラストデータをバックアップ
async function backupIllustrations() {
  console.log('💾 Creating backup of illustrations...');
  
  try {
    const keys = await redis.keys('illustration:*');
    const downloadKeys = await redis.keys('downloads:*');
    
    const backup = {
      timestamp: new Date().toISOString(),
      illustrations: {},
      downloads: {}
    };
    
    // イラストデータを取得
    for (const key of keys) {
      if (!/^illustration:\d+$/.test(key)) continue;
      const data = await redis.get(key);
      if (data) {
        backup.illustrations[key] = data;
      }
    }
    
    // ダウンロード数を取得
    for (const key of downloadKeys) {
      if (!/^downloads:\d+$/.test(key)) continue;
      const data = await redis.get(key);
      if (data !== null) {
        backup.downloads[key] = data;
      }
    }
    
    // next_idも保存
    const nextId = await redis.get('illustration:next_id');
    backup.next_id = nextId;
    
    // ファイルに保存
    const backupFile = `backup-illustrations-${Date.now()}.json`;
    fs.writeFileSync(backupFile, JSON.stringify(backup, null, 2));
    
    console.log(`✅ Backup created: ${backupFile}`);
    console.log(`📊 Backed up ${Object.keys(backup.illustrations).length} illustrations`);
    console.log(`📊 Backed up ${Object.keys(backup.downloads).length} download counts`);
    console.log(`🔢 Next ID: ${nextId}`);
    
    return backupFile;
    
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    throw error;
  }
}

// メイン処理
async function main() {
  try {
    await backupIllustrations();
  } catch (error) {
    console.error('💥 Backup process failed:', error.message);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { backupIllustrations };
