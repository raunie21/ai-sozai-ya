'use client';

import { useState } from 'react';
import { Category } from '../types/illustration';

interface HeroProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: Category) => void;
  currentCategory: Category;
}

export default function Hero({ onSearch, onCategoryChange, currentCategory }: HeroProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all' as Category, label: 'すべて' },
    { id: 'ranking' as Category, label: '人気ランキング' },
    { id: 'people' as Category, label: '人物' },
    { id: 'animals' as Category, label: '動物' },
    { id: 'business' as Category, label: 'ビジネス' },
    { id: 'food' as Category, label: '食べ物' },
    { id: 'nature' as Category, label: '自然' },
    { id: 'icons' as Category, label: 'アイコン' },
  ];

  const handleSearch = () => {
    onSearch(searchQuery.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <section className="text-center py-16 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-6xl font-black mb-6 text-white-gradient animate-text-glow tracking-tight animate-fade-in-up">
          無料イラスト配布サイト
        </h1>
        <p className="text-xl mb-8 opacity-90 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          商用利用OK！クレジット表記不要の高品質イラストを無料でダウンロード
        </p>
        
        <div className="max-w-2xl mx-auto mb-8 relative animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <input
            type="text"
            className="w-full py-5 px-7 pr-20 border-2 border-white/20 rounded-full text-lg bg-white/90 backdrop-blur-sm shadow-2xl outline-none transition-all duration-300 focus:border-white/40 focus:shadow-2xl focus:-translate-y-1 text-gray-800"
            placeholder="キーワードを入力してイラストを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 button-gradient border-none rounded-full px-7 py-3 text-white cursor-pointer font-semibold transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/40"
          >
            🔍
          </button>
        </div>

        <div className="flex justify-center gap-4 flex-wrap animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`px-7 py-3 border-2 border-white/20 rounded-full cursor-pointer font-semibold transition-all duration-300 backdrop-blur-xl ${
                currentCategory === category.id
                  ? 'bg-white/95 text-indigo-600 -translate-y-1 shadow-lg border-white/40'
                  : 'bg-white/15 text-white hover:bg-white/95 hover:text-indigo-600 hover:-translate-y-1 hover:shadow-lg hover:border-white/40'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
