/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.ai-sozaiya.com',
  generateRobotsTxt: false, // 手動でrobots.txtを管理
  outDir: 'public',
  changefreq: 'weekly',
  priority: 0.7,
  generateIndexSitemap: true,
  // 検索ページやAPIルートを除外
  exclude: [
    '/api/*',
    '/*?q=*', // 検索クエリパラメータ付きページを除外
  ],
  // 追加のパスを明示的に含める
  additionalPaths: async (config) => {
    const result = [];
    
    // 重要なページを明示的に追加
    const importantPages = [
      {
        loc: '/request',
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/terms',
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/contact',
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/ai-sozai',
        changefreq: 'monthly',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/ai-sozai/free',
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/ai-sozai/commercial',
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/ai-sozai/how-to',
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: new Date().toISOString(),
      },
    ];

    importantPages.forEach(page => {
      result.push({
        ...page,
        images: [
          {
            loc: 'https://img.ai-sozaiya.com/cdn-cgi/image/width=1200,height=630,fit=cover,gravity=center/images/originals/grandma/grandma-smile1.png',
            title: 'AI 素材 - 無料イラスト | AIそざいや'
          }
        ]
      });
    });

    return result;
  },
  transform: async (config, path) => {
    // ページ別の優先度設定
    let priority = 0.7;
    let changefreq = 'weekly';
    
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path === '/request') {
      priority = 0.8;
      changefreq = 'monthly';
    } else if (path.includes('/ai-sozai')) {
      priority = 0.7;
      changefreq = 'monthly';
    } else if (path === '/terms' || path === '/contact') {
      priority = 0.6;
      changefreq = 'monthly';
    }

    const base = {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
    
    // 代表的なOG画像を全ページに付与
    const images = [
      {
        loc: 'https://img.ai-sozaiya.com/cdn-cgi/image/width=1200,height=630,fit=cover,gravity=center/images/originals/grandma/grandma-smile1.png',
        title: 'AI 素材 - 無料イラスト | AIそざいや'
      }
    ];
    
    return { ...base, images };
  },
};


