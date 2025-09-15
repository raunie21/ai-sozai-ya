/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  swcMinify: true,
  poweredByHeader: false,
  // API Routes を有効にするため、静的エクスポートは使用しない
  trailingSlash: true,
}

module.exports = nextConfig
