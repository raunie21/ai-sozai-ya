/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-bucket.r2.cloudflarestorage.com'],
    unoptimized: false,
  },
  // ビルドエラーの一時的な無視（開発中の対処法）
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // 基本的な設定のみ
  swcMinify: true,
  compress: true,
}

module.exports = nextConfig
