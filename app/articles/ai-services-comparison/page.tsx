'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AIServicesComparisonPage() {
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: '当サイトの素材作成に関して（画像生成AIサービス比較と商用利用ガイド）',
    description:
      '当サイトの独自の素材制作フロー、著作権・商用利用に関する考え方、主要AI画像生成サービスの比較と注意点、E-E-A-Tの取り組みをご紹介します。',
    inLanguage: 'ja',
    isAccessibleForFree: true,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://www.ai-sozaiya.com/articles/ai-services-comparison',
    },
    publisher: {
      '@type': 'Organization',
      name: 'AI素材屋',
      url: 'https://www.ai-sozaiya.com/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.ai-sozaiya.com/logo192.png',
      },
    },
  };

  const [isZoomOpen, setIsZoomOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-4">
          <Link href="/" className="inline-flex items-center text-sm text-blue-700 hover:text-blue-800 underline underline-offset-2">
            ← ホームに戻る
          </Link>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            当サイトの素材作成に関して
        </h1>

        <p className="text-gray-700 leading-relaxed mb-6">
          当サイトの素材作成方法に関して以下で詳しく説明していきます。
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mb-3">1. はじめに</h2>
        <p className="text-gray-700 leading-relaxed mb-6">
            当サイトは独自にAI画像を生成して素材を作成しています。また、素材作成時に著作権に違反する恐れがある固有名詞をプロンプトに含めない、著作権で保護されている画像をプロンプトに使用しない(image to image)ことをお約束いたします。
        </p>

        <h2 className="text-xl font-semibold text-gray-800 mb-3">2. 著作権と商用利用に関する比較表</h2>
        <p className="text-gray-700 leading-relaxed mb-6">
            ご自身で画像を生成する場合のAIサービスの詳しい比較表を以下に示します。
        </p>
        <div className="overflow-x-auto border rounded-lg mb-8">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-3 py-2 text-left">サービス名</th>
                <th className="px-3 py-2 text-left">画像生成エンジン</th>
                <th className="px-3 py-2 text-left">主な商用利用の可否</th>
                <th className="px-3 py-2 text-left">無料で使える範囲</th>
                <th className="px-3 py-2 text-left">著作権（所有権）の帰属</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr>
                <td className="px-3 py-3 font-semibold">Midjourney</td>
                <td className="px-3 py-3">独自</td>
                <td className="px-3 py-3 font-semibold text-red-600">有料プランのみ可能</td>
                <td className="px-3 py-3">原則不可</td>
                <td className="px-3 py-3">有料ユーザーに帰属。</td>
              </tr>
              <tr>
                <td className="px-3 py-3 font-semibold">Adobe Firefly</td>
                <td className="px-3 py-3">独自（Firefly）</td>
                <td className="px-3 py-3 font-semibold text-green-700">可能（ロイヤリティフリー）</td>
                <td className="px-3 py-3">あり（透かし・クレジット制限）</td>
                <td className="px-3 py-3">ユーザーに帰属。権利侵害リスクが低い。</td>
              </tr>
              <tr>
                <td className="px-3 py-3 font-semibold">Leonardo.Ai</td>
                <td className="px-3 py-3">独自 + SD系</td>
                <td className="px-3 py-3 font-semibold text-green-700">可能</td>
                <td className="px-3 py-3">あり（毎日トークン付与）</td>
                <td className="px-3 py-3">ユーザーに帰属。</td>
              </tr>
              <tr>
                <td className="px-3 py-3 font-semibold">Bing Image Creator</td>
                <td className="px-3 py-3">DALL‑E 3</td>
                <td className="px-3 py-3 font-semibold text-green-700">可能（原則）</td>
                <td className="px-3 py-3">あり（ブースト付与）</td>
                <td className="px-3 py-3">ユーザーに利用ライセンス付与（所有権はOpenAI/Microsoft）。</td>
              </tr>
              <tr>
                <td className="px-3 py-3 font-semibold">ChatGPT (DALL‑E 3)</td>
                <td className="px-3 py-3">DALL‑E 3</td>
                <td className="px-3 py-3 font-semibold text-red-600">有料プランのみ可能</td>
                <td className="px-3 py-3">不可（画像生成機能なし）</td>
                <td className="px-3 py-3">ユーザーに帰属。</td>
              </tr>
              <tr>
                <td className="px-3 py-3 font-semibold">Gemini (Google)</td>
                <td className="px-3 py-3">Imagen</td>
                <td className="px-3 py-3 font-semibold text-red-600">有料プランのみ可能</td>
                <td className="px-3 py-3">不可（無料LLMに画像生成なし）</td>
                <td className="px-3 py-3">ユーザーに帰属。</td>
              </tr>
              <tr>
                <td className="px-3 py-3 font-semibold">Grok (xAI)</td>
                <td className="px-3 py-3">非公開</td>
                <td className="px-3 py-3 font-semibold text-green-700">有料プランで利用可能</td>
                <td className="px-3 py-3">不可（X Premium+が必要）</td>
                <td className="px-3 py-3">有料ユーザーに帰属。</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-3">3. 各ツールの詳細解説と注意点</h2>

        <section className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">① Midjourney</h3>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <tbody className="divide-y">
                <tr><td className="px-3 py-2 font-medium w-48">商用利用条件</td><td className="px-3 py-2">有料プラン（Basic以上）が必須。年収$100万超の企業はPro以上など規模要件あり。</td></tr>
                <tr><td className="px-3 py-2 font-medium">無料利用の制限</td><td className="px-3 py-2">試用は原則提供されておらず、商用不可。</td></tr>
                <tr><td className="px-3 py-2 font-medium">著作権の規約差</td><td className="px-3 py-2">ステルスモードはPro以上。公開生成は他ユーザーに閲覧・利用され得る。</td></tr>
                <tr><td className="px-3 py-2 font-medium">特筆事項</td><td className="px-3 py-2">芸術性は高いが、学習データの透明性が低く、権利面の自己チェックが重要。</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">② Adobe Firefly</h3>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <tbody className="divide-y">
                <tr><td className="px-3 py-2 font-medium w-48">商用利用条件</td><td className="px-3 py-2">可能（ロイヤリティフリー）。比較的安心して商用利用しやすい。</td></tr>
                <tr><td className="px-3 py-2 font-medium">無料利用の制限</td><td className="px-3 py-2">無料クレジットあり。無料生成は透かしが付く場合があり要注意。</td></tr>
                <tr><td className="px-3 py-2 font-medium">著作権の規約差</td><td className="px-3 py-2">学習データの安全性が高い（Adobe Stock等）。有料で透かし解除・高品質生成。</td></tr>
                <tr><td className="px-3 py-2 font-medium">特筆事項</td><td className="px-3 py-2">Content Credentials で生成物の出所を明示。</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">③ Leonardo.Ai</h3>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <tbody className="divide-y">
                <tr><td className="px-3 py-2 font-medium w-48">商用利用条件</td><td className="px-3 py-2">可能。生成アセットの所有権はユーザーに帰属。</td></tr>
                <tr><td className="px-3 py-2 font-medium">無料利用の制限</td><td className="px-3 py-2">毎日一定量のトークンが付与。範囲内で商用利用可。</td></tr>
                <tr><td className="px-3 py-2 font-medium">著作権の規約差</td><td className="px-3 py-2">有料で生成速度・トークン・モデルアクセスが拡張。</td></tr>
                <tr><td className="px-3 py-2 font-medium">特筆事項</td><td className="px-3 py-2">コミュニティモデルが豊富でスタイル指定が容易。</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">④ Bing Image Creator / ChatGPT (DALL‑E 3)</h3>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <tbody className="divide-y">
                <tr><td className="px-3 py-2 font-medium w-48">商用利用条件</td><td className="px-3 py-2">ChatGPT Plus で商用可。Bingは無料だがOpenAIの規約に準拠。</td></tr>
                <tr><td className="px-3 py-2 font-medium">無料利用の制限</td><td className="px-3 py-2">Bingはブースト内で可。ChatGPT無料は画像生成不可。</td></tr>
                <tr><td className="px-3 py-2 font-medium">著作権の規約差</td><td className="px-3 py-2">所有権はOpenAI/Microsoftだが、商用利用ライセンスをユーザーに付与。</td></tr>
                <tr><td className="px-3 py-2 font-medium">特筆事項</td><td className="px-3 py-2">DALL‑E 3はプロンプト理解が高精度。特定アーティスト/キャラは禁止。</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">⑤ Gemini (Google)</h3>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <tbody className="divide-y">
                <tr><td className="px-3 py-2 font-medium w-48">商用利用条件</td><td className="px-3 py-2">有料プラン（例: Google One AI Premium等）で商用可。</td></tr>
                <tr><td className="px-3 py-2 font-medium">無料利用の制限</td><td className="px-3 py-2">無料LLMには画像生成機能なし。</td></tr>
                <tr><td className="px-3 py-2 font-medium">著作権の規約差</td><td className="px-3 py-2">デジタルウォーターマーク付与の可能性あり。</td></tr>
                <tr><td className="px-3 py-2 font-medium">特筆事項</td><td className="px-3 py-2">Imagenを採用。不適切生成や人物生成に厳格な制限。</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">⑥ Grok (xAI)</h3>
          <div className="overflow-x-auto border rounded-lg">
            <table className="min-w-full text-sm">
              <tbody className="divide-y">
                <tr><td className="px-3 py-2 font-medium w-48">商用利用条件</td><td className="px-3 py-2">X Premium+ などの有料プラン契約者は商用利用可。</td></tr>
                <tr><td className="px-3 py-2 font-medium">無料利用の制限</td><td className="px-3 py-2">サービス自体が有料プラン前提。</td></tr>
                <tr><td className="px-3 py-2 font-medium">著作権の規約差</td><td className="px-3 py-2">出力の所有権はユーザーに帰属。ただしサービス改善のための使用権付与が必要。</td></tr>
                <tr><td className="px-3 py-2 font-medium">特筆事項</td><td className="px-3 py-2">Acceptable Use Policy に従い、違法・不適切な生成は禁止。</td></tr>
              </tbody>
            </table>
          </div>
        </section>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">4. 当サイトを利用することのメリット</h2>
        <p className="text-gray-700 leading-relaxed mb-6">
            前述したように画像生成AIサービスは基本的に無料版では商用利用できないことがほとんどです。また自身で画像を生成しようとする場合、思っていたような画像を生成するのは以外と難しいことがあります。<br />
            簡単そうに思えるAIを使用した画像生成にもプロンプトをどう記述するかの専門的知識が必要です。そうした専門的知識を身につけるのは想像以上に手間がかかります。<br />
            当サイトを利用することでこのような手間を省き、思い描いていた画像を生成できないといった精神的苦痛を排除することができるのです。
        </p>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">4ー1. 無料で素材を利用できる。</h3>

        <p className="text-gray-700 leading-relaxed mb-6">
            当サイトでは素材を無料で提供しています。商用利用も無料で、クレジット表記も不要です。
        </p>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">4ー2. 有料プランを購入しても無制限ではない</h3>
        <p className="text-gray-700 leading-relaxed mb-6">
            AI画像生成サービスで有料版を購入しても無制限ではないことがほとんどです。有料版を購入しても使用できるトークン数や生成回数に制限がある場合があります。<br />
            想像した画像を生成しようとしているうちにトークンがなくなってしまって、そもそも生成できないということがあるのです。
        </p>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          <span className="underline-draw underline-draw-red">
            4ー3. 現状、生成段階で背景透過はできない
          </span>
        </h3>
        {/* 4-3 見出し直下に比較用の2画像を配置 */}
        <div className="my-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <figure className="bg-white border border-gray-200 rounded-lg p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/articles/ai-service-comparison/背景透過を試みた画像１.png"
              alt="背景透過を試みた画像１（チェック模様が背景に埋め込まれている例）"
              className="w-full h-auto rounded"
              decoding="async"
            />
            <figcaption className="mt-2 text-xs text-gray-600">
              一見背景透過されているように見えますが、実際は薄いチェック模様の画像が背景として埋め込まれているだけで透過ではありません。
            </figcaption>
          </figure>
          <figure className="bg-white border border-gray-200 rounded-lg p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/articles/ai-service-comparison/背景透過を試みた画像２.png"
              alt="背景透過を試みた画像２（白背景になっているだけで透過ではない例）"
              className="w-full h-auto rounded"
              decoding="async"
            />
            <figcaption className="mt-2 text-xs text-gray-600">
              背景が白くなっているだけで、背景自体は透過されていません（アルファチャンネルは存在しません）。
            </figcaption>
          </figure>
        </div>
        
        <p className="text-gray-700 leading-relaxed mb-6">
            <span className="text-red-700 font-semibold">
              現在のAI画像サービスでは直接的な透過生成は難しいです。
            </span>
            <br />
            AI画像生成モデル（DALL-E 3、Midjourneyなど）は、基本的に「画像全体」を生成することに特化しています。これは、指定されたプロンプトに基づいて、色、形、テクスチャ、光、影など、すべてのピクセルを埋めるように学習されているためです。
            <br />
            透過（透明な背景、アルファチャンネル）は、画像を構成する「ピクセル自体」の色情報とは異なる「ピクセルの透明度」という情報です。AIが直接的にこの透明度情報を同時に高精度で出力することは、現在の技術では一般的に苦手とされています。<br />
        </p>
        {/* 4-3 本文の下に「画像＋説明」を並列配置 */}
        <div className="my-6 md:flex md:items-start md:gap-3">
          <figure className="bg-white border border-gray-200 rounded-lg p-1 flex flex-col items-center w-full md:w-[270px] md:shrink-0 mx-auto md:mx-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/articles/ai-service-comparison/簡易的な背景削除機能の結果.png"
              alt="簡易的な背景削除機能の結果（細部に背景色が残っている例）"
              className="w-auto max-h-56 sm:max-h-64 md:max-h-56 object-contain rounded cursor-zoom-in"
              onClick={() => setIsZoomOpen(true)}
              decoding="async"
            />
            <figcaption className="mt-2 text-xs text-gray-600">
              Midjourneyの簡易背景削除の結果。
            </figcaption>
          </figure>
          <div className="rounded-lg p-4 text-sm text-gray-800 leading-relaxed md:flex-1">
            <p className="mb-3">
              左の画像は、<span className="font-semibold">Midjourney</span>の「簡易的な背景削除」機能で背景透過を試みた結果です。大まかな背景は消えていますが、細部には背景色が残り、
              高品質な素材として配布できるレベルには達していません。実務で綺麗に透過させるには、<span className="font-semibold">専門ソフトを使った丁寧な手作業</span>が必要になります。<br />
              画像生成ツールの「背景削除」は<span className="font-semibold">簡易処理</span>のことが多く、チェック柄の画像を重ねただけ・白背景に置き換えただけなど、
              <span className="font-semibold">アルファ透過</span>が確保されていないケースが見受けられます。
            </p>
            <p className="mb-0">
              実務で美しく透過させるには、専門ソフトを用いてマスクの微調整、色かぶり除去、半透明の整形など
              <span className="font-semibold">丁寧な手作業</span>が不可欠です。本サイトでは配布前にこれらの工程を行い、品質を担保しています。
            </p>
          </div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          <span className="underline-draw underline-draw-yellow">
            4ー4. 手作業による背景の透過
          </span>
        </h3>
        <p className="text-gray-700 leading-relaxed mb-6">
            当サイトでは
            <span className="text-red-700 font-semibold">
              手作業による背景の透過
            </span>
            を行っています。
            <br />
            AIが苦手とする透明度情報を手作業で補完することで、生成時の手間と合わせて利用者が快適に素材を利用できるようにしています。
        </p>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">4ー5. 素材の品質が高い</h3>
        <p className="text-gray-700 leading-relaxed mb-6">
            当サイトでは素材の品質を最重視しています。<br />
            基本的には2048x2048pxの素材を提供しており、無料で高画質の素材を利用できるようにしています。<br />
            既存のAI画像生成サービスの無料利用の範疇では高画質の素材を生成できない場合があります。<br />
            素材の品質が高いことで、利用者が快適に素材を利用できるようにしています。
        </p>
        <h2 className="text-xl font-semibold text-gray-800 mb-3">5. 参考リンク</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-700">
          <li><a href="/articles/ai-policy" className="text-blue-700 hover:underline">AI生成素材のポリシー</a></li>
          <li><a href="/terms" className="text-blue-700 hover:underline">利用規約</a></li>
          <li><a href="/articles/usage-examples" className="text-blue-700 hover:underline">素材使用例まとめ</a></li>
          <li><a href="/ai-sozai/how-to" className="text-blue-700 hover:underline">素材の使い方ガイド</a></li>
          <li><a href="/request" className="text-blue-700 hover:underline">イラストリクエスト</a></li>
          <li><a href="/contact" className="text-blue-700 hover:underline">お問い合わせ</a></li>
        </ul>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <style jsx>{`
        .underline-draw {
          position: relative;
          display: inline-block;
        }
        .underline-draw::after {
          content: '';
          position: absolute;
          left: 0;
          bottom: 0px;
          height: 5px;
          width: 0%;
          background-color: var(--line-color, #ef4444);
          border-radius: 9999px;
          animation: draw-underline 900ms ease-out forwards;
        }
        .underline-draw-red {
          --line-color:rgba(248, 113, 113, 0.7);
        }
        .underline-draw-yellow {
          /* 少しオレンジを加えた黄色（amber系） */
          --line-color:rgba(251, 190, 36, 0.7);
        }
        @keyframes draw-underline {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="画像を拡大表示"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/articles/ai-service-comparison/簡易的な背景削除機能の結果.png"
            alt="簡易的な背景削除機能の結果（拡大表示）"
            className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl cursor-zoom-out"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </main>
  );
}


