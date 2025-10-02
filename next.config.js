/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  swcMinify: true,
  poweredByHeader: false,
  // API Routes を有効にするため、静的エクスポートは使用しない
  trailingSlash: true,
  // Vercel Toolbarを無効化
  experimental: {
    disableOptimizedLoading: true,
  },
  env: {
    VERCEL_TOOLBAR: 'false',
  },
}

module.exports = nextConfig
