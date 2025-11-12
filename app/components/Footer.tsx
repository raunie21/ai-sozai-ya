'use client';

export default function Footer() {
  const footerSections = [
    {
      title: '利用について',
      links: [
        { name: 'AI 素材（トップ）', url: '/' },
        { name: 'AI素材について', url: '/ai-sozai' },
        { name: 'AI素材 フリー素材', url: '/ai-sozai/free' },
        { name: 'AI素材 商用利用', url: '/ai-sozai/commercial' },
        { name: 'AI素材 使い方', url: '/ai-sozai/how-to' },
        { name: '運営者情報・制作プロセス', url: '/about' },
        { name: 'お問い合わせ', url: '/contact' },
        { name: '利用規約', url: '/terms' },
        { name: 'プライバシーポリシー', url: '/privacy' }
      ]
    },
    {
      title: 'サポート',
      links: [
        { 
          name: 'お問い合わせ', 
          url: 'mailto:aisozaiya@ai-sozai.com?subject=%E3%81%8A%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B&body=%E3%81%8A%E5%90%8D%E5%89%8D%EF%BC%9A%0A%E3%81%94%E7%94%A8%E4%BB%B6%EF%BC%9A'
        },
        { 
          name: 'リクエスト', 
          url: 'https://docs.google.com/forms/d/e/1FAIpQLSfRhZemBKWEHMdUH4rdFgAWc4jtkvqKrzhUe_74Boy0bWz5Rg/viewform?usp=header'
        }
      ]
    },
    {
      title: 'SNS',
      links: [
        { name: 'Xアカウント', url: 'https://twitter.com/ai_sozaiya' }
      ]
    }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-800 to-gray-900 text-white/90 py-16 text-center border-t border-white/10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          {footerSections.map((section, index) => (
            <div key={index} className="text-left">
              <h3 className="mb-4 text-indigo-400 font-semibold text-lg">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <a
                    key={linkIndex}
                    href={link.url}
                    target={link.url.startsWith('http') ? '_blank' : '_self'}
                    rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="block text-gray-300 hover:text-white transition-colors duration-300 text-sm hover:underline"
                  >
                    {link.name}
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
