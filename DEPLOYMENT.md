# 🚀 AIそざいや デプロイメントガイド

## Phase 1: 開発環境での確認 ✅

### 現在の状態
- [x] Next.js 14 + TypeScript + Tailwind CSS
- [x] nodemon での開発サーバー起動
- [x] 基本機能（検索、フィルタ、ダウンロード）
- [x] レスポンシブデザイン

### 確認事項
1. **ローカルでの動作確認**
   ```bash
   npm run dev:nodemon
   # http://localhost:3000 でアクセス
   ```

2. **機能テスト**
   - [ ] 検索機能
   - [ ] カテゴリフィルタ
   - [ ] ダウンロード機能
   - [ ] レスポンシブ表示

---

## Phase 2: 本番環境の準備

### Step 1: ドメイン取得（月額 150円〜）

**推奨サービス:**
- お名前.com
- ムームードメイン
- Cloudflare Registrar（安い）

**例:**
- `ai-sozai-ya.com`
- `free-illustrations.jp`

### Step 2: ホスティング設定（無料）

#### Option A: Vercel（推奨）
1. [Vercel](https://vercel.com) にアカウント作成
2. GitHubリポジトリを作成してコードをpush
3. Vercelでリポジトリを接続
4. 自動デプロイが設定される

#### Option B: Netlify
1. [Netlify](https://netlify.com) にアカウント作成
2. GitHubリポジトリを接続
3. ビルド設定:
   - Build command: `npm run build`
   - Publish directory: `.next`

### Step 3: 画像ストレージ設定（ほぼ無料）

#### Cloudflare R2 設定
1. [Cloudflare](https://cloudflare.com) でアカウント作成
2. R2 オブジェクトストレージを有効化
3. バケット作成: `ai-sozai-ya-images`
4. API キーを取得
5. カスタムドメインを設定

```bash
# フォルダ構造
your-bucket/
├── illustrations/
│   ├── thumbnails/     # 300x300 WebP
│   ├── medium/         # 800x800 WebP
│   └── original/       # オリジナル PNG
```

---

## Phase 3: データベース設定（将来の拡張用）

### Supabase設定（無料）
1. [Supabase](https://supabase.com) でプロジェクト作成
2. データベーステーブル設計:

```sql
-- イラストテーブル
CREATE TABLE illustrations (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  tags TEXT[],
  image_url VARCHAR(500),
  thumbnail_url VARCHAR(500),
  original_url VARCHAR(500),
  file_size VARCHAR(20),
  dimensions VARCHAR(20),
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- カテゴリテーブル
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ダウンロード履歴テーブル
CREATE TABLE download_logs (
  id SERIAL PRIMARY KEY,
  illustration_id INTEGER REFERENCES illustrations(id),
  ip_address INET,
  user_agent TEXT,
  downloaded_at TIMESTAMP DEFAULT NOW()
);
```

---

## Phase 4: 本番デプロイ

### Step 1: 環境変数設定

```bash
# Vercel/Netlifyの環境変数に設定
NEXT_PUBLIC_SITE_URL=https://your-domain.com
CLOUDFLARE_R2_ENDPOINT=https://your-account.r2.cloudflarestorage.com
CLOUDFLARE_R2_BUCKET=ai-sozai-ya-images
CLOUDFLARE_R2_ACCESS_KEY=your-access-key
CLOUDFLARE_R2_SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@host:5432/db
```

### Step 2: ビルドテスト

```bash
# ローカルでビルドテスト
npm run build
npm run start

# エラーがないことを確認
```

### Step 3: デプロイ実行

#### Vercel の場合:
1. GitHubにpush
2. Vercel が自動でビルド・デプロイ
3. カスタムドメインを設定

#### Netlify の場合:
1. GitHubにpush
2. Netlify が自動でビルド・デプロイ
3. ドメイン設定

---

## Phase 5: 運用最適化

### SEO対策
- [ ] sitemap.xml 生成
- [ ] robots.txt 設定
- [ ] Open Graph メタタグ
- [ ] 構造化データ（JSON-LD）

### パフォーマンス最適化
- [ ] 画像の最適化（WebP対応）
- [ ] CDN設定
- [ ] キャッシュ戦略
- [ ] Core Web Vitals 改善

### セキュリティ
- [ ] HTTPS 強制
- [ ] セキュリティヘッダー設定
- [ ] レート制限
- [ ] 不正アクセス対策

### 監視・分析
- [ ] Google Analytics 設定
- [ ] エラー監視（Sentry）
- [ ] パフォーマンス監視
- [ ] アップタイム監視

---

## 📊 月額コスト内訳

| 項目 | サービス | 月額コスト |
|------|----------|------------|
| ドメイン | お名前.com等 | 150円〜 |
| ホスティング | Vercel/Netlify無料プラン | 0円 |
| 画像ストレージ | Cloudflare R2 | ほぼ0円 |
| データベース | Supabase無料プラン | 0円 |
| 監視・分析 | 無料プラン | 0円 |
| **合計** |  | **150円〜** |

---

## 🔄 アップデート手順

1. **機能追加**
   ```bash
   git checkout -b feature/new-feature
   # 開発
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```

2. **本番反映**
   ```bash
   git checkout main
   git merge feature/new-feature
   git push origin main
   # Vercel/Netlifyが自動デプロイ
   ```

---

## 🆘 トラブルシューティング

### よくある問題
1. **ビルドエラー**
   - TypeScriptエラー確認
   - 依存関係の確認

2. **画像が表示されない**
   - next.config.js のドメイン設定確認
   - CORS設定確認

3. **環境変数が読めない**
   - NEXT_PUBLIC_ プレフィックス確認
   - デプロイ先の環境変数設定確認
