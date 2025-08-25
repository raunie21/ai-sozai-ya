const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// カラフルなサンプル画像を生成
async function createSampleImage(filename, width, height, color, text) {
  const outputPath = path.join('public/images/originals', filename);
  
  // SVGテキストを作成
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${adjustBrightness(color, -30)};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(width, height) / 10}" 
            text-anchor="middle" dominant-baseline="central" fill="white" font-weight="bold">
        ${text}
      </text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
    
  console.log(`✅ Created sample: ${filename}`);
}

// 色の明度を調整
function adjustBrightness(color, amount) {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// サンプル画像データ
const sampleImages = [
  { filename: 'business-man.png', color: '#4A90E2', text: 'Business' },
  { filename: 'cute-cat.png', color: '#F5A623', text: 'Cat' },
  { filename: 'coffee-cup.png', color: '#8B4513', text: 'Coffee' },
  { filename: 'sakura-tree.png', color: '#FFB6C1', text: 'Sakura' },
  { filename: 'heart-icon.png', color: '#E74C3C', text: '♥' },
  { filename: 'working-woman.png', color: '#9B59B6', text: 'Work' },
  { filename: 'dog-walk.png', color: '#2ECC71', text: 'Dog' },
  { filename: 'sushi.png', color: '#E67E22', text: 'Sushi' },
  { filename: 'mountain.png', color: '#34495E', text: 'Mountain' },
  { filename: 'star-icon.png', color: '#F1C40F', text: '★' }
];

// サンプル画像生成
async function generateSamples() {
  console.log('🎨 Generating sample images...\n');
  
  // originalsディレクトリを作成
  const originalsDir = 'public/images/originals';
  if (!fs.existsSync(originalsDir)) {
    fs.mkdirSync(originalsDir, { recursive: true });
  }

  // 各サンプル画像を生成
  for (const sample of sampleImages) {
    await createSampleImage(
      sample.filename,
      1920, // 幅
      1080, // 高さ
      sample.color,
      sample.text
    );
  }

  console.log(`\n🎉 Generated ${sampleImages.length} sample images!`);
  console.log(`Next step: Run "npm run resize-images" to create thumbnails and display images.`);
}

// スクリプト実行
if (require.main === module) {
  generateSamples().catch(console.error);
}

module.exports = { generateSamples, sampleImages };
