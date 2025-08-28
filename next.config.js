/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'your-bucket.r2.cloudflarestorage.com'],
    unoptimized: false,
  },
  // 実験的機能を無効化
  experimental: {
    serverComponentsExternalPackages: [],
    instrumentationHook: false,
  },
  // Webpack設定でビルドトレース関連の問題を防ぐ
  webpack: (config, { isServer, dev }) => {
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
    
    // ビルドトレース関連のプラグインを無効化
    config.plugins = config.plugins.filter(plugin => {
      return !(plugin.constructor.name === 'BuildTracePlugin' ||
               plugin.constructor.name === 'TracePlugin');
    });
    
    // ビルドトレース関連のルールを無効化
    config.module.rules = config.module.rules.filter(rule => {
      if (rule.use && Array.isArray(rule.use)) {
        return !rule.use.some(use => 
          use.loader && use.loader.includes('build-traces')
        );
      }
      return true;
    });
    
    // ビルドトレース関連の最適化を無効化
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          default: false,
          vendors: false,
        },
      },
    };
    
    // ビルドトレース関連の設定を無効化
    config.infrastructureLogging = {
      level: 'error',
    };
    
    return config;
  },
  // 基本的な設定
  swcMinify: true,
  compress: true,
  // ビルド時の最適化
  poweredByHeader: false,
  generateEtags: false,
  // ビルドトレースを無効化
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // 静的ファイルの最適化
  staticPageGenerationTimeout: 120,
  // ビルドトレースを無効化
  distDir: '.next',
  optimizeFonts: false,
  // ビルドトレースを無効化
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // 出力設定
  output: 'standalone',
  // ビルド時の最適化
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
