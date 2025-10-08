import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '運営者情報・制作プロセス｜AIそざいやのE-E-A-T',
  description: 'AIそざいやの運営者情報、AI素材制作プロセス、品質基準、更新体制、問い合わせ先を掲載。',
  alternates: { canonical: 'https://www.ai-sozaiya.com/about' },
};

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">運営者情報・制作プロセス</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">運営者情報</h2>
        <p className="text-gray-700">サイト名：AIそざいや／運営：AIそざいや編集部／連絡先：<a href="mailto:aisozaiya@ai-sozai.com" className="text-blue-600 hover:underline">aisozaiya@ai-sozai.com</a></p>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">制作プロセス</h2>
        <ol className="list-decimal list-inside text-gray-700 space-y-1">
          <li>安全性・コンプライアンスに配慮したプロンプト設計</li>
          <li>高解像度生成・リファイン・ノイズ除去</li>
          <li>タグ付け・日本語タイトル化・メタデータ整備</li>
          <li>手動レビュー（品質・権利・公序良俗）</li>
        </ol>
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">品質基準</h2>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          <li>解像度・構図・見やすさの基準を満たすこと</li>
          <li>人物表現の自然さ・用途適合性</li>
          <li>メタ情報（タグ・タイトル・カテゴリ）の整合性</li>
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">更新体制</h2>
        <p className="text-gray-700">新作を随時追加し、タグやタイトルの改善を継続しています。</p>
      </section>
    </main>
  );
}
