# Cloudflare画像リサイズ設定ガイド

## 概要
Cloudflareの画像リサイズ機能を活用して、動的な画像最適化を実装します。

## 利点

### 1. 動的リサイズ
- 必要なサイズに応じてリアルタイムでリサイズ
- 複数のサイズを事前に生成する必要がない
- ストレージ容量の大幅削減

### 2. 自動最適化
- WebP/AVIF形式への自動変換
- 画質の自動最適化
- ブラウザ対応に応じた最適な形式選択

### 3. パフォーマンス向上
- エッジサーバーでの処理
- キャッシュの効率化
- 帯域幅の削減

## 設定手順

### Step 1: Cloudflareダッシュボードでの設定

1. **Cloudflareダッシュボード**にアクセス
2. **Speed** → **Optimization** → **Image Optimization** に移動
3. **Image Resizing** を有効化

### Step 2: カスタムドメインの設定（推奨）

1. **R2** → **ai-sozai-images** → **Settings**
2. **Custom Domains** → **Connect Domain**
3. カスタムドメインを追加（例: `images.yourdomain.com`）

### Step 3: 画像リサイズのテスト

```bash
# サンプルURLの生成
node scripts/setup-cloudflare-images.js
```

## 使用方法

### 基本的な使用方法

```tsx
import { ResizableImage, ThumbnailImage, MediumImage } from '@/app/components/ResizableImage';

// 基本的なリサイズ
<ResizableImage 
  src="/images/originals/boy-friend.png"
  alt="仲良し兄弟"
  width={200}
  height={200}
/>

// プリセットサイズ
<ThumbnailImage 
  src="/images/originals/boy-friend.png"
  alt="仲良し兄弟"
/>

// フォーマット指定
<ResizableImage 
  src="/images/originals/boy-friend.png"
  alt="仲良し兄弟"
  width={400}
  height={400}
  format="webp"
  quality={90}
/>
```

### 既存コンポーネントの更新

```tsx
import OptimizedImage from '@/app/components/OptimizedImage';

// リサイズ対応版
<OptimizedImage 
  src="/images/originals/boy-friend.png"
  alt="仲良し兄弟"
  width={200}
  height={200}
  format="webp"
  quality="auto"
/>
```

## リサイズパラメータ

### 基本パラメータ
- `width`: 幅（ピクセル）
- `height`: 高さ（ピクセル）
- `format`: 形式（auto, webp, png, jpg, avif）
- `quality`: 画質（auto, 1-100）

### リサイズモード
- `fit`: リサイズ方法（cover, contain, fill, inside, outside）
- `gravity`: クロップ位置（center, top, bottom, left, right）

### 例
```
https://your-domain.com/images/originals/boy-friend.png?width=200&height=200&format=webp&quality=80&fit=cover&gravity=center
```

## パフォーマンス最適化

### 1. キャッシュ設定
```javascript
// 1年キャッシュ
Cache-Control: public, max-age=31536000, immutable
```

### 2. プリロード
```tsx
// 重要な画像をプリロード
<link 
  rel="preload" 
  as="image" 
  href={getImageUrl('/images/originals/boy-friend.png', { width: 200, height: 200 })} 
/>
```

### 3. レスポンシブ画像
```tsx
// デバイスに応じた画像サイズ
const getResponsiveImage = (src: string) => {
  return {
    mobile: getImageUrl(src, { width: 200, height: 200 }),
    tablet: getImageUrl(src, { width: 400, height: 400 }),
    desktop: getImageUrl(src, { width: 800, height: 800 }),
  };
};
```

## コスト最適化

### 1. 適切なサイズ設定
- 必要以上に大きなサイズを要求しない
- アスペクト比を考慮したサイズ設定

### 2. キャッシュの活用
- 同じサイズの画像はキャッシュを活用
- 不要なリクエストを避ける

### 3. フォーマットの選択
- WebP形式を優先使用
- 古いブラウザ対応は自動フォールバック

## トラブルシューティング

### よくある問題

#### 1. 画像が表示されない
**原因**: カスタムドメインが設定されていない
**解決方法**: カスタムドメインを設定するか、R2の直接URLを使用

#### 2. リサイズが効かない
**原因**: Cloudflare画像リサイズが有効化されていない
**解決方法**: Cloudflareダッシュボードで画像リサイズを有効化

#### 3. パフォーマンスが悪い
**原因**: キャッシュ設定が不適切
**解決方法**: 適切なキャッシュヘッダーを設定

## 監視とメトリクス

### 1. Cloudflare Analytics
- 画像リクエスト数
- キャッシュヒット率
- データ転送量

### 2. パフォーマンス監視
- 画像読み込み時間
- エラー率
- ユーザーエクスペリエンス

## セキュリティ

### 1. アクセス制御
- 適切なCORS設定
- 不正なリクエストのブロック

### 2. レート制限
- 過度なリクエストの制限
- DDoS攻撃の防止

## 今後の拡張

### 1. 動的画像生成
- ユーザーアップロード画像の自動リサイズ
- リアルタイム画像編集

### 2. 高度な最適化
- 機械学習による最適サイズ推定
- コンテンツに応じた画質調整

### 3. 分析機能
- 画像使用状況の分析
- パフォーマンス最適化の提案

