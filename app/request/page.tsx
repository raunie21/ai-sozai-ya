import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'イラストリクエスト | AI素材や - 無料AIイラスト配布サイト',
  description: 'AI素材やでは、ユーザーからのイラストリクエストを受け付けています。欲しいAI素材・イラストがあればお気軽にリクエストしてください。',
  keywords: 'イラストリクエスト, AI素材, 無料イラスト, リクエスト, オーダー',
  openGraph: {
    title: 'イラストリクエスト | AI素材や',
    description: 'AI素材やでイラストをリクエストしよう。無料でAI生成イラストを制作いたします。',
    url: 'https://www.ai-sozaiya.com/request',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://www.ai-sozaiya.com/request',
  },
};

export default function RequestPage() {
  const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfRhZemBKWEHMdUH4rdFgAWc4jtkvqKrzhUe_74Boy0bWz5Rg/viewform?usp=header';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "イラストリクエスト",
            "description": "AI素材やでイラストをリクエストできるページです。",
            "url": "https://www.ai-sozaiya.com/request",
            "isPartOf": {
              "@type": "WebSite",
              "name": "AI素材や",
              "url": "https://www.ai-sozaiya.com"
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "ホーム",
                  "item": "https://www.ai-sozaiya.com"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "イラストリクエスト",
                  "item": "https://www.ai-sozaiya.com/request"
                }
              ]
            }
          })
        }}
      />
      <main className="min-h-screen bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li><a href="/" className="hover:text-blue-600">ホーム</a></li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-800 font-medium">イラストリクエスト</li>
            </ol>
          </nav>
          
          <h1 className="text-3xl font-bold text-gray-800 mb-6">イラストのリクエスト</h1>
          <div className="prose max-w-none mb-8">
            <p className="text-gray-600 text-lg leading-relaxed">
              AI素材やでは、ユーザーの皆様からのイラストリクエストを受け付けています。
              欲しいAI素材・イラストがございましたら、下記のフォームからお気軽にリクエストしてください。
            </p>
            <ul className="text-gray-600 mt-4 space-y-2">
              <li>• 商用利用OK・クレジット表記不要の高品質AI生成イラスト</li>
              <li>• リクエストは無料で受け付けています</li>
              <li>• 制作完了後、サイトに追加してお知らせいたします</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">リクエスト方法</h2>
            <p className="text-gray-600">
              下記のGoogleフォームに、ご希望のイラストの詳細をご記入ください。
              できるだけ具体的にご記入いただくと、より良いイラストを制作できます。
            </p>
          </div>
          
          <iframe
            src={formUrl}
            className="w-full h-[1200px] border rounded-xl shadow-lg"
            title="イラストリクエストフォーム"
            loading="lazy"
          />
        </div>
      </main>
    </>
  );
}


