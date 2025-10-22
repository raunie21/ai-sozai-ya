import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI素材 商用利用｜ビジネスでも使えるAI生成イラスト',
  description: 'AI素材（AI 素材）の商用利用ガイド。利用可能範囲、禁止事項、YouTube時のクレジット要件などを解説。',
  alternates: { canonical: 'https://www.ai-sozaiya.com/ai-sozai/commercial' },
};

export default function Page() {
  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-4xl mx-auto px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'AI素材 商用利用',
            description: 'AI素材（AI 素材）の商用利用ガイド',
            author: { '@type': 'Organization', name: 'AIそざいや' },
            publisher: { '@type': 'Organization', name: 'AIそざいや' },
            mainEntityOfPage: 'https://www.ai-sozaiya.com/ai-sozai/commercial'
          })
        }}
      />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">AI素材 商用利用</h1>
      <p className="text-gray-700 leading-relaxed mb-6">このページでは、当サイトのAI素材（AI 素材）をビジネス用途で使う際の範囲と禁止事項、クレジット表記の要否などをわかりやすくまとめます。</p>
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">利用可能な用途</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-1">
        <li>Webサイト、広告、プレゼン、SNS、紙媒体など</li>
      </ul>
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">禁止事項</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-1">
        <li>当サイトの規約に反する行為（詳細は利用規約参照）</li>
        <li>YouTubeでのクレジット未記載</li>
      </ul>
      <p className="text-gray-700 mt-6">詳しくは <a href="/terms" className="text-blue-600 hover:underline">利用規約</a> をご確認ください。あわせて
        <a href="/ai-sozai" className="text-blue-600 hover:underline ml-1">AI素材とは？</a>や
        <a href="/ai-sozai/how-to" className="text-blue-600 hover:underline ml-1">使い方</a>も参考になります。</p>

      <section className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">よくある質問</h2>
        <details className="bg-white rounded-xl border p-4 mb-3">
          <summary className="font-semibold cursor-pointer">商標・人物の権利は？</summary>
          <p className="text-gray-700 mt-2">実在の商標や人物に酷似させる利用はお控えください。一般的な装飾用途での利用を推奨します。</p>
        </details>
        <details className="bg-white rounded-xl border p-4">
          <summary className="font-semibold cursor-pointer">二次配布は可能？</summary>
          <p className="text-gray-700 mt-2">画像そのものの再配布・再販売は不可です。制作物の一部として組み込む形でご利用ください。</p>
        </details>
      </section>
      </main>
    </div>
  );
}
