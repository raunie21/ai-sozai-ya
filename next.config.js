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
    
    return config;
  },
  // 基本的な設定
  swcMinify: true,
  compress: true,
  // ビルド時の最適化
  poweredByHeader: false,
  generateEtags: false,
}

module.exports = nextConfig
