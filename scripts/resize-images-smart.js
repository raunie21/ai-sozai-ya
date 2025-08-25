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
  formats: ['webp', 'png'],
  quality: {
    webp: 85,
    png: 90
  },
  cacheFile: '.resize-cache.json' // キャッシュファイル
};

// キャッシュ管理
function loadCache() {
  try {
    if (fs.existsSync(config.cacheFile)) {
      return JSON.parse(fs.readFileSync(config.cacheFile, 'utf8'));
    }
  } catch (error) {
    console.warn('⚠️  Cache file corrupted, starting fresh');
  }
  return {};
}

function saveCache(cache) {
  try {
    fs.writeFileSync(config.cacheFile, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.warn('⚠️  Failed to save cache:', error.message);
  }
}

// ファイルの最終更新時刻とサイズを取得
function getFileInfo(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return {
      mtime: stats.mtime.getTime(),
      size: stats.size
    };
  } catch {
    return null;
  }
}

// 出力ファイルがすべて存在するかチェック
function allOutputsExist(baseName) {
  for (const [sizeName, sizeConfig] of Object.entries(config.sizes)) {
    const outputDir = config.outputDirs[sizeName];
    for (const format of config.formats) {
      const outputFileName = `${baseName}${sizeConfig.suffix}.${format}`;
      const outputPath = path.join(outputDir, outputFileName);
      if (!fs.existsSync(outputPath)) {
        return false;
      }
    }
  }
  return true;
}

// ディレクトリ作成
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
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
    
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${inputPath}:`, error.message);
    return false;
  }
}

// スマートリサイズ処理
async function smartResize(options = {}) {
  const { force = false, verbose = true } = options;
  
  if (verbose) {
    console.log('🖼️  Starting smart image processing...\n');
  }

  // キャッシュ読み込み
  const cache = loadCache();
  let processedCount = 0;
  let skippedCount = 0;
  let newFilesCount = 0;

  // 出力ディレクトリ作成
  Object.values(config.outputDirs).forEach(ensureDirectoryExists);

  // 入力ディレクトリの画像ファイルを取得
  const inputFiles = fs.readdirSync(config.inputDir)
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));

  if (inputFiles.length === 0) {
    console.log(`No image files found in ${config.inputDir}`);
    return { processed: 0, skipped: 0, newFiles: 0 };
  }

  if (verbose) {
    console.log(`Found ${inputFiles.length} image(s) to analyze:\n`);
  }

  // 各画像を分析・処理
  for (const file of inputFiles) {
    const inputPath = path.join(config.inputDir, file);
    const baseName = path.parse(file).name;
    const currentFileInfo = getFileInfo(inputPath);
    
    if (!currentFileInfo) {
      console.warn(`⚠️  Could not read file info: ${file}`);
      continue;
    }

    // キャッシュチェック
    const cacheKey = file;
    const cachedInfo = cache[cacheKey];
    const isNewFile = !cachedInfo;
    const isModified = cachedInfo && 
      (cachedInfo.mtime !== currentFileInfo.mtime || 
       cachedInfo.size !== currentFileInfo.size);
    const outputsExist = allOutputsExist(baseName);

    // 処理が必要かどうか判定
    const needsProcessing = force || isNewFile || isModified || !outputsExist;

    if (!needsProcessing) {
      if (verbose) {
        console.log(`⏭️  Skipping: ${file} (up to date)`);
      }
      skippedCount++;
      continue;
    }

    // 処理理由を表示
    let reason = '';
    if (force) reason = 'forced';
    else if (isNewFile) reason = 'new file';
    else if (isModified) reason = 'modified';
    else if (!outputsExist) reason = 'missing outputs';

    if (verbose) {
      console.log(`📸 Processing: ${file} (${reason})`);
    }

    let allSuccess = true;

    // 各サイズ・フォーマットで生成
    for (const [sizeName, sizeConfig] of Object.entries(config.sizes)) {
      const outputDir = config.outputDirs[sizeName];
      
      if (!outputDir) {
        console.error(`❌ Output directory not found for size: ${sizeName}`);
        continue;
      }
      
      for (const format of config.formats) {
        const outputFileName = `${baseName}${sizeConfig.suffix}.${format}`;
        const outputPath = path.join(outputDir, outputFileName);
        
        const success = await resizeImage(
          inputPath,
          outputPath,
          sizeConfig.width,
          sizeConfig.height,
          format,
          config.quality[format]
        );

        if (success && verbose) {
          console.log(`  ✅ Generated: ${outputPath}`);
        }
        
        allSuccess = allSuccess && success;
      }
    }

    if (allSuccess) {
      // キャッシュ更新
      cache[cacheKey] = currentFileInfo;
      processedCount++;
      
      if (isNewFile) {
        newFilesCount++;
      }
    }
    
    if (verbose) {
      console.log(''); // 空行
    }
  }

  // キャッシュ保存
  saveCache(cache);

  // 結果表示
  if (verbose) {
    console.log('🎉 Smart image processing completed!\n');
    console.log(`📊 Results:`);
    console.log(`   New files: ${newFilesCount}`);
    console.log(`   Processed: ${processedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Total files: ${inputFiles.length}`);
    
    if (processedCount > 0) {
      const thumbnailCount = fs.readdirSync(config.outputDirs.thumbnails).length;
      const illustrationCount = fs.readdirSync(config.outputDirs.illustrations).length;
      console.log(`\n📁 Current totals:`);
      console.log(`   Thumbnails: ${thumbnailCount}`);
      console.log(`   Illustrations: ${illustrationCount}`);
    }
  }

  return {
    processed: processedCount,
    skipped: skippedCount,
    newFiles: newFilesCount,
    total: inputFiles.length
  };
}

// 使用方法の表示
function showUsage() {
  console.log(`
🖼️  Smart Image Resizer for AI Sozai-ya

Usage:
  node scripts/resize-images-smart.js [options]

Options:
  --force, -f    Force regenerate all images
  --quiet, -q    Quiet mode (minimal output)
  --help, -h     Show this help

Features:
  ✅ Only processes new or modified images
  ✅ Detects missing output files
  ✅ Caches file information for speed
  ✅ Supports force regeneration
  ✅ WebP + PNG dual format output

Configuration:
  Input:  ${config.inputDir}
  Output: ${Object.values(config.outputDirs).join(', ')}
  Cache:  ${config.cacheFile}
  
Sizes:
  - Thumbnails: ${config.sizes.thumbnails.width}x${config.sizes.thumbnails.height}px
  - Illustrations: ${config.sizes.illustrations.width}x${config.sizes.illustrations.height}px
  
Formats: ${config.formats.join(', ')}

Examples:
  # Process only new/modified images
  npm run resize-images:smart
  
  # Force regenerate all images
  npm run resize-images:smart -- --force
  
  # Quiet mode
  npm run resize-images:smart -- --quiet
  `);
}

// スクリプト実行
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
  } else {
    const options = {
      force: args.includes('--force') || args.includes('-f'),
      verbose: !(args.includes('--quiet') || args.includes('-q'))
    };
    
    smartResize(options).catch(console.error);
  }
}

module.exports = { smartResize, config };
