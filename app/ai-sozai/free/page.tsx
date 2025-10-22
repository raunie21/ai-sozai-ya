import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI素材 フリー素材｜完全無料のAI生成イラスト',
  description: 'AI素材（AI 素材）のフリー素材を紹介。完全無料・クレジット不要・商用利用OKのAI生成イラストをまとめました。',
  alternates: { canonical: 'https://www.ai-sozaiya.com/ai-sozai/free' },
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
            headline: 'AI素材 フリー素材',
            description: 'AI素材（AI 素材）のフリー素材まとめ',
            author: { '@type': 'Organization', name: 'AIそざいや' },
            publisher: { '@type': 'Organization', name: 'AIそざいや' },
            mainEntityOfPage: 'https://www.ai-sozaiya.com/ai-sozai/free'
          })
        }}
      />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">AI素材 フリー素材</h1>
      <p className="text-gray-700 leading-relaxed mb-6">
        当ページでは、完全無料でダウンロードできるAI生成イラスト（AI 素材）を厳選して紹介します。<strong>商用利用OK・クレジット不要</strong>（※YouTubeのみ概要欄にクレジット必須）で、Web・SNS・プレゼン・印刷など幅広い用途にそのまま使える品質です。はじめての方は、まず
        <a href="/ai-sozai" className="text-blue-600 hover:underline">「AI素材とは？」</a>もご覧ください。
      </p>

      {/* 特徴 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">このページのフリー素材の特徴</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>クレジット表記不要（YouTubeのみクレジット必須）</li>
          <li>商用利用OK（<a href="/ai-sozai/commercial" className="text-blue-600 hover:underline">商用利用の詳細</a>）</li>
          <li>高解像度のダウンロード対応・リサイズ自由</li>
          <li>人物・キッズ・アイコン・動物などの人気カテゴリを順次追加</li>
        </ul>
      </section>

      {/* 選び方（図版的な並び） */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">フリー素材の選び方（簡易図解）</h2>
        <div className="grid md:grid-cols-3 gap-4 text-gray-700">
          <div className="bg-gray-50 rounded-xl p-4">① 用途を決める（Web/印刷/動画）</div>
          <div className="bg-gray-50 rounded-xl p-4">② スタイルを決める（人物/キッズ/アイコン）</div>
          <div className="bg-gray-50 rounded-xl p-4">③ タグで絞る（表情/動作/季節など）</div>
        </div>
        <p className="text-sm text-gray-500 mt-3">詳しい探し方は<a href="/ai-sozai/how-to" className="text-blue-600 hover:underline">使い方ガイド</a>へ。</p>
      </section>

      {/* 活用例 */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">活用シーン</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>ブログのアイキャッチ・挿絵、SNSの投稿画像</li>
          <li>チラシ・店内POP・社内資料・イベントの告知画像</li>
          <li>動画のサムネイルやBGM告知フレーム（YouTubeの場合はクレジット必須）</li>
        </ul>
      </section>

      {/* 内部リンク */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">関連ページ</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li><a href="/ai-sozai" className="text-blue-600 hover:underline">AI素材とは？基本概念</a></li>
          <li><a href="/ai-sozai/commercial" className="text-blue-600 hover:underline">商用利用時の注意点</a></li>
          <li><a href="/request" className="text-blue-600 hover:underline">イラストリクエスト方法</a></li>
        </ul>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">よくある質問</h2>
        <div className="space-y-4">
          <details className="bg-white rounded-xl border p-4">
            <summary className="font-semibold cursor-pointer">無料素材と有料素材の違いは？</summary>
            <p className="text-gray-700 mt-2">当サイトの無料素材は解像度・利用範囲ともに十分実用的です。将来的にプレミアム素材を導入する場合も、無料素材の品質を下げることはありません。</p>
          </details>
          <details className="bg-white rounded-xl border p-4">
            <summary className="font-semibold cursor-pointer">商用での利用に制限は？</summary>
            <p className="text-gray-700 mt-2">基本OKです。禁止事項やクレジット要件などの詳細は<a href="/ai-sozai/commercial" className="text-blue-600 hover:underline">商用利用ページ</a>でご確認ください。</p>
          </details>
        </div>
      </section>
      </main>
    </div>
  );
}
