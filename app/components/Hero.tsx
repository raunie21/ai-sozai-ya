'use client';

import { useState } from 'react';
import { Category, Illustration } from '../types/illustration';
import Link from 'next/link';
import ImageSlideshow from './ImageSlideshow';
import OptimizedImage from './OptimizedImage';
import NinjaBanner from './NinjaBanner';

interface HeroProps {
  onSearch: (query: string) => void;
  illustrations: Illustration[];
}

export default function Hero({ onSearch, illustrations }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const handleSearch = () => {
    onSearch(searchQuery.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* ロゴ */}
            <div className="flex items-center space-x-1">
              <div className="w-8 h-8 rounded flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/favicon.svg" alt="AIそざいやicon" className="w-8 h-8 -mt-2 object-contain" />
              </div>
              <div className="space-x-2">
                <span className="text-xl font-bold text-gray-800">AIそざいや</span>
                <span className="text-sm font-medium text-gray-800 mt-1.5"><span className="text-xs">＜</span>毎日更新中！</span>
              </div>
            </div>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
              <a
                href="/ai-sozai"
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                <span className="text-lg">📘</span>
                <span className="hidden lg:inline">AI素材とは？</span>
              </a>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSfRhZemBKWEHMdUH4rdFgAWc4jtkvqKrzhUe_74Boy0bWz5Rg/viewform?usp=header"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                <span className="text-lg">📝</span>
                <span className="hidden lg:inline">リクエスト</span>
              </a>
              <a
                href="mailto:aisozaiya@ai-sozai.com?subject=%E3%81%8A%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B&body=%E3%81%8A%E5%90%8D%E5%89%8D%EF%BC%9A%0A%E3%81%94%E7%94%A8%E4%BB%B6%EF%BC%9A"
                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors duration-200"
              >
                <span className="text-lg">📧</span>
                <span className="hidden lg:inline">お問い合わせ</span>
              </a>
            </nav>

            {/* モバイルハンバーガーメニューボタン */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all duration-300"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <div className="flex flex-col justify-center items-center w-6 h-6">
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </div>
            </button>
          </div>

          {/* モバイルナビゲーションメニュー */}
          {isMobileMenuOpen && (
            <>
              {/* オーバーレイ */}
              <div 
                className="fixed inset-0 bg-black/20 z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />
              
              {/* メニューコンテンツ */}
              <div className="md:hidden mt-4 bg-white rounded-lg border border-gray-200 shadow-lg relative z-50">
                <nav className="p-4">
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="/ai-sozai"
                        className="flex items-center gap-3 w-full text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 py-3 px-4 rounded-lg transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="text-lg">📘</span>
                        <span className="font-medium">AI素材とは？</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLSfRhZemBKWEHMdUH4rdFgAWc4jtkvqKrzhUe_74Boy0bWz5Rg/viewform?usp=header"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 w-full text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 py-3 px-4 rounded-lg transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="text-lg">📝</span>
                        <span className="font-medium">リクエスト</span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="mailto:aisozaiya@ai-sozai.com?subject=%E3%81%8A%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B&body=%E3%81%8A%E5%90%8D%E5%89%8D%EF%BC%9A%0A%E3%81%94%E7%94%A8%E4%BB%B6%EF%BC%9A"
                        className="flex items-center gap-3 w-full text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 py-3 px-4 rounded-lg transition-all duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="text-lg">📧</span>
                        <span className="font-medium">お問い合わせ</span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </>
          )}
        </div>
      </header>


      {/* 最近追加された画像のスライドショー */}
      <div className="mt-16 md:mt-20">
        <ImageSlideshow illustrations={illustrations} />
      </div>

      {/* クリスマス特集ボタン（スライドショーとヒーローの間） */}
      <div className="mt-4 md:mt-6 px-4">
        <p className="text-center text-red-700 font-semibold text-sm md:text-base mb-2 tracking-wide">\クリスマス関連の素材を追加しました！/</p>
        <Link
          href="/christmas"
          aria-label="クリスマス特集ページへ"
          className="relative block mx-auto w-[92vw] md:w-[72vw] lg:w-[60vw] text-center py-4 md:py-5 rounded-2xl text-white font-black text-base md:text-lg shadow-xl hover:shadow-2xl transition-all duration-200 bg-[url('/checkpattern2.png')] bg-cover bg-center transform hover:-translate-y-0.5 hover:scale-[1.02] border-2 border-green-600/80 ring-2 md:ring-4 ring-green-600/30"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-xl md:text-2xl">🎄</span>
            <span className="drop-shadow-md tracking-wide">クリスマス特集を見る！</span>
          </div>
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full shadow-md">
            NEW
          </span>
        </Link>
      </div>

      {/* ヒーローセクション */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4 md:mb-6 leading-snug md:leading-tight">
            AI素材（AI生成された素材）を
            <br />
            無料で配布するサイト
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 md:mb-8 max-w-2xl md:max-w-3xl mx-auto leading-normal sm:leading-relaxed">
            全て独自に生成したAI画像のみを使用
            <br />
            AI 素材 は背景透過済みで使いやすい状態で配布しています。
            <br />
            全て<strong className="text-blue-600 font-semibold">手作業で背景透過</strong>を行うことで素材の品質を高めています。
            <br />
            AIで生成だからこそできる高画質の無料素材画像
            <br />
            商用利用OK・クレジット表記不要の高品質AI生成画像
            <br />
            <span className="text-red-600 font-medium">⚠️ YouTubeで使用する場合は概要欄へのクレジット表記が必須です</span>
            <br />
            商用利用の際の利用規約に関して、<a href="/terms" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 underline">
              こちら
            </a>をご確認ください。
          </p>
          
          {/* 統計情報 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
              <div className="text-3xl font-bold text-blue-600 mb-2">600+</div>
              <div className="text-gray-600 text-sm">素材総数</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
              <div className="text-3xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-600 text-sm">毎月更新</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
              <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-gray-600 text-sm">商用利用OK</div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
              <div className="text-3xl font-bold text-orange-600 mb-2">0円</div>
              <div className="text-gray-600 text-sm">完全無料</div>
            </div>
          </div>
          
          {/* 検索ボックス */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                className="w-full py-4 px-6 pl-14 bg-white border-2 border-gray-200 rounded-full text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                placeholder="キーワードを入力してイラストを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl">
                🔍
              </div>
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-all duration-200 font-medium"
              >
                検索
              </button>
            </div>
          </div>
          
          {/* 利用規約へのCTA */}
          <div className="mt-8">
            <Link 
              href="/terms"
              className="inline-flex items-center space-x-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg rounded-full transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              <span className="text-xl">📋</span>
              <span>利用規約を詳しく確認</span>
              <svg className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <Link
              href="/ai-sozai"
              className="ml-3 inline-flex items-center space-x-3 px-8 py-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-lg rounded-full transition-all duration-200 shadow-sm hover:shadow transform hover:-translate-y-1"
            >
              <span className="text-xl">📘</span>
              <span>AI素材とは？詳しく見る</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            <p className="text-gray-500 text-sm mt-3">
              商用利用に関する重要な規約をお読みください
            </p>
          </div>

          
          {/* 記事カード（最大4件。優先: ai-policy, usage-examples） */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 px-2 sm:px-4 md:px-0">
            {(() => {
              const all = [
                  { href: '/articles/ai-services-comparison', title: '画像生成AIサービス比較と商用ガイド', img: '/articles/ai-service-comparison/簡易的な背景削除機能の結果.png' },
                { href: '/articles/ai-policy', title: 'AI生成素材のポリシー', img: '/favicon.svg' },
                { href: '/articles/usage-examples', title: '素材使用例まとめ', img: '/articles/usage-examples/動画編集素材使用例.png' },
                { href: '/ai-sozai/commercial', title: '商用利用ガイド', img: '/favicon.svg' },
                { href: '/ai-sozai/how-to', title: '素材の使い方', img: '/favicon.svg' },
                { href: '/ai-sozai/free', title: 'フリー素材まとめ', img: '/favicon.svg' },
              ];
              const priority = ['/articles/ai-services-comparison', '/articles/ai-policy', '/articles/usage-examples'];
              const ordered = [
                ...all.filter(a => priority.includes(a.href)),
                ...all.filter(a => !priority.includes(a.href)),
              ];
              return ordered.slice(0, 4);
            })().map((a, idx) => (
              <a key={idx} href={a.href} className="group relative block rounded-xl border border-gray-200 hover:border-gray-300 overflow-hidden bg-white transition-shadow hover:shadow-md">
                {/* NEWバッジ（最新の記事に表示） */}
                {a.href === '/articles/ai-services-comparison' && (
                  <span className="absolute top-2 right-2 z-10 rounded-full bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 shadow-md">
                    NEW
                  </span>
                )}
                <div className="aspect-[16/9] bg-gray-50">
                  <OptimizedImage
                    src={a.img}
                    alt={a.title}
                    width={800}
                    height={450}
                    className="w-full h-full object-cover"
                    title={a.title}
                  />
                </div>
                <div className="p-2 sm:p-3">
                  <div className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-blue-700 line-clamp-2">
                    {a.title}
                  </div>
                </div>
              </a>
            ))}
          </div>
          {/* 横長バナー（忍者AdMax） - ヒーロー直下 */}
          <div className="mt-8 md:mt-6">
            <NinjaBanner
              src="https://adm.shinobi.jp/s/919523c348364153cd672b6ea9f865dc"
              label="スポンサーリンク"
            />
          </div>

        </div>
      </section>
    </div>
  );
}
