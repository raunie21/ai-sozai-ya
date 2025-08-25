'use client';

export default function Footer() {
  const footerSections = [
    {
      title: '利用について',
      links: ['利用規約', 'よくある質問', 'ライセンスについて']
    },
    {
      title: 'カテゴリ',
      links: ['人物イラスト', '動物イラスト', 'ビジネスイラスト', 'アイコン素材']
    },
    {
      title: 'サポート',
      links: ['お問い合わせ', 'リクエスト', '不具合報告']
    },
    {
      title: 'SNS',
      links: ['Twitter', 'Instagram', 'Facebook']
    }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-white/90 py-16 text-center border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {footerSections.map((section, index) => (
            <div key={index} className="text-left">
              <h3 className="mb-4 text-indigo-400 font-semibold text-lg">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href="#"
                    className="block text-gray-300 hover:text-white transition-colors duration-300 text-sm"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-gray-700 pt-8">
          <p className="text-gray-400">
            &copy; 2025 AIそざいや. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
