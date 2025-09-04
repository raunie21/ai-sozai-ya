/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  swcMinify: true,
  poweredByHeader: false,
  // ビルドトレースを無効化
  experimental: {
    buildTrace: false,
  },
  // 出力設定
  output: 'export',
  trailingSlash: true,
}

module.exports = nextConfig
