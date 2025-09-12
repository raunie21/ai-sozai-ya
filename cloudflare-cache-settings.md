# Cloudflare R2 + CDN キャッシュ設定ガイド

## 1. Cloudflareダッシュボードでの設定

### キャッシュルールの設定
1. **Cloudflareダッシュボード**にアクセス
2. **R2** → **ai-sozai-images** バケットを選択
3. **Settings** → **Cache** に移動

### 推奨設定

#### 画像ファイルのキャッシュ設定
```
Cache-Control: public, max-age=31536000, immutable
```

#### 設定項目
- **Browser Cache TTL**: 1年 (31536000秒)
- **Edge Cache TTL**: 1年 (31536000秒)
- **Cache Level**: Cache Everything
- **Browser Cache TTL**: Respect Existing Headers

## 2. R2バケットのCORS設定

### CORS設定
```json
[
  {
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## 3. カスタムドメインの設定（オプション）

### カスタムドメインを設定する場合
1. **R2** → **ai-sozai-images** → **Settings**
2. **Custom Domains** → **Connect Domain**
3. ドメインを追加（例: `images.yourdomain.com`）

## 4. 画像最適化の設定

### WebP対応
- 既にWebP形式で画像を配信
- ブラウザの対応状況に応じて自動選択

### 画像圧縮
- Cloudflareの自動画像最適化を有効化
- **Speed** → **Optimization** → **Image Optimization**

## 5. パフォーマンス監視

### メトリクス確認
- **Analytics** → **Web Analytics**
- 画像の読み込み速度を監視
- キャッシュヒット率を確認

## 6. セキュリティ設定

### アクセス制御
- **Security** → **WAF**
- 不正なアクセスをブロック
- レート制限を設定

## 7. コスト最適化

### データ転送量の監視
- **Billing** → **Usage**
- 月間のデータ転送量を確認
- 不要なリクエストを削減

## 8. トラブルシューティング

### よくある問題
1. **画像が表示されない**
   - CORS設定を確認
   - バケットの公開設定を確認

2. **キャッシュが効かない**
   - Cache-Controlヘッダーを確認
   - ブラウザのキャッシュをクリア

3. **読み込み速度が遅い**
   - CDNの設定を確認
   - 画像の最適化を確認

