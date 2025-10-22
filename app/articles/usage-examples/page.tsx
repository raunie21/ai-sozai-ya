import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '素材使用例まとめ｜ドラマ系サムネ・FPSサムネ・注意喚起ポスター',
  description: 'AIそざいやの人物素材を使った具体的な使用例を紹介。動画サムネ、ゲーム配信サムネ、掲示用ポスターの作り方とポイント。',
  alternates: { canonical: 'https://www.ai-sozaiya.com/articles/usage-examples' },
  openGraph: {
    title: '素材使用例まとめ｜AIそざいや',
    description: '動画サムネ・ゲーム系サムネ・注意喚起ポスターの作り方を解説',
    url: 'https://www.ai-sozaiya.com/articles/usage-examples',
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
            <Link href="/" className="hover:text-blue-600">ホーム</Link>
            <span>›</span>
            <span className="text-gray-900 font-medium">素材使用例まとめ</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">素材使用例（作り方とコツ）</h1>
          <p className="text-gray-600 mt-2">AI生成したリアルな素材を活用すると、動画のクオリティ向上や編集の差別化、少し面白い雰囲気の演出が手早く実現できます。ここでは実際の使い所と得られる効果を、具体例で紹介します。</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Article',
              headline: '素材使用例まとめ',
              description: '動画サムネ・動画編集・注意喚起ポスターの作り方',
              author: { '@type': 'Organization', name: 'AIそざいや' },
              publisher: { '@type': 'Organization', name: 'AIそざいや' },
              mainEntityOfPage: 'https://www.ai-sozaiya.com/articles/usage-examples'
            })
          }}
        />

        <article className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
          <section className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">例1：ゲーム実況動画</h2>
            <div className="rounded-xl overflow-hidden border mb-4">
              <Image src="/articles/usage-examples/動画編集素材使用例.png" alt="テロップのイメージにあった素材を動画編集に使用した例" width={1280} height={720} priority />
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">ゲーム実況の編集で、テロップに合わせてそのイメージに合う人物素材を数秒だけ重ねて見せる使い方です。セリフや状況に合う表情のカットを差し込むことで、映像と言葉の結びつきが強まり、視聴者が内容を直感的に理解しやすくなります。</p>
            <p className="text-gray-700 leading-relaxed">AI素材を使うことで、撮影の手間をかけずに“伝わる一瞬”を作り込めます。画面の密度が上がり、動画全体のクオリティ感が増すほか、テンポよくギャグ的なニュアンスも加えられ、離脱防止や視聴維持率の改善に繋がります。</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">例2：FPSハイライト向けサムネ</h2>
            <div className="rounded-xl overflow-hidden border mb-4">
              <Image src="/articles/usage-examples/ゲーム無双サムネイル例.png" alt="笑顔の人物を大きく配置し斜めの大見出しを重ねたサムネ例" width={1280} height={720} />
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">FPSのハイライト動画やショートで、無双シーンやエース獲得の場面を象徴するカバー画像に人物素材を使う方法です。勢いのある表情の素材を大きく配置するだけで、シーンの強度や楽しさが一目で伝わります。</p>
            <p className="text-gray-700 leading-relaxed">AI素材ならスタイルや雰囲気を素早く揃えられるため、シリーズ化したときの統一感を出しやすく、クリック率の向上にも寄与します。配信者のキャラクター性を視覚的に補強し、視聴者の期待感を高められます。</p>
          </section>

          <section className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">例3：注意喚起ポスター</h2>
            <div className="rounded-xl overflow-hidden border mb-4">
              <Image src="/articles/usage-examples/注意書き例.png" alt="中央の人物に大きな赤いバツ印と下部の注意文のポスター例" width={1600} height={900} />
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">施設内やイベント会場などで、直感的に禁止内容を伝える掲示に人物素材を用いる例です。人物の動作と赤いバツ印を組み合わせることで、言語に依存せず一目で内容が理解できます。</p>
            <p className="text-gray-700 leading-relaxed">AI素材を使うと、状況に合ったポーズや年齢層を素早く用意でき、掲示物の更新・量産も容易になります。視認性の高いビジュアルにより注意喚起の効果が高まり、事故防止や案内の徹底に役立ちます。</p>
          </section>

          <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">仕上げチェック</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>文字は白＋黒縁＋影で背景と明度差を確保</li>
              <li>25%縮小で可読性を確認（モバイル想定）</li>
              <li>中央安全域に主要要素を配置</li>
              <li>各素材ページの利用条件を再確認</li>
            </ul>
          </section>

          <div className="mt-10 grid md:grid-cols-3 gap-4">
            <Link href="/" className="block p-4 rounded-xl border hover:bg-gray-50">AI素材を探す</Link>
            <Link href="/ai-sozai/free" className="block p-4 rounded-xl border hover:bg-gray-50">フリー素材まとめ</Link>
            <Link href="/ai-sozai/commercial" className="block p-4 rounded-xl border hover:bg-gray-50">商用利用の注意点</Link>
          </div>
        </article>
      </main>
    </div>
  );
}


