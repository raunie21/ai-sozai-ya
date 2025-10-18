require('dotenv').config({ path: '.env.local' });
const { Redis } = require('@upstash/redis');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// 新しく追加された画像の情報（ファイル名から推測）
const newImages = [
  // 例: 新しい画像があれば、ここに追加
  // ユーザーから具体的な画像名を教えてもらう必要があります
];

// ファイル名から日本語タイトルとタグを生成する関数
function generateTitleAndTags(filename) {
  const name = filename.replace('.png', '').toLowerCase();
  
  // ファイル名のパターンマッチング
  const patterns = {
    // 人物系
    'woman': { title: '女性', category: 'people', tags: ['女性', '人物', 'レディ', '大人'] },
    'man': { title: '男性', category: 'people', tags: ['男性', '人物', 'メンズ', '大人'] },
    'girl': { title: '女の子', category: 'people', tags: ['女の子', '少女', '子供', '人物'] },
    'boy': { title: '男の子', category: 'people', tags: ['男の子', '少年', '子供', '人物'] },
    'child': { title: '子供', category: 'kids', tags: ['子供', 'キッズ', '人物', 'チャイルド'] },
    'baby': { title: '赤ちゃん', category: 'kids', tags: ['赤ちゃん', 'ベビー', '乳児', '人物'] },
    'grandma': { title: 'おばあちゃん', category: 'people', tags: ['おばあちゃん', 'おばあさん', 'おばさん', '人物'] },
    'grandpa': { title: 'おじいちゃん', category: 'people', tags: ['おじいちゃん', 'おじいさん', 'おじさん', '人物'] },
    
    // 動物系
    'cat': { title: '猫', category: 'animals', tags: ['猫', 'ネコ', 'にゃんこ', '動物', 'ペット'] },
    'dog': { title: '犬', category: 'animals', tags: ['犬', 'いぬ', 'わんこ', '動物', 'ペット'] },
    'bird': { title: '鳥', category: 'animals', tags: ['鳥', 'とり', '動物', '飛ぶ'] },
    'fish': { title: '魚', category: 'animals', tags: ['魚', 'さかな', '動物', '海'] },
    
    // 感情・表情
    'smile': { tags: ['笑顔', 'スマイル', 'かわいい', 'にっこり'] },
    'happy': { tags: ['幸せ', '嬉しい', '楽しい', 'ハッピー'] },
    'sad': { tags: ['悲しい', '泣く', '切ない', 'つらい'] },
    'angry': { tags: ['怒る', '怒り', 'むかつく', 'イライラ'] },
    'surprised': { tags: ['驚き', '驚く', 'びっくり'] },
    'scared': { tags: ['怖がる', '怖い', '恐怖', '怯える'] },
    'crying': { tags: ['泣く', '涙', '悲しい', 'つらい'] },
    'laughing': { tags: ['笑う', '笑顔', '楽しい', 'ハッピー'] },
    
    // 動作
    'standing': { tags: ['立つ'] },
    'sitting': { tags: ['座る'] },
    'walking': { tags: ['歩く'] },
    'running': { tags: ['走る'] },
    'jumping': { tags: ['跳ぶ', 'ジャンプ'] },
    
    // 食べ物
    'apple': { title: 'りんご', category: 'food', tags: ['りんご', 'アップル', '果物', '食べ物'] },
    'banana': { title: 'バナナ', category: 'food', tags: ['バナナ', '果物', '食べ物'] },
    'cake': { title: 'ケーキ', category: 'food', tags: ['ケーキ', 'スイーツ', 'デザート', '食べ物'] },
    
    // 自然
    'tree': { title: '木', category: 'nature', tags: ['木', '植物', '自然', 'ツリー'] },
    'flower': { title: '花', category: 'nature', tags: ['花', '植物', '自然', 'フラワー'] },
    'mountain': { title: '山', category: 'nature', tags: ['山', '自然', '風景'] },
    'sea': { title: '海', category: 'nature', tags: ['海', '自然', '風景', 'ブルー'] },
  };
  
  let result = {
    title: filename.replace('.png', ''),
    category: 'people', // デフォルト
    tags: ['AI素材', 'イラスト']
  };
  
  // パターンマッチングでタイトルとタグを決定
  for (const [pattern, info] of Object.entries(patterns)) {
    if (name.includes(pattern)) {
      if (info.title) result.title = info.title;
      if (info.category) result.category = info.category;
      if (info.tags) result.tags = [...result.tags, ...info.tags];
    }
  }
  
  // 数字がある場合の処理
  const numberMatch = name.match(/(\d+)$/);
  if (numberMatch) {
    result.title += numberMatch[1];
  }
  
  // 重複タグを除去
  result.tags = [...new Set(result.tags)];
  
  return result;
}

async function addNewImages() {
  try {
    console.log('🔍 新しい画像をデータベースに追加中...\n');
    
    if (newImages.length === 0) {
      console.log('❌ 新しい画像が指定されていません。');
      console.log('💡 newImages配列に追加したい画像のファイル名を追加してください。');
      return;
    }
    
    // 次のIDを取得
    let nextId = await redis.incr('illustration:next_id');
    
    console.log(`📊 追加する画像数: ${newImages.length}件`);
    console.log(`🔢 開始ID: ${nextId}\n`);
    
    for (let i = 0; i < newImages.length; i++) {
      const filename = newImages[i];
      const currentId = nextId + i;
      
      // ファイル名から情報を生成
      const info = generateTitleAndTags(filename);
      
      const illustration = {
        id: currentId,
        title: info.title,
        category: info.category,
        tags: info.tags,
        imageUrl: `https://img.ai-sozaiya.com/cdn-cgi/image/width=600,height=600,fit=cover,gravity=center/images/originals/${filename}`,
        originalUrl: `https://img.ai-sozaiya.com/images/originals/${filename}`,
        downloads: 0,
        createdAt: new Date().toISOString()
      };
      
      // データベースに保存
      await redis.set(`illustration:${currentId}`, illustration);
      
      console.log(`✅ ID ${currentId}: ${info.title}`);
      console.log(`   カテゴリ: ${info.category}`);
      console.log(`   タグ: ${info.tags.join(', ')}`);
      console.log('');
    }
    
    // 次のIDを更新
    await redis.set('illustration:next_id', nextId + newImages.length);
    
    console.log(`🎉 ${newImages.length}件の画像を正常に追加しました！`);
    console.log(`🔢 次のID: ${nextId + newImages.length}`);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

// 実行前に新しい画像のリストを表示
console.log('📋 追加予定の画像:');
console.log('新しい画像のファイル名をnewImages配列に追加してください。');
console.log('例: ["new-image1.png", "new-image2.png"]');
console.log('');

if (newImages.length > 0) {
  addNewImages();
} else {
  console.log('❌ 新しい画像が指定されていません。スクリプトを編集してファイル名を追加してください。');
}
