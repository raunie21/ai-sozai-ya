#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// カラー設定ファイルのパス
const colorsConfigPath = path.join(process.cwd(), 'app/config/colors.ts');
const globalsCssPath = path.join(process.cwd(), 'app/globals.css');

console.log('🎨 カラー設定の更新を開始します...');

try {
  // カラー設定ファイルを読み込み
  const colorsConfigContent = fs.readFileSync(colorsConfigPath, 'utf-8');
  
  // カラー値を抽出する関数
  function extractColorValue(line) {
    const match = line.match(/'#([0-9a-fA-F]{6})'/);
    return match ? `#${match[1]}` : null;
  }
  
  function extractRgbaValue(line) {
    const match = line.match(/rgba\(([^)]+)\)/);
    return match ? `rgba(${match[1]})` : null;
  }
  
  // カラー値を抽出
  const colors = {};
  const lines = colorsConfigContent.split('\n');
  
  lines.forEach(line => {
    if (line.includes('main:')) {
      const color = extractColorValue(line);
      if (color) colors.primaryMain = color;
    }
    if (line.includes('light:')) {
      const color = extractColorValue(line);
      if (color) colors.primaryLight = color;
    }
    if (line.includes('dark:')) {
      const color = extractColorValue(line);
      if (color) colors.primaryDark = color;
    }
    if (line.includes('muted:')) {
      const color = extractColorValue(line);
      if (color) colors.primaryMuted = color;
    }
    if (line.includes('green:')) {
      const color = extractColorValue(line);
      if (color) colors.accentGreen = color;
    }
    if (line.includes('red:')) {
      const color = extractColorValue(line);
      if (color) colors.accentRed = color;
    }
    if (line.includes('yellow:')) {
      const color = extractColorValue(line);
      if (color) colors.accentYellow = color;
    }
    if (line.includes('from:')) {
      const color = extractColorValue(line);
      if (color) colors.textFrom = color;
    }
    if (line.includes('via:')) {
      const color = extractColorValue(line);
      if (color) colors.textVia = color;
    }
    if (line.includes('to:')) {
      const color = extractColorValue(line);
      if (color) colors.textTo = color;
    }
    if (line.includes('button:') && line.includes('from:')) {
      const color = extractColorValue(line);
      if (color) colors.buttonFrom = color;
    }
    if (line.includes('button:') && line.includes('to:')) {
      const color = extractColorValue(line);
      if (color) colors.buttonTo = color;
    }
    if (line.includes('shimmer:')) {
      const color = extractRgbaValue(line);
      if (color) colors.shimmer = color;
    }
  });
  
  // デフォルト値を設定
  const defaultColors = {
    primaryMain: colors.primaryMain || '#7eb5d0',
    primaryLight: colors.primaryLight || '#a8d5e6',
    primaryDark: colors.primaryDark || '#5a9bb8',
    primaryMuted: colors.primaryMuted || '#d1e7f0',
    accentGreen: colors.accentGreen || '#10b981',
    accentRed: colors.accentRed || '#ef4444',
    accentYellow: colors.accentYellow || '#f59e0b',
    textFrom: colors.textFrom || '#5a9bb8',
    textVia: colors.textVia || '#7eb5d0',
    textTo: colors.textTo || '#a8d5e6',
    buttonFrom: colors.buttonFrom || '#5a9bb8',
    buttonTo: colors.buttonTo || '#7eb5d0',
    shimmer: colors.shimmer || 'rgba(123, 184, 209, 0.1)'
  };
  
  // globals.cssを読み込み
  let globalsCssContent = fs.readFileSync(globalsCssPath, 'utf-8');
  
  // CSS変数を更新
  globalsCssContent = globalsCssContent.replace(
    /--primary-main: #[0-9a-fA-F]{6};/,
    `--primary-main: ${defaultColors.primaryMain};`
  );
  globalsCssContent = globalsCssContent.replace(
    /--primary-light: #[0-9a-fA-F]{6};/,
    `--primary-light: ${defaultColors.primaryLight};`
  );
  globalsCssContent = globalsCssContent.replace(
    /--primary-dark: #[0-9a-fA-F]{6};/,
    `--primary-dark: ${defaultColors.primaryDark};`
  );
  globalsCssContent = globalsCssContent.replace(
    /--primary-muted: #[0-9a-fA-F]{6};/,
    `--primary-muted: ${defaultColors.primaryMuted};`
  );
  globalsCssContent = globalsCssContent.replace(
    /--accent-green: #[0-9a-fA-F]{6};/,
    `--accent-green: ${defaultColors.accentGreen};`
  );
  globalsCssContent = globalsCssContent.replace(
    /--accent-red: #[0-9a-fA-F]{6};/,
    `--accent-red: ${defaultColors.accentRed};`
  );
  globalsCssContent = globalsCssContent.replace(
    /--accent-yellow: #[0-9a-fA-F]{6};/,
    `--accent-yellow: ${defaultColors.accentYellow};`
  );
  globalsCssContent = globalsCssContent.replace(
    /--text-from: #[0-9a-fA-F]{6};/,
    `--text-from: ${defaultColors.textFrom};`
  );
  globalsCssContent = globalsCssContent.replace(
    /--text-via: #[0-9a-fA-F]{6};/,
    `--text-via: ${defaultColors.textVia};`
  );
  globalsCssContent = globalsCssContent.replace(
    /--text-to: #[0-9a-fA-F]{6};/,
    `--text-to: ${defaultColors.textTo};`
  );
  globalsCssContent = globalsCssContent.replace(
    /--button-from: #[0-9a-fA-F]{6};/,
    `--button-from: ${defaultColors.buttonFrom};`
  );
  globalsCssContent = globalsCssContent.replace(
    /--button-to: #[0-9a-fA-F]{6};/,
    `--button-to: ${defaultColors.buttonTo};`
  );
  globalsCssContent = globalsCssContent.replace(
    /--shimmer: rgba\([^)]+\);/,
    `--shimmer: ${defaultColors.shimmer};`
  );
  
  // 更新されたCSSを保存
  fs.writeFileSync(globalsCssPath, globalsCssContent, 'utf-8');
  
  console.log('✅ カラー設定が正常に更新されました！');
  console.log('🎨 更新されたカラー:');
  console.log(`   メイン: ${defaultColors.primaryMain}`);
  console.log(`   アクセント緑: ${defaultColors.accentGreen}`);
  console.log(`   アクセント赤: ${defaultColors.accentRed}`);
  console.log(`   アクセント黄: ${defaultColors.accentYellow}`);
  console.log('\n💡 変更を確認するには、ブラウザでページを更新してください。');
  
} catch (error) {
  console.error('❌ エラーが発生しました:', error.message);
  process.exit(1);
}
