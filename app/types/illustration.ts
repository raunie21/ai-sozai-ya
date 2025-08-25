export interface Illustration {
  id: number;
  title: string;
  emoji: string; // 絵文字（フォールバック用）
  imageUrl?: string; // 実際の画像URL
  thumbnailUrl?: string; // サムネイル画像URL
  originalUrl?: string; // ダウンロード用高解像度画像URL
  category: string;
  tags: string[];
  downloads: number;
  fileSize?: string; // ファイルサイズ（例: "2.3MB"）
  dimensions?: string; // 画像サイズ（例: "1920x1080"）
}

export type Category = 'all' | 'ranking' | 'people' | 'animals' | 'business' | 'food' | 'nature' | 'icons';
