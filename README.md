# AIそざいや - 無料イラスト配布サイト

商用利用OK！クレジット表記不要の高品質イラストを無料でダウンロードできるWebサイトです。

## 🚀 技術スタック

- **Next.js 14** - Reactフレームワーク
- **TypeScript** - 型安全な開発
- **Tailwind CSS** - ユーティリティファーストのCSSフレームワーク
- **React Hooks** - 状態管理

## 🎨 機能

- 🔍 **検索機能** - キーワードやタグでイラストを検索
- 🏷️ **カテゴリフィルタ** - 人物、動物、ビジネス、食べ物、自然、アイコン
- 📊 **人気ランキング** - ダウンロード数に基づく人気順表示
- 📱 **レスポンシブデザイン** - モバイル、タブレット、デスクトップ対応
- ✨ **モダンUI** - グラスモーフィズム、アニメーション効果
- 💾 **ダウンロード機能** - PNG形式でのダウンロード

## 📦 セットアップ

### 前提条件

- Node.js 18以上
- npm または yarn

### インストール

\`\`\`bash
# リポジトリをクローン
git clone <repository-url>
cd radio2

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
\`\`\`

ブラウザで [http://localhost:3000](http://localhost:3000) を開いてサイトを確認できます。

## 🚀 デプロイメント

### Vercel（推奨）

1. [Vercel](https://vercel.com) にアカウントを作成
2. GitHubリポジトリを接続
3. 自動デプロイが設定されます

### Netlify

1. [Netlify](https://netlify.com) にアカウントを作成
2. GitHubリポジトリを接続
3. ビルド設定:
   - Build command: \`npm run build\`
   - Publish directory: \`.next\`

## 💰 運用コスト

| 項目 | 内容 | 月額コスト |
|------|------|-----------|
| ドメイン代 | お名前.com、ムームードメインなど | 約150円〜 |
| ホスティング代 | Vercel/Netlifyの無料プラン | 0円 |
| オブジェクトストレージ | Cloudflare R2（画像保管） | ほぼ0円 |
| データベース | Supabase/PlanetScale無料プラン | 0円 |
| **合計** |  | **約150円〜** |

## 📁 プロジェクト構造

\`\`\`
radio2/
├── app/
│   ├── components/          # Reactコンポーネント
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── Gallery.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── data/               # サンプルデータ
│   │   └── illustrations.ts
│   ├── types/              # TypeScript型定義
│   │   └── illustration.ts
│   ├── globals.css         # グローバルスタイル
│   ├── layout.tsx          # レイアウトコンポーネント
│   └── page.tsx           # メインページ
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
\`\`\`

## 🔧 カスタマイズ

### イラストデータの追加

\`app/data/illustrations.ts\` ファイルでイラストデータを管理できます:

\`\`\`typescript
export const illustrations: Illustration[] = [
  {
    id: 1,
    title: "新しいイラスト",
    emoji: "🎨",
    category: "icons",
    tags: ["アート", "デザイン"],
    downloads: 0
  },
  // 追加のイラスト...
];
\`\`\`

### カテゴリの追加

\`app/types/illustration.ts\` でカテゴリ型を拡張し、各コンポーネントで新しいカテゴリに対応できます。

### スタイルのカスタマイズ

Tailwind CSSのユーティリティクラスを使用してスタイルを調整できます。
カスタムアニメーションやカラーは \`tailwind.config.js\` で設定できます。

## 📈 拡張案

- ユーザー登録・ログイン機能
- お気に入り機能
- イラストのアップロード機能
- コメント・レビュー機能
- タグの自動生成（AI）
- イラストの自動生成（AI）

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストやイシューは歓迎します！

## 📞 サポート

質問や問題がある場合は、GitHubのIssuesページでお知らせください。
