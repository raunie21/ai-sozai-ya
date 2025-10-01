#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });

function checkLoginInfo() {
  console.log('🔍 Upstash ログイン情報の確認\n');
  
  // 1. 現在の環境変数から取得できる情報
  console.log('📋 現在の設定情報:');
  console.log('=' .repeat(50));
  
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (upstashUrl) {
    const urlObj = new URL(upstashUrl);
    console.log(`🌐 データベースURL: ${upstashUrl}`);
    console.log(`🏠 ホスト名: ${urlObj.hostname}`);
    
    // ホスト名からデータベース名を推測
    const hostParts = urlObj.hostname.split('.');
    if (hostParts.length > 0) {
      const dbName = hostParts[0];
      console.log(`📊 データベース名: ${dbName}`);
    }
  } else {
    console.log('❌ UPSTASH_REDIS_REST_URL が見つかりません');
  }
  
  if (upstashToken) {
    console.log(`🔑 トークン: ${upstashToken.substring(0, 10)}...（設定済み）`);
  } else {
    console.log('❌ UPSTASH_REDIS_REST_TOKEN が見つかりません');
  }
  
  // 2. ログイン情報復元の手順
  console.log('\n🔐 ログイン情報復元の手順:');
  console.log('=' .repeat(50));
  
  console.log('1️⃣  Upstashアカウントの確認:');
  console.log('   • https://console.upstash.com/ にアクセス');
  console.log('   • 登録時に使用したメールアドレスでログイン試行');
  console.log('   • 「Forgot Password」でパスワードリセット可能');
  
  console.log('\n2️⃣  アカウント特定のヒント:');
  if (upstashUrl) {
    const urlObj = new URL(upstashUrl);
    console.log(`   • データベース名: ${urlObj.hostname.split('.')[0]}`);
    console.log(`   • このデータベースが存在するアカウントを探してください`);
  }
  
  console.log('\n3️⃣  よく使用されるメールアドレス:');
  console.log('   • Gmail: your-email@gmail.com');
  console.log('   • 会社メール: your-email@company.com');
  console.log('   • その他のプロバイダー');
  
  console.log('\n4️⃣  ソーシャルログインの確認:');
  console.log('   • GitHub アカウントでログイン');
  console.log('   • Google アカウントでログイン');
  console.log('   • これらでUpstashに登録した可能性があります');
  
  // 3. 環境変数ファイルの場所
  console.log('\n📁 設定ファイルの場所:');
  console.log('=' .repeat(50));
  console.log('現在の設定は以下のファイルに保存されています:');
  console.log(`📄 ${process.cwd()}/.env.local`);
  console.log('\nこのファイルを確認することで、設定時期や他の情報が見つかる可能性があります。');
  
  // 4. 代替手段
  console.log('\n🔄 代替手段:');
  console.log('=' .repeat(50));
  console.log('1. 新しいUpstashアカウントを作成');
  console.log('2. 現在のデータをエクスポート');
  console.log('3. 新しいデータベースにインポート');
  console.log('4. 環境変数を更新');
  
  // 5. データバックアップの重要性
  console.log('\n💾 データ保護:');
  console.log('=' .repeat(50));
  console.log('現在のデータベースは正常に動作しているため、');
  console.log('ログイン情報が見つかるまで、以下を避けてください:');
  console.log('❌ .env.local ファイルの削除');
  console.log('❌ 環境変数の変更');
  console.log('❌ データベースの操作');
  
  console.log('\n✅ 推奨アクション:');
  console.log('1. まず https://console.upstash.com/ でログイン試行');
  console.log('2. パスワードリセットを試す');
  console.log('3. ソーシャルログインを試す');
  console.log('4. 必要に応じてサポートに連絡');
}

// メイン実行
checkLoginInfo();
