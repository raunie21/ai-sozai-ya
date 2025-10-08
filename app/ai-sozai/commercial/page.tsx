import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI素材 商用利用｜ビジネスでも使えるAI生成イラスト',
  description: 'AI素材（AI 素材）の商用利用ガイド。利用可能範囲、禁止事項、YouTube時のクレジット要件などを解説。',
  alternates: { canonical: 'https://www.ai-sozaiya.com/ai-sozai/commercial' },
};

export default function Page() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">AI素材 商用利用</h1>
      <p className="text-gray-700 mb-6">AI素材（AI 素材）を商用で使用する際のガイドラインです。</p>
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">利用可能な用途</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-1">
        <li>Webサイト、広告、プレゼン、SNS、紙媒体など</li>
      </ul>
      <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-3">禁止事項</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-1">
        <li>当サイトの規約に反する行為（詳細は利用規約参照）</li>
        <li>YouTubeでのクレジット未記載</li>
      </ul>
      <p className="text-gray-700 mt-6">詳しくは <a href="/terms" className="text-blue-600 hover:underline">利用規約</a> をご確認ください。</p>
    </main>
  );
}
