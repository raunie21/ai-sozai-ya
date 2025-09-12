/**
 * 画像URL管理ユーティリティ
 * 段階的にCloudflare R2のURLに移行するためのヘルパー関数
 */

// 環境変数からR2のベースURLを取得
const R2_BASE_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL || 
  `https://${process.env.CLOUDFLARE_R2_BUCKET_NAME}.${process.env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

// 移行対象の画像ファイル（全画像をR2に移行）
const MIGRATED_IMAGES = new Set([
  // すべての画像をR2から読み込み
  'american-man-old-fat-good.png',
  'american-man-old-fat-good.webp',
  'american-man-old-fat-good-thumb.png',
  'american-man-old-fat-good-thumb.webp',
  'american-man-smile-happy-white.png',
  'american-man-smile-happy-white.webp',
  'american-man-smile-happy-white-thumb.png',
  'american-man-smile-happy-white-thumb.webp',
  'boy-friend.png',
  'boy-friend.webp',
  'boy-friend-thumb.png',
  'boy-friend-thumb.webp',
  'boy-smile-gray.png',
  'boy-smile-gray.webp',
  'boy-smile-gray-thumb.png',
  'boy-smile-gray-thumb.webp',
  'boy-smile-white.png',
  'boy-smile-white.webp',
  'boy-smile-white-thumb.png',
  'boy-smile-white-thumb.webp',
  'girl-smile-green.png',
  'girl-smile-green.webp',
  'girl-smile-green-thumb.png',
  'girl-smile-green-thumb.webp',
  'girl-smile-white.png',
  'girl-smile-white.webp',
  'girl-smile-white-thumb.png',
  'girl-smile-white-thumb.webp',
  'grandfather-glasses-smile.png',
  'grandfather-glasses-smile.webp',
  'grandfather-glasses-smile-thumb.png',
  'grandfather-glasses-smile-thumb.webp',
  'man-japanese-smile-white.png',
  'man-japanese-smile-white.webp',
  'man-japanese-smile-white-thumb.png',
  'man-japanese-smile-white-thumb.webp',
  'man-japanese-suit-smile.png',
  'man-japanese-suit-smile.webp',
  'man-japanese-suit-smile-thumb.png',
  'man-japanese-suit-smile-thumb.webp',
  'man-old-glasses-smile-good.png',
  'man-old-glasses-smile-good.webp',
  'man-old-glasses-smile-good-thumb.png',
  'man-old-glasses-smile-good-thumb.webp',
  'man-old-glasses-smile.png',
  'man-old-glasses-smile.webp',
  'man-old-glasses-smile-thumb.png',
  'man-old-glasses-smile-thumb.webp',
  'man-smile-bule.png',
  'man-smile-bule.webp',
  'man-smile-bule-thumb.png',
  'man-smile-bule-thumb.webp',
]);

/**
 * 画像URLを生成する（リサイズ対応版）
 * @param imagePath - 画像のパス（例: '/images/illustrations/boy-friend.png'）
 * @param options - リサイズオプション
 * @returns R2のURLまたはローカルURL
 */
export function getImageUrl(imagePath: string, options: {
  width?: number;
  height?: number;
  format?: 'auto' | 'webp' | 'png' | 'jpg' | 'avif';
  quality?: 'auto' | number;
} = {}): string {
  // パスからファイル名を抽出
  const fileName = imagePath.split('/').pop();
  
  if (!fileName) {
    return imagePath; // ファイル名が取得できない場合は元のパスを返す
  }

  // 移行済みの画像かチェック
  if (MIGRATED_IMAGES.has(fileName)) {
    const r2Path = imagePath.replace(/^\//, '');
    
    // リサイズが必要な場合
    if (options.width || options.height || options.format || options.quality) {
      // Cloudflareの /cdn-cgi/image プレフィックスを使うと、
      // ダッシュボード設定が見当たらない環境でも即時にリサイズが有効になる
      const directives: string[] = [];
      if (options.width) directives.push(`width=${options.width}`);
      if (options.height) directives.push(`height=${options.height}`);
      // 'auto' はディレクティブに含めない（Cloudflare側で自動判定させる）
      if (options.format && options.format !== 'auto') directives.push(`format=${options.format}`);
      if (options.quality && options.quality !== 'auto') directives.push(`quality=${options.quality}`);
      // デフォルトのリサイズ設定
      directives.push('fit=cover');
      directives.push('gravity=center');

      return `${R2_BASE_URL}/cdn-cgi/image/${directives.join(',')}/${r2Path}`;
    }
    
    // オリジナルサイズ
    return `${R2_BASE_URL}/${r2Path}`;
  }

  // まだ移行していない場合はローカルURLを返す
  return imagePath;
}

/**
 * 画像がR2に移行済みかチェック
 * @param imagePath - 画像のパス
 * @returns 移行済みかどうか
 */
export function isImageMigrated(imagePath: string): boolean {
  const fileName = imagePath.split('/').pop();
  return fileName ? MIGRATED_IMAGES.has(fileName) : false;
}

/**
 * 移行対象の画像を追加
 * @param fileName - ファイル名
 */
export function addMigratedImage(fileName: string): void {
  MIGRATED_IMAGES.add(fileName);
}

/**
 * 移行対象の画像リストを取得
 * @returns 移行済み画像のファイル名リスト
 */
export function getMigratedImages(): string[] {
  return Array.from(MIGRATED_IMAGES);
}

/**
 * 画像のフォールバックURLを生成
 * @param imagePath - 画像のパス
 * @returns フォールバック用のURL配列
 */
export function getImageFallbackUrls(imagePath: string): string[] {
  const r2Url = getImageUrl(imagePath);
  const localUrl = imagePath;
  
  // R2が移行済みの場合はR2を優先、そうでなければローカルを優先
  return isImageMigrated(imagePath) ? [r2Url, localUrl] : [localUrl, r2Url];
}
