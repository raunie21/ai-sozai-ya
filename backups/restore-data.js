#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function restoreData() {
  try {
    console.log('🔄 データを復元中...');
    
    const redis = Redis.fromEnv();
    const backupData = JSON.parse(fs.readFileSync('upstash-backup-2025-10-01T11-41-18-756Z.json', 'utf8'));
    
    console.log(`📊 復元対象: ${Object.keys(backupData.data).length}件`);
    
    let restoredCount = 0;
    for (const [key, value] of Object.entries(backupData.data)) {
      if (value.error) {
        console.warn(`⚠️  スキップ: ${key} (エラーあり)`);
        continue;
      }
      
      await redis.set(key, value);
      restoredCount++;
      
      if (restoredCount % 10 === 0) {
        console.log(`📈 復元進行状況: ${restoredCount}/${Object.keys(backupData.data).length}`);
      }
    }
    
    console.log(`✅ 復元完了: ${restoredCount}件`);
    
  } catch (error) {
    console.error('❌ 復元中にエラー:', error);
  }
}

restoreData();
