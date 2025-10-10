import type { Metadata } from 'next';
import Link from 'next/link';
import StructuredData from '../components/StructuredData';
import React from 'react';

export const metadata: Metadata = {
  title: 'AI素材とは？無料でダウンロードできるAI生成イラスト',
  description: 'AI素材（AI生成イラスト）について詳しく解説。商用利用可能な無料AI素材の特徴、使い方、ダウンロード方法をご紹介。高品質なAI素材を無料で提供しています。',
  keywords: ['AI素材', 'AI 素材', 'AI生成', 'AIイラスト', 'フリー素材', '無料イラスト', '商用利用', 'ダウンロード'],
  openGraph: {
    title: 'AI素材とは？無料でダウンロードできるAI生成イラスト | AIそざいや',
    description: 'AI素材（AI生成イラスト）について詳しく解説。商用利用可能な無料AI素材の特徴、使い方、ダウンロード方法をご紹介。',
    url: 'https://www.ai-sozaiya.com/ai-sozai',
  },
  alternates: {
    canonical: 'https://www.ai-sozaiya.com/ai-sozai',
  },
};

export default function AISozaiPage() {
  return (
    <>
      <StructuredData type="website" />
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                ホーム
              </Link>
              <span>›</span>
              <span className="text-gray-900 font-medium">AI素材について</span>
            </nav>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              AI素材とは？無料でダウンロードできるAI生成イラスト（AI 素材・フリー素材）
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              「AI 素材」の基本から活用方法、無料ダウンロードの手順、検索のコツまでを分かりやすく解説します。
            </p>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="max-w-4xl mx-auto px-4 py-12">
          <article className="bg-white rounded-2xl shadow-sm p-8 md:p-12">
            {/* AI素材とは */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">AI素材（AI 素材）とは</h2>
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed mb-6">
                  <strong>AI素材</strong>とは、人工知能（AI）技術を使用して生成されたイラストや画像素材のことです。
                  従来の手描きイラストとは異なり、AIが学習したデータを基に自動的に作成される新しい形のデジタル素材です。
                </p>
                <p className="text-gray-700 leading-relaxed mb-6">
                  当サイト「AIそざいや」では、高品質なAI素材を無料で提供しており、
                  <strong>商用利用OK・クレジット表記不要</strong>でご利用いただけます。
                </p>
                <p className="text-gray-700 leading-relaxed">
                  目的別に使いやすいよう、「人物のAI 素材」「キッズ向けAI 素材」などカテゴリ分けも充実しています。
                </p>
              </div>
            </section>

            {/* AI素材の特徴 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">AI素材（AI 素材）の特徴</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-blue-900 mb-3">🎨 高品質な仕上がり</h3>
                  <p className="text-blue-800">
                    最新のAI技術により、プロレベルの高品質なイラストを生成。
                    細部まで丁寧に描かれた美しい素材をご提供します。
                  </p>
                </div>
                <div className="bg-green-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-green-900 mb-3">⚡ 迅速な制作</h3>
                  <p className="text-green-800">
                    従来の手描きと比べて短時間で制作可能。
                    多様なバリエーションの素材を効率的に生成できます。
                  </p>
                </div>
                <div className="bg-purple-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-purple-900 mb-3">🆓 完全無料</h3>
                  <p className="text-purple-800">
                    すべてのAI素材を無料でダウンロード可能。
                    商用利用も無料で、クレジット表記も不要です。
                  </p>
                </div>
                <div className="bg-orange-50 p-6 rounded-xl">
                  <h3 className="text-xl font-semibold text-orange-900 mb-3">🎯 多様なスタイル</h3>
                  <p className="text-orange-800">
                    リアルなイラストからアニメ調まで、
                    様々なスタイルのAI素材をご用意しています。
                  </p>
                </div>
              </div>
            </section>

            {/* 利用方法 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">AI素材（AI 素材）の利用方法</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">素材を選択</h3>
                    <p className="text-gray-700">
                      トップページから気に入ったAI素材を選択します。カテゴリーや検索機能を使って効率的に探せます。
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">ダウンロード</h3>
                    <p className="text-gray-700">
                      ダウンロードボタンをクリックして、高解像度のAI素材を無料でダウンロードします。
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">自由に利用</h3>
                    <p className="text-gray-700">
                      商用利用OK・クレジット表記不要で、Webサイト、チラシ、プレゼンテーションなど様々な用途でご利用いただけます。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* よくある質問 */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">AI素材（AI 素材）に関するよくある質問</h2>
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Q. AI素材は本当に無料で使えますか？</h3>
                  <p className="text-gray-700">
                    A. はい、当サイトのAI素材はすべて無料でご利用いただけます。商用利用も無料で、クレジット表記も不要です。
                  </p>
                </div>
                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Q. AI素材の著作権はどうなっていますか？</h3>
                  <p className="text-gray-700">
                    A. 当サイトのAI素材は、利用規約に従ってご利用いただけます。詳細は<Link href="/terms" className="text-blue-600 hover:underline">利用規約</Link>をご確認ください。
                  </p>
                </div>
                <div className="border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Q. AI素材の品質はどの程度ですか？</h3>
                  <p className="text-gray-700">
                    A. 最新のAI技術を使用して生成された高品質な素材をご提供しています。プロの用途にも十分対応できる品質です。
                  </p>
                </div>
              </div>
            </section>

            {/* CTA */}
            <section className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                今すぐAI素材をダウンロード
              </h2>
              <p className="text-gray-700 mb-6">
                45点以上の高品質AI素材を無料でご利用いただけます
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors duration-200"
              >
                AI素材を見る
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </section>
          </article>
        </main>
      </div>
    </>
  );
}
