'use client';

import { useState } from 'react';
import { Category, Illustration } from '../types/illustration';
import Link from 'next/link';
import ImageSlideshow from './ImageSlideshow';

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
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-gray-800">AIそざいや</span>
            </div>

            {/* デスクトップナビゲーション */}
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
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

      {/* ヒーローセクション */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-6 leading-tight">
            AI素材・無料イラスト配布サイト
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            AI素材・フリー素材を無料配布！商用利用OK・クレジット表記不要の高品質AI生成イラストをダウンロード
            <br />
            <span className="text-red-600 font-medium">⚠️ YouTube等の動画サイトで使用する場合は概要欄へのクレジット表記が必須です</span>
            <br />
            商用利用の際の利用規約に関して、<a href="/terms" className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 underline">
              こちら
            </a>をご確認ください。
          </p>
          
          {/* 統計情報 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
              <div className="text-3xl font-bold text-blue-600 mb-2">15,000+</div>
              <div className="text-gray-600 text-sm">イラスト総数</div>
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
            <p className="text-gray-500 text-sm mt-3">
              商用利用に関する重要な規約をお読みください
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
