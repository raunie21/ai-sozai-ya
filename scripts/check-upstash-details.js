#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
require('dotenv').config({ path: '.env.local' });

const redis = Redis.fromEnv();

async function checkUpstashDetails() {
  try {
    console.log('🔍 Upstash Redis 詳細情報を確認中...\n');
    
    // 1. 環境変数の詳細確認
    console.log('⚙️  環境変数情報:');
    console.log('=' .repeat(60));
    
    const envVars = {
      'UPSTASH_REDIS_REST_URL': process.env.UPSTASH_REDIS_REST_URL,
      'UPSTASH_REDIS_REST_TOKEN': process.env.UPSTASH_REDIS_REST_TOKEN ? '***設定済み***' : '未設定'
    };
    
    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`${key}: ${value || '未設定'}`);
    });

    // 2. データベースの詳細統計
    console.log('\n📊 データベース詳細統計:');
    console.log('=' .repeat(60));
    
    const allKeys = await redis.keys('*');
    
    // キーサイズの推定
    let totalEstimatedSize = 0;
    const sampleKeys = allKeys.slice(0, 10);
    
    for (const key of sampleKeys) {
      const value = await redis.get(key);
      const size = JSON.stringify(value).length;
      totalEstimatedSize += size;
    }
    
    const avgSize = totalEstimatedSize / sampleKeys.length;
    const estimatedTotalSize = avgSize * allKeys.length;
    
    console.log(`📏 サンプルキー数: ${sampleKeys.length}`);
    console.log(`📊 平均キーサイズ: ${Math.round(avgSize)} bytes`);
    console.log(`📈 推定総サイズ: ${Math.round(estimatedTotalSize / 1024)} KB`);

    // 3. イラストデータの詳細分析
    console.log('\n🎨 イラストデータ分析:');
    console.log('=' .repeat(60));
    
    const illustrationKeys = allKeys.filter(key => key.startsWith('illustration:') && key !== 'illustration:next_id');
    
    // カテゴリ別統計
    const categoryStats = {};
    const tagStats = {};
    let totalTags = 0;
    
    for (const key of illustrationKeys.slice(0, 20)) { // 最初の20個をサンプル
      const data = await redis.get(key);
      if (data) {
        const illustration = typeof data === 'string' ? JSON.parse(data) : data;
        
        // カテゴリ統計
        categoryStats[illustration.category] = (categoryStats[illustration.category] || 0) + 1;
        
        // タグ統計
        if (illustration.tags && Array.isArray(illustration.tags)) {
          totalTags += illustration.tags.length;
          illustration.tags.forEach(tag => {
            tagStats[tag] = (tagStats[tag] || 0) + 1;
          });
        }
      }
    }
    
    console.log('📂 カテゴリ別統計（サンプル）:');
    Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count}件`);
      });
    
    console.log('\n🏷️  人気タグ TOP10（サンプル）:');
    Object.entries(tagStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .forEach(([tag, count]) => {
        console.log(`  ${tag}: ${count}回`);
      });
    
    console.log(`\n📊 平均タグ数: ${Math.round(totalTags / Math.min(20, illustrationKeys.length))}個/イラスト`);

    // 4. 最新・最古のデータ確認
    console.log('\n📅 データの時系列情報:');
    console.log('=' .repeat(60));
    
    const timestamps = [];
    for (const key of illustrationKeys.slice(0, 10)) {
      const data = await redis.get(key);
      if (data) {
        const illustration = typeof data === 'string' ? JSON.parse(data) : data;
        if (illustration.createdAt) {
          timestamps.push({
            id: illustration.id,
            title: illustration.title,
            createdAt: new Date(illustration.createdAt)
          });
        }
      }
    }
    
    if (timestamps.length > 0) {
      timestamps.sort((a, b) => a.createdAt - b.createdAt);
      const oldest = timestamps[0];
      const newest = timestamps[timestamps.length - 1];
      
      console.log(`📅 最古のデータ: ID ${oldest.id} "${oldest.title}" (${oldest.createdAt.toLocaleString('ja-JP')})`);
      console.log(`📅 最新のデータ: ID ${newest.id} "${newest.title}" (${newest.createdAt.toLocaleString('ja-JP')})`);
    }

    // 5. データベース健全性チェック
    console.log('\n🔍 データベース健全性チェック:');
    console.log('=' .repeat(60));
    
    let healthIssues = [];
    
    // イラストとダウンロードの整合性チェック
    const downloadKeys = allKeys.filter(key => key.startsWith('downloads:'));
    const illustrationIds = illustrationKeys.map(key => key.split(':')[1]);
    const downloadIds = downloadKeys.map(key => key.split(':')[1]);
    
    const missingDownloads = illustrationIds.filter(id => !downloadIds.includes(id));
    const orphanDownloads = downloadIds.filter(id => !illustrationIds.includes(id));
    
    if (missingDownloads.length > 0) {
      healthIssues.push(`ダウンロード記録なし: ${missingDownloads.length}件`);
    }
    
    if (orphanDownloads.length > 0) {
      healthIssues.push(`孤立ダウンロード記録: ${orphanDownloads.length}件`);
    }
    
    // next_idの整合性チェック
    const nextId = await redis.get('illustration:next_id');
    const maxId = Math.max(...illustrationIds.map(id => parseInt(id)));
    
    if (parseInt(nextId) <= maxId) {
      healthIssues.push(`next_id不整合: next_id=${nextId}, max_id=${maxId}`);
    }
    
    if (healthIssues.length === 0) {
      console.log('✅ データベースは健全です');
    } else {
      console.log('⚠️  以下の問題が検出されました:');
      healthIssues.forEach(issue => console.log(`  - ${issue}`));
    }

    // 6. 接続情報
    console.log('\n🌐 接続情報:');
    console.log('=' .repeat(60));
    
    const url = process.env.UPSTASH_REDIS_REST_URL;
    if (url) {
      const urlObj = new URL(url);
      console.log(`🏠 ホスト: ${urlObj.hostname}`);
      console.log(`🔌 ポート: ${urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80')}`);
      console.log(`🔐 SSL: ${urlObj.protocol === 'https:' ? '有効' : '無効'}`);
      
      // リージョン推定
      const hostname = urlObj.hostname;
      if (hostname.includes('us-east')) {
        console.log('🌍 推定リージョン: US East');
      } else if (hostname.includes('us-west')) {
        console.log('🌍 推定リージョン: US West');
      } else if (hostname.includes('eu-')) {
        console.log('🌍 推定リージョン: Europe');
      } else if (hostname.includes('ap-')) {
        console.log('🌍 推定リージョン: Asia Pacific');
      } else {
        console.log('🌍 推定リージョン: 不明');
      }
    }

    console.log('\n✅ Upstash詳細情報確認完了！');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    console.error('スタックトレース:', error.stack);
  }
}

// メイン実行
if (require.main === module) {
  checkUpstashDetails().catch(console.error);
}




