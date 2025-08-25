# 🖼️ イラスト管理ガイド

## 📁 Phase 1: ローカル保存（即座開始）

### ディレクトリ構造
```
public/images/
├── illustrations/          # 表示用画像（800x800px）
│   ├── business-man.png
│   ├── cute-cat.png
│   ├── coffee-cup.png
│   ├── sakura-tree.png
│   ├── heart-icon.png
│   └── ...
├── thumbnails/            # サムネイル（300x300px）
│   ├── business-man-thumb.png
│   ├── cute-cat-thumb.png
│   └── ...
└── originals/             # ダウンロード用高解像度
    ├── business-man-hd.png
    ├── cute-cat-hd.png
    └── ...
```

### 画像仕様

#### サムネイル (thumbnails/)
- **サイズ**: 300x300px
- **フォーマット**: WebP（推奨）、PNG
- **ファイルサイズ**: 50KB以下
- **用途**: ギャラリー表示

#### 表示用画像 (illustrations/)
- **サイズ**: 800x800px
- **フォーマット**: WebP（推奨）、PNG
- **ファイルサイズ**: 200KB以下
- **用途**: カード詳細表示

#### 高解像度画像 (originals/)
- **サイズ**: 1920x1080px以上
- **フォーマット**: PNG（推奨）
- **ファイルサイズ**: 5MB以下
- **用途**: ダウンロード提供

### 命名規則
```bash
# 英数字、ハイフンのみ使用
business-man.png          # ✅ 良い
business_man.png          # ✅ 良い
ビジネスマン.png           # ❌ 日本語NG
business man.png          # ❌ スペースNG
```

### 画像最適化ツール
```bash
# ImageOptim（Mac）
brew install --cask imageoptim

# Squoosh（Web）
https://squoosh.app/

# Command line
npm install -g imagemin-cli
imagemin *.png --out-dir=optimized
```

## 🌐 Phase 2: Cloudflare R2（本格運用）

### セットアップ手順

1. **Cloudflare アカウント作成**
   - https://cloudflare.com でアカウント作成
   - R2 オブジェクトストレージを有効化

2. **バケット作成**
   ```bash
   バケット名: ai-sozai-ya-images
   リージョン: Auto（推奨）
   ```

3. **カスタムドメイン設定**
   ```bash
   # 例: images.ai-sozai-ya.com
   CNAME images.ai-sozai-ya.com → xxxxxxx.r2.cloudflarestorage.com
   ```

4. **環境変数設定**
   ```bash
   # .env.local
   CLOUDFLARE_R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
   CLOUDFLARE_R2_BUCKET=ai-sozai-ya-images
   CLOUDFLARE_R2_ACCESS_KEY=your-access-key
   CLOUDFLARE_R2_SECRET_KEY=your-secret-key
   CLOUDFLARE_R2_PUBLIC_URL=https://images.ai-sozai-ya.com
   ```

### R2 フォルダ構造
```
ai-sozai-ya-images/
├── illustrations/
│   ├── thumbnails/        # 300x300 WebP
│   ├── medium/           # 800x800 WebP
│   └── original/         # オリジナル PNG
├── categories/           # カテゴリ画像
└── ui/                  # UI用画像
```

### アップロードスクリプト例
```typescript
// scripts/upload-to-r2.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

const client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
  },
});

async function uploadFile(filePath: string, key: string) {
  const fileContent = fs.readFileSync(filePath);
  
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET!,
    Key: key,
    Body: fileContent,
    ContentType: getContentType(filePath),
  });

  await client.send(command);
  console.log(`Uploaded: ${key}`);
}

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.png': return 'image/png';
    case '.jpg': case '.jpeg': return 'image/jpeg';
    case '.webp': return 'image/webp';
    default: return 'application/octet-stream';
  }
}
```

## 📊 コスト比較

### Phase 1: ローカル保存
| 項目 | コスト | 制限 |
|------|--------|------|
| ストレージ | 0円 | Vercel 100MB制限 |
| 転送量 | 0円 | Vercel 100GB/月 |
| CDN | 0円 | Vercel Edge Network |

### Phase 2: Cloudflare R2
| 項目 | 無料枠 | 超過料金 |
|------|--------|----------|
| ストレージ | 10GB/月 | $0.015/GB |
| 転送量 | 無制限 | 0円 |
| リクエスト | 100万回/月 | $0.36/100万回 |

## 🚀 推奨の移行スケジュール

### Week 1: Phase 1 開始
- [ ] 5-10個の高品質イラスト準備
- [ ] ローカル保存でデプロイ
- [ ] 動作確認・フィードバック収集

### Week 2-3: コンテンツ拡充
- [ ] 20個まで拡張
- [ ] カテゴリバランス調整
- [ ] ユーザーフィードバック反映

### Week 4: Phase 2 移行
- [ ] Cloudflare R2 設定
- [ ] 画像移行スクリプト実行
- [ ] CDN最適化

## 🛠️ ツール・リソース

### 無料イラスト素材
- Unsplash（商用利用OK）
- Pixabay（商用利用OK）
- Pexels（商用利用OK）
- OpenAI DALL-E（生成AI）

### 画像編集・最適化
- GIMP（無料）
- Canva（無料プラン）
- Figma（無料プラン）
- Squoosh（Web）

### AI画像生成
- DALL-E 3
- Midjourney
- Stable Diffusion
- Leonardo.ai

## 📝 チェックリスト

### 画像準備
- [ ] 適切なサイズにリサイズ
- [ ] ファイルサイズ最適化
- [ ] 命名規則に従ったファイル名
- [ ] 3つのバリエーション作成（thumb/medium/original）

### データ更新
- [ ] illustrations.ts の更新
- [ ] パス設定確認
- [ ] フォールバック動作確認

### テスト
- [ ] ローカル環境での表示確認
- [ ] 画像読み込みエラーハンドリング
- [ ] レスポンシブ表示確認
- [ ] ダウンロード機能テスト
