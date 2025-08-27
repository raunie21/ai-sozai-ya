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
    // ビルドトレースを完全に無効化
    buildTraces: false,
    // その他の実験的機能も無効化
    serverComponentsExternalPackages: [],
    serverActions: false,
    // ビルドトレース関連の機能を無効化
    instrumentationHook: false,
    serverComponentsExternalPackages: [],
  },
  // 画像ファイルの除外
  webpack: (config, { isServer, dev, webpack }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
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
    
    // ビルドトレース関連のプラグインを無効化
    config.plugins = config.plugins.filter(plugin => {
      return !(plugin.constructor.name === 'BuildTracePlugin' || 
               plugin.constructor.name === 'TracePlugin');
    });
    
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
  // ビルドトレースを完全に無効化
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // 出力設定
  output: 'standalone',
  // ビルド時の最適化
  poweredByHeader: false,
  compress: true,
  // ビルドトレース関連の設定を無効化
  distDir: '.next',
  // ビルド時の最適化
  optimizeFonts: false,
  // ビルドトレースを無効化
  generateEtags: false,
}

module.exports = nextConfig
