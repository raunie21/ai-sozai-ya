#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 新しい画像をillustrations.tsに追加するテンプレート
function generateImageTemplate(imageName, title, description, tags, category) {
  const id = Date.now(); // 現在のタイムスタンプをIDとして使用
  
  return `  {
    id: ${id},
    title: "${title}",
    description: "${description}",
    tags: [${tags.map(tag => `"${tag}"`).join(', ')}],
    category: "${category}",
    thumbnailUrl: "/images/thumbnails/${imageName}-thumb.png",
    imageUrl: "/images/illustrations/${imageName}.png",
    originalUrl: "/images/originals/${imageName}.png",
    downloads: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },`;
}

// メイン処理
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 5) {
    console.log('📝 Usage: node scripts/add-image-template.js <imageName> <title> <description> <tags> <category>');
    console.log('');
    console.log('Example:');
    console.log('node scripts/add-image-template.js "new-character" "新しいキャラクター" "説明文" "人物,男性,笑顔" "人物"');
    console.log('');
    console.log('Available categories: 人物, 動物, ビジネス, 食べ物, 自然, アイコン');
    process.exit(1);
  }

  const [imageName, title, description, tagsString, category] = args;
  const tags = tagsString.split(',').map(tag => tag.trim());
  
  const template = generateImageTemplate(imageName, title, description, tags, category);
  
  console.log('📝 Add this to your illustrations.ts file:');
  console.log('');
  console.log(template);
  console.log('');
  console.log('📋 Steps to add new image:');
  console.log('1. Place your image in: public/images/illustrations/');
  console.log('2. Run: node scripts/add-new-images.js public/images/illustrations/your-image.png');
  console.log('3. Add the template above to app/data/illustrations.ts');
  console.log('4. Test locally: npm run dev');
  console.log('5. Deploy: npx vercel --prod');
}

if (require.main === module) {
  main();
}

module.exports = { generateImageTemplate };

