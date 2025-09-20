 # 新画像追加ワークフロー

## 概要
このドキュメントでは、AIそざいやサイトに新しい画像を追加する手順を説明します。

## 前提条件
- Node.js がインストールされている
- Cloudflare R2 の認証情報が設定されている（`.env.local`）
- 画像ファイルが準備されている

## 手順

### 1. 画像ファイルの準備
新しい画像ファイルを `public/images/illustrations/` に配置します。

```bash
# 例: 新しい画像を配置
cp your-new-image.png public/images/illustrations/
```

### 2. 画像の自動処理とR2アップロード
以下のコマンドを実行して、画像を自動的にリサイズし、R2にアップロードします。

```bash
# 新しい画像を追加
node scripts/add-new-images.js public/images/illustrations/your-new-image.png
```

このコマンドは以下を自動実行します：
- 画像のリサイズ（サムネイル、WebP変換）
- R2へのアップロード
- `imageUrl.ts` の更新

### 3. 画像データの追加
`app/data/illustrations.ts` に新しい画像のデータを追加します。

#### テンプレート生成
```bash
# テンプレートを生成
node scripts/add-image-template.js "image-name" "画像タイトル" "説明文" "タグ1,タグ2,タグ3" "カテゴリ"
```

#### 手動追加
```typescript
{
  id: 1234567890, // 現在のタイムスタンプ
  title: "画像タイトル",
  description: "説明文",
  tags: ["タグ1", "タグ2", "タグ3"],
  category: "カテゴリ",
  thumbnailUrl: "/images/thumbnails/image-name-thumb.png",
  imageUrl: "/images/illustrations/image-name.png",
  originalUrl: "/images/originals/image-name.png",
  downloads: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
},
```

### 4. ローカルテスト
```bash
# ローカルサーバーを起動
npm run dev

# ブラウザで http://localhost:3000 を確認
```

### 5. Vercelにデプロイ
```bash
# 本番環境にデプロイ
npx vercel --prod
```

## 利用可能なカテゴリ
- `人物` - 人物のイラスト
- `動物` - 動物のイラスト
- `ビジネス` - ビジネス関連のイラスト
- `食べ物` - 食べ物のイラスト
- `自然` - 自然のイラスト
- `アイコン` - アイコン素材

## 画像の要件
- **形式**: PNG形式
- **サイズ**: 推奨 512x512px 以上
- **ファイル名**: 英数字とハイフンのみ使用
- **例**: `new-character.png`

## 自動生成されるファイル
スクリプト実行により、以下のファイルが自動生成されます：

### メイン画像
- `public/images/illustrations/image-name.png` (元画像)
- `public/images/illustrations/image-name.webp` (WebP版)

### サムネイル画像
- `public/images/thumbnails/image-name-thumb.png` (PNG版)
- `public/images/thumbnails/image-name-thumb.webp` (WebP版)

### オリジナル画像
- `public/images/originals/image-name.png` (元画像のコピー)

## トラブルシューティング

### よくある問題

#### 1. 環境変数エラー
```
💥 Missing required environment variables
```
**解決方法**: `.env.local` ファイルにCloudflare R2の認証情報を設定

#### 2. 画像アップロードエラー
```
❌ Failed to upload
```
**解決方法**: 
- インターネット接続を確認
- R2の認証情報を確認
- バケット名を確認

#### 3. 画像が表示されない
**解決方法**:
- ブラウザのキャッシュをクリア
- 画像URLを直接確認
- R2のバケット設定を確認

### ログの確認
```bash
# 詳細なログを表示
DEBUG=* node scripts/add-new-images.js your-image.png
```

## パフォーマンス最適化

### 画像最適化
- 自動的にWebP形式で配信
- 適切なキャッシュヘッダーを設定
- CDN経由で高速配信

### キャッシュ設定
- ブラウザキャッシュ: 1年
- CDNキャッシュ: 1年
- 不変ファイルとして設定

## セキュリティ

### アクセス制御
- R2バケットは公開設定
- CORS設定で適切なアクセス制御
- 不正なアクセスをブロック

### データ保護
- 画像ファイルは暗号化して保存
- 定期的なバックアップ
- アクセスログの監視

## コスト管理

### データ転送量の監視
- Cloudflareダッシュボードで確認
- 月間の使用量を監視
- 不要なリクエストを削減

### 最適化のヒント
- 画像サイズを適切に設定
- WebP形式を優先使用
- キャッシュを最大限活用

## サポート

### 問題が発生した場合
1. このドキュメントを確認
2. ログファイルを確認
3. 必要に応じてサポートに連絡

### 更新履歴
- 2025-01-05: 初版作成
- 自動化スクリプトの実装
- R2 + CDN の統合

