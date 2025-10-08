import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI素材 使い方｜検索・ダウンロード・活用のコツ',
  description: 'AI素材（AI 素材）の探し方、検索のコツ、ダウンロード方法、活用事例を解説。',
  alternates: { canonical: 'https://www.ai-sozaiya.com/ai-sozai/how-to' },
};

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">AI素材 使い方</h1>
      <ol className="list-decimal list-inside text-gray-700 space-y-2">
        <li>トップページでカテゴリや検索から素材を探す</li>
        <li>詳細モーダルでタイトル・タグを確認する</li>
        <li>ダウンロードボタンで高解像度を入手する</li>
      </ol>
      <p className="text-gray-700 mt-6">利用条件は<a href="/terms" className="text-blue-600 hover:underline">利用規約</a>をご確認ください。</p>
    </main>
  );
}
