/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-bucket.r2.cloudflarestorage.com'],
    unoptimized: false,
  },
  // ビルドトレースを無効化
  experimental: {
    buildTrace: false,
  },
  // 基本的な設定
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  // 静的ファイルの最適化
  staticPageGenerationTimeout: 120,
  // ビルド時の最適化
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
