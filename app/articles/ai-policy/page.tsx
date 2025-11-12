'use client';

import Link from 'next/link';

export default function AIPolicyPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <nav className="mb-6 text-sm text-gray-500">
          <Link href="/" className="hover:underline">ホーム</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">AI生成素材のポリシー</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          AI生成素材の利用に関するポリシーとガイドライン
        </h1>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">【当サイトが約束する品質と安全性】</h2>
          <p className="text-gray-700 leading-relaxed">
            当サイトで提供する素材画像は、生成から最終的な背景透過処理まで、全て手作業で丁寧に制作・厳選しています。
            AIが生成する大量の画像の中から、品質が高く、利用する方が快適にご利用いただける素材のみを厳選して提供いたします。
            安心して商用利用いただくため、品質だけでなく、権利リスクの回避にも徹底的にこだわって運用しています。
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">1. 【当サイトの素材生成ポリシー（運営者側が守ること）】</h2>
          <p className="text-gray-700 mb-4">
            当サイトが、素材の権利と安全性を確保するために実施している制作方針です。
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mb-2">1.1. 権利侵害の回避の徹底</h3>
          <div className="space-y-3 text-gray-700">
            <div>
              <p className="font-medium">既存の著作物・商標の排除</p>
              <p>
                当サイトの全ての素材は、生成プロセスにおいて、特定のキャラクター名、作品名、ブランド名、著名なアーティスト名など、
                第三者の著作権や商標権を侵害する恐れのある固有名詞をプロンプトに使用していません。特定の作品の表現上の特徴を模倣するような生成指示も避けています。
              </p>
            </div>
            <div>
              <p className="font-medium">最終的な類似性の確認</p>
              <p>
                生成された画像一つひとつを、公開前に既存の有名コンテンツに酷似していないか厳しく目視でチェックしています。
                万が一、意図しない類似物が含まれていることが判明した場合は、速やかに配布を停止・削除いたします。
              </p>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">1.2. 利用ツールの権利関係のクリア</h3>
          <div className="space-y-3 text-gray-700">
            <div>
              <p className="font-medium">商用利用権の確保</p>
              <p>
                素材生成に使用しているAIツールについては、「生成物の商用利用および配布」が正規に認められているプラン・ライセンスに基づき運用しています。
                これにより、ユーザーの皆様が安心して商用利用できる法的基盤を確保しています。
              </p>
            </div>
            <div>
              <p className="font-medium">コミュニティガイドラインの遵守</p>
              <p>
                生成ツールの提供元が定める<strong>不適切なコンテンツ（暴力、差別、アダルトなど）</strong>に関するガイドラインを厳守し、健全で安全な素材のみを配布しています。
              </p>
            </div>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">2. 【素材利用者が守るべきこと（利用規約と法的責任）】</h2>
          <p className="text-gray-700 mb-4">
            配布素材を扱う上で、利用者の皆様に守っていただくべきルールと、法的責任に関する重要な事項です。
          </p>

          <h3 className="text-lg font-semibold text-gray-800 mb-2">2.1. 利用範囲の制限と禁止事項</h3>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>
              <span className="font-medium">利用規約の遵守義務</span>：素材を利用する際は、必ず当サイトの利用規約に同意したものと見なします。規約外の利用は固く禁じます。
            </li>
            <li>
              <span className="font-medium">再配布・商標登録の禁止</span>：素材の再配布や、素材を主要な要素としての商標登録を禁止します。
            </li>
            <li>
              <span className="font-medium">不当な利用の禁止</span>：公序良俗に反する目的、誹謗中傷・差別的表現を目的とした利用は禁止します。
            </li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">2.2. 利用者の最終責任</h3>
          <div className="space-y-3 text-gray-700">
            <p>
              当サイトは、著作権侵害リスクを徹底して排除した素材を提供していますが、素材の利用方法、およびその利用によって生じた利用者と第三者間のトラブルについて、一切の責任を負いません。
            </p>
            <p>
              利用者には、素材を最終的なデザインとして適用する際に、ご自身の責任において他者の権利を侵害していないか確認いただく義務があります。
            </p>
            <p>
              AI生成物に関する著作権の法的解釈は進化途上です。最新の法的見解にもご留意の上、ご利用をお願いいたします。
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-800 mb-3">3. 【トラブル発生時の対応】</h2>
          <p className="text-gray-700 leading-relaxed">
            万が一、配布素材に関して著作権者等の第三者から権利侵害の指摘があった場合は、指摘内容を精査した上で、速やかに該当素材の配布を停止・削除する対応を取ります。
          </p>
        </section>

        <div className="text-right">
          <Link href="/" className="text-blue-600 hover:underline">ホームへ戻る</Link>
        </div>
      </div>
    </main>
  );
}


