#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const redis = Redis.fromEnv();

async function backupCurrentData() {
  try {
    console.log('💾 現在のUpstashデータをバックアップ中...\n');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(process.cwd(), 'backups');
    const backupFile = path.join(backupDir, `upstash-backup-${timestamp}.json`);
    
    // バックアップディレクトリを作成
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      console.log('📁 バックアップディレクトリを作成しました');
    }
    
    // 全データを取得
    console.log('📊 データを取得中...');
    const allKeys = await redis.keys('*');
    console.log(`🔑 ${allKeys.length}個のキーを発見`);
    
    const backupData = {
      timestamp: new Date().toISOString(),
      database_info: {
        url: process.env.UPSTASH_REDIS_REST_URL,
        total_keys: allKeys.length
      },
      data: {}
    };
    
    // 各キーのデータを取得
    let processedCount = 0;
    for (const key of allKeys) {
      try {
        const value = await redis.get(key);
        backupData.data[key] = value;
        processedCount++;
        
        if (processedCount % 10 === 0) {
          console.log(`📈 進行状況: ${processedCount}/${allKeys.length}`);
        }
      } catch (error) {
        console.warn(`⚠️  キー "${key}" の取得に失敗: ${error.message}`);
        backupData.data[key] = { error: error.message };
      }
    }
    
    // バックアップファイルに保存
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    console.log('\n✅ バックアップ完了！');
    console.log('=' .repeat(50));
    console.log(`📄 ファイル: ${backupFile}`);
    console.log(`📊 データ数: ${processedCount}件`);
    console.log(`💾 ファイルサイズ: ${Math.round(fs.statSync(backupFile).size / 1024)}KB`);
    
    // バックアップの検証
    console.log('\n🔍 バックアップ検証:');
    const savedData = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    const savedKeys = Object.keys(savedData.data);
    
    console.log(`✅ 保存されたキー数: ${savedKeys.length}`);
    console.log(`✅ 元のキー数: ${allKeys.length}`);
    
    if (savedKeys.length === allKeys.length) {
      console.log('✅ バックアップは完全です');
    } else {
      console.log('⚠️  一部のデータが不完全な可能性があります');
    }
    
    // 復元用の情報
    console.log('\n📋 復元用情報:');
    console.log('=' .repeat(50));
    console.log('このバックアップファイルには以下が含まれています:');
    console.log('• 全イラストデータ');
    console.log('• 全ダウンロード記録');
    console.log('• データベース設定情報');
    console.log('• タイムスタンプ');
    
    console.log('\n🔄 復元方法:');
    console.log('1. 新しいUpstashデータベースを作成');
    console.log('2. 環境変数を新しいデータベースに更新');
    console.log('3. このバックアップファイルを使用して復元スクリプトを実行');
    
    return backupFile;
    
  } catch (error) {
    console.error('❌ バックアップ中にエラーが発生しました:', error);
    throw error;
  }
}

// 復元スクリプトのテンプレートも作成
function createRestoreScript(backupFile) {
  const restoreScript = `#!/usr/bin/env node

const { Redis } = require('@upstash/redis');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function restoreData() {
  try {
    console.log('🔄 データを復元中...');
    
    const redis = Redis.fromEnv();
    const backupData = JSON.parse(fs.readFileSync('${path.basename(backupFile)}', 'utf8'));
    
    console.log(\`📊 復元対象: \${Object.keys(backupData.data).length}件\`);
    
    let restoredCount = 0;
    for (const [key, value] of Object.entries(backupData.data)) {
      if (value.error) {
        console.warn(\`⚠️  スキップ: \${key} (エラーあり)\`);
        continue;
      }
      
      await redis.set(key, value);
      restoredCount++;
      
      if (restoredCount % 10 === 0) {
        console.log(\`📈 復元進行状況: \${restoredCount}/\${Object.keys(backupData.data).length}\`);
      }
    }
    
    console.log(\`✅ 復元完了: \${restoredCount}件\`);
    
  } catch (error) {
    console.error('❌ 復元中にエラー:', error);
  }
}

restoreData();
`;

  const restoreFile = path.join(path.dirname(backupFile), 'restore-data.js');
  fs.writeFileSync(restoreFile, restoreScript);
  console.log(`📝 復元スクリプトを作成: ${restoreFile}`);
}

// メイン実行
if (require.main === module) {
  backupCurrentData()
    .then(backupFile => {
      createRestoreScript(backupFile);
      console.log('\n🎉 バックアップとスクリプト作成が完了しました！');
    })
    .catch(console.error);
}




