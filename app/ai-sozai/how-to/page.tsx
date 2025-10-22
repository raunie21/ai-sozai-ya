import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI素材 使い方｜検索・ダウンロード・活用のコツ',
  description: 'AI素材（AI 素材）の探し方、検索のコツ、ダウンロード方法、活用事例を解説。',
  alternates: { canonical: 'https://www.ai-sozaiya.com/ai-sozai/how-to' },
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
            headline: 'AI素材 使い方',
            description: 'AI素材（AI 素材）の使い方ガイド',
            author: { '@type': 'Organization', name: 'AIそざいや' },
            publisher: { '@type': 'Organization', name: 'AIそざいや' },
            mainEntityOfPage: 'https://www.ai-sozaiya.com/ai-sozai/how-to'
          })
        }}
      />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">AI素材 使い方</h1>
      <p className="text-gray-700 leading-relaxed mb-6">検索のコツからダウンロード、商用での活用までを順序立てて解説します。まずは目的（Web/動画/印刷）と求めるテイスト（人物/キッズ/アイコンなど）を決めてから探すと効率的です。</p>
      <ol className="list-decimal list-inside text-gray-700 space-y-3">
        <li><strong>探す</strong>：トップページのカテゴリまたは検索で絞り込み。タグ（表情・動作・季節など）を活用。</li>
        <li><strong>確認する</strong>：モーダルでタイトル/タグ/ダウンロード数を確認。関連イラストもチェック。</li>
        <li><strong>ダウンロード</strong>：ボタンから高解像度を入手。用途に応じてサイズ変更やトリミングを行う。</li>
        <li><strong>表記</strong>：YouTubeのみ概要欄にクレジット表記が必要。それ以外は原則クレジット不要。</li>
      </ol>
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <a href="/ai-sozai" className="block p-4 rounded-xl border hover:bg-gray-50">AI素材とは？</a>
        <a href="/ai-sozai/free" className="block p-4 rounded-xl border hover:bg-gray-50">フリー素材まとめ</a>
        <a href="/ai-sozai/commercial" className="block p-4 rounded-xl border hover:bg-gray-50">商用利用の注意点</a>
      </div>
      <section className="mt-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">よくある質問</h2>
        <details className="bg-white rounded-xl border p-4 mb-3">
          <summary className="font-semibold cursor-pointer">最適な画像サイズは？</summary>
          <p className="text-gray-700 mt-2">Webは長辺1200px前後、印刷は300dpi換算で必要解像度を確保するのが目安です。</p>
        </details>
        <details className="bg-white rounded-xl border p-4">
          <summary className="font-semibold cursor-pointer">クレジット表記は必要？</summary>
          <p className="text-gray-700 mt-2">YouTubeのみクレジット必須です。詳しくは<a href="/ai-sozai/commercial" className="text-blue-600 hover:underline">商用利用</a>をご確認ください。</p>
        </details>
      </section>
      </main>
    </div>
  );
}
