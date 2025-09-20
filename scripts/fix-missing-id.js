#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

const redis = Redis.fromEnv();

// 欠けているIDを修正
async function fixMissingIds() {
  console.log('🔧 Fixing missing IDs...');
  
  try {
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
    
    console.log('Current IDs:', items.map(item => item.id));
    
    // 完全にリインデックス（1から連番で）
    let newId = 1;
    const updates = [];
    
    for (const item of items) {
      const oldId = item.id;
      if (oldId !== newId) {
        updates.push({ oldId, newId, data: item.data });
      }
      newId++;
    }
    
    // 全てのアップデートを実行
    for (const update of updates) {
      // 新しいIDで保存
      const updatedData = { ...update.data, id: update.newId, updatedAt: new Date().toISOString() };
      await redis.set(`illustration:${update.newId}`, JSON.stringify(updatedData));
      
      // downloadsも移動
      const oldDl = await redis.get(`downloads:${update.oldId}`);
      if (oldDl !== null && oldDl !== undefined) {
        await redis.set(`downloads:${update.newId}`, Number(oldDl) || 0);
        await redis.del(`downloads:${update.oldId}`);
      }
      
      // 古いIDを削除
      await redis.del(`illustration:${update.oldId}`);
      
      console.log(`✅ Fixed ID ${update.oldId} -> ${update.newId}: ${updatedData.title}`);
    }
    
    // next_idを更新
    const finalMaxId = items.length;
    await redis.set('illustration:next_id', finalMaxId + 1);
    
    console.log(`🎉 Fixed ${updates.length} illustrations. Next ID: ${finalMaxId + 1}`);
    
  } catch (error) {
    console.error('❌ Fix failed:', error.message);
    throw error;
  }
}

// メイン処理
async function main() {
  try {
    await fixMissingIds();
  } catch (error) {
    console.error('💥 Fix process failed:', error.message);
    process.exit(1);
  }
}

// スクリプト実行
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { fixMissingIds };
