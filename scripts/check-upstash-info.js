#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

const redis = Redis.fromEnv();

async function checkUpstashInfo() {
  try {
    console.log('🔍 Upstash Redis 情報を確認中...\n');
    
    // 1. 基本的な接続テスト
    console.log('📡 接続テスト:');
    console.log('=' .repeat(50));
    
    try {
      const pingResult = await redis.ping();
      console.log(`✅ PING: ${pingResult}`);
    } catch (error) {
      console.log(`❌ PING失敗: ${error.message}`);
      return;
    }

    // 2. データベース情報
    console.log('\n📊 データベース情報:');
    console.log('=' .repeat(50));
    
    try {
      const info = await redis.info();
      console.log('ℹ️  Redis INFO:');
      console.log(info);
    } catch (error) {
      console.log(`⚠️  INFO取得失敗: ${error.message}`);
    }

    // 3. キー統計
    console.log('\n🔑 キー統計:');
    console.log('=' .repeat(50));
    
    // 全キーを取得
    const allKeys = await redis.keys('*');
    console.log(`📊 総キー数: ${allKeys.length}`);
    
    // キーのパターン別集計
    const keyPatterns = {};
    allKeys.forEach(key => {
      const pattern = key.split(':')[0];
      keyPatterns[pattern] = (keyPatterns[pattern] || 0) + 1;
    });
    
    console.log('\n📋 キーパターン別統計:');
    Object.entries(keyPatterns).forEach(([pattern, count]) => {
      console.log(`  ${pattern}: ${count}個`);
    });

    // 4. イラストデータの詳細
    console.log('\n🎨 イラストデータ詳細:');
    console.log('=' .repeat(50));
    
    const illustrationKeys = allKeys.filter(key => key.startsWith('illustration:') && key !== 'illustration:next_id');
    console.log(`📸 イラスト数: ${illustrationKeys.length}`);
    
    if (illustrationKeys.length > 0) {
      // next_id確認
      const nextId = await redis.get('illustration:next_id');
      console.log(`🆔 次のID: ${nextId}`);
      
      // ID範囲確認
      const ids = illustrationKeys
        .map(key => parseInt(key.split(':')[1]))
        .filter(id => !isNaN(id))
        .sort((a, b) => a - b);
      
      console.log(`📈 ID範囲: ${Math.min(...ids)} - ${Math.max(...ids)}`);
      
      // 欠番確認
      const missingIds = [];
      for (let i = Math.min(...ids); i <= Math.max(...ids); i++) {
        if (!ids.includes(i)) {
          missingIds.push(i);
        }
      }
      
      if (missingIds.length > 0) {
        console.log(`❌ 欠番ID: ${missingIds.join(', ')}`);
      } else {
        console.log('✅ 欠番なし');
      }
    }

    // 5. ダウンロード統計
    console.log('\n📥 ダウンロード統計:');
    console.log('=' .repeat(50));
    
    const downloadKeys = allKeys.filter(key => key.startsWith('downloads:'));
    console.log(`📊 ダウンロード記録数: ${downloadKeys.length}`);
    
    if (downloadKeys.length > 0) {
      let totalDownloads = 0;
      const downloadCounts = [];
      
      for (const key of downloadKeys.slice(0, 10)) { // 最初の10個をサンプル
        const count = await redis.get(key);
        const numCount = parseInt(count) || 0;
        totalDownloads += numCount;
        downloadCounts.push({ key, count: numCount });
      }
      
      console.log(`📈 サンプル総ダウンロード数: ${totalDownloads}`);
      console.log('🔝 サンプルダウンロード数:');
      downloadCounts
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .forEach(({ key, count }) => {
          const id = key.split(':')[1];
          console.log(`  ID ${id}: ${count}回`);
        });
    }

    // 6. メモリ使用量（可能な場合）
    console.log('\n💾 メモリ情報:');
    console.log('=' .repeat(50));
    
    try {
      const memory = await redis.memory('usage', 'illustration:1');
      console.log(`📊 サンプルキーメモリ使用量: ${memory} bytes`);
    } catch (error) {
      console.log(`⚠️  メモリ情報取得不可: ${error.message}`);
    }

    // 7. 環境変数確認（セキュリティ上、一部のみ）
    console.log('\n⚙️  環境設定:');
    console.log('=' .repeat(50));
    
    const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
    if (upstashUrl) {
      const urlParts = new URL(upstashUrl);
      console.log(`🌐 エンドポイント: ${urlParts.hostname}`);
      console.log(`🔒 プロトコル: ${urlParts.protocol}`);
    } else {
      console.log('⚠️  UPSTASH_REDIS_REST_URL が設定されていません');
    }

    console.log('\n✅ Upstash情報確認完了！');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    console.error('スタックトレース:', error.stack);
  }
}

// メイン実行
if (require.main === module) {
  checkUpstashInfo().catch(console.error);
}




