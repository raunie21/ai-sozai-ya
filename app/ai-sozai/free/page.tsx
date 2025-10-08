import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI素材 フリー素材｜完全無料のAI生成イラスト',
  description: 'AI素材（AI 素材）のフリー素材を紹介。完全無料・クレジット不要・商用利用OKのAI生成イラストをまとめました。',
  alternates: { canonical: 'https://www.ai-sozaiya.com/ai-sozai/free' },
};

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">AI素材 フリー素材</h1>
      <p className="text-gray-700 mb-6">完全無料で使えるAI素材（AI 素材）のイラストを紹介します。</p>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>クレジット表記不要（YouTubeのみ要クレジット）</li>
        <li>商用利用OK</li>
        <li>高解像度のダウンロード対応</li>
      </ul>
    </main>
  );
}
