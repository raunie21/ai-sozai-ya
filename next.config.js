/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // ビルドトレースを完全に無効化
  experimental: {
    buildTrace: false,
    serverComponentsExternalPackages: [],
  },
  // 基本的な設定のみ
  swcMinify: true,
  poweredByHeader: false,
  // ビルド時の最適化
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
