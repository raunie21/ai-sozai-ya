const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 設定
const config = {
  inputDir: 'public/images/originals',
  outputDirs: {
    thumbnails: 'public/images/thumbnails',
    illustrations: 'public/images/illustrations'
  },
  sizes: {
    thumbnails: { width: 300, height: 300, suffix: '-thumb' },
    illustrations: { width: 800, height: 800, suffix: '' }
  },
  formats: ['webp', 'png'], // WebP優先、PNG フォールバック
  quality: {
    webp: 85,
    png: 90
  }
};

// ディレクトリ作成
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
}

// 画像リサイズ処理
async function resizeImage(inputPath, outputPath, width, height, format, quality) {
  try {
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .toFormat(format, { quality })
      .toFile(outputPath);
    
    console.log(`✅ Generated: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error processing ${inputPath}:`, error.message);
  }
}

// メイン処理
async function processImages() {
  console.log('🖼️  Starting image processing...\n');

  // 出力ディレクトリ作成
  Object.values(config.outputDirs).forEach(ensureDirectoryExists);

  // 入力ディレクトリの画像ファイルを取得
  const inputFiles = fs.readdirSync(config.inputDir)
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

  if (inputFiles.length === 0) {
    console.log(`No image files found in ${config.inputDir}`);
    return;
  }

  console.log(`Found ${inputFiles.length} image(s) to process:\n`);

  // 各画像を処理
  for (const file of inputFiles) {
    const inputPath = path.join(config.inputDir, file);
    const baseName = path.parse(file).name;
    
    console.log(`📸 Processing: ${file}`);

    // 各サイズ・フォーマットで生成
    for (const [sizeName, sizeConfig] of Object.entries(config.sizes)) {
      const outputDir = config.outputDirs[sizeName];
      
      // outputDirが存在することを確認
      if (!outputDir) {
        console.error(`❌ Output directory not found for size: ${sizeName}`);
        continue;
      }
      
      for (const format of config.formats) {
        const outputFileName = `${baseName}${sizeConfig.suffix}.${format}`;
        const outputPath = path.join(outputDir, outputFileName);
        
        await resizeImage(
          inputPath,
          outputPath,
          sizeConfig.width,
          sizeConfig.height,
          format,
          config.quality[format]
        );
      }
    }
    
    console.log(''); // 空行
  }

  console.log('🎉 Image processing completed!');
  
  // 生成されたファイル数を表示
  const thumbnailCount = fs.readdirSync(config.outputDirs.thumbnails).length;
  const illustrationCount = fs.readdirSync(config.outputDirs.illustrations).length;
  
  console.log(`\n📊 Generated files:`);
  console.log(`   Thumbnails: ${thumbnailCount}`);
  console.log(`   Illustrations: ${illustrationCount}`);
}

// 使用方法の表示
function showUsage() {
  console.log(`
🖼️  Automatic Image Resizer for AI Sozai-ya

Usage:
  node scripts/resize-images.js

Configuration:
  Input:  ${config.inputDir}
  Output: ${Object.values(config.outputDirs).join(', ')}
  
Sizes:
  - Thumbnails: ${config.sizes.thumbnail.width}x${config.sizes.thumbnail.height}px
  - Illustrations: ${config.sizes.illustration.width}x${config.sizes.illustration.height}px
  
Formats: ${config.formats.join(', ')}

Instructions:
  1. Place your high-resolution images in: ${config.inputDir}
  2. Run this script
  3. Optimized images will be generated automatically
  `);
}

// スクリプト実行
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
  } else {
    processImages().catch(console.error);
  }
}

module.exports = { processImages, config };
