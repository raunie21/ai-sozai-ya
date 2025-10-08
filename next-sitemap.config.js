/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.ai-sozaiya.com',
  generateRobotsTxt: true,
  outDir: 'public',
  changefreq: 'weekly',
  priority: 0.7,
  // 画像サイトマップを有効化
  generateIndexSitemap: true,
  transform: async (config, path) => {
    const base = {
      loc: path,
      changefreq: 'weekly',
      priority: path === '/' ? 1.0 : 0.7,
      lastmod: new Date().toISOString(),
    };
    // 代表的なOG画像を全ページに付与（詳細なimage連携は今後API連携で拡張可能）
    const images = [
      {
        loc: 'https://img.ai-sozaiya.com/cdn-cgi/image/width=1200,height=630,fit=cover/og/default-og.png',
        title: 'AI 素材 - 無料イラスト | AIそざいや'
      }
    ];
    return { ...base, images };
  },
};


