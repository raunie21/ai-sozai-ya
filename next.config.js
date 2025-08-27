/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-bucket.r2.cloudflarestorage.com'],
    unoptimized: false,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // ビルドトレースの無限ループを防ぐ
  experimental: {
    // buildTracesは無効なオプションなので削除
  },
  // 画像ファイルの除外
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // 開発環境では画像ファイルの処理を簡素化
    if (!dev) {
      config.module.rules.push({
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'static/images/[hash][ext][query]'
        }
      });
    }
    
    // ビルドトレースの問題を防ぐ
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          images: {
            test: /\.(png|jpe?g|gif|svg|webp)$/i,
            name: 'images',
            chunks: 'all',
            enforce: true,
          },
        },
      },
    };
    
    return config;
  },
  // ビルド時のファイル除外
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // 静的ファイルの最適化
  staticPageGenerationTimeout: 120,
  // ビルド時のメモリ制限
  swcMinify: true,
}

module.exports = nextConfig
