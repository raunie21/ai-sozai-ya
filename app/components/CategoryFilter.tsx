'use client';

import { useState, useEffect } from 'react';
import { Category } from '../types/illustration';

interface CategoryFilterProps {
  currentCategory: Category;
  onCategoryChange: (category: Category) => void;
}

export default function CategoryFilter({ currentCategory, onCategoryChange }: CategoryFilterProps) {
  const [scrollY, setScrollY] = useState(0);
  const [topPosition, setTopPosition] = useState(64); // 初期位置: top-16 = 64px

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      // ヘッダーの高さ（固定）
      const headerHeight = 64;
      
      // メインコンテンツエリアの開始位置を動的に取得
      const mainElement = document.querySelector('main');
      if (mainElement) {
        const mainElementTop = mainElement.offsetTop;
        const titleSectionHeight = 150; // Stats + セクションタイトル部分の高さ
        const galleryStartPosition = mainElementTop + titleSectionHeight;
        
        // 大きくスクロールした場合（ヘッダーが見えなくなる程度）
        if (currentScrollY > headerHeight) {
          // 画面最上部に配置（隙間を埋める）
          setTopPosition(0);
        } else {
          // 通常時はヘッダー下に配置
          setTopPosition(headerHeight);
        }
      }
    };

    // 初期実行
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);
  const categories = [
    { id: 'all' as Category, label: 'すべて', icon: '🎨' },
    { id: 'ranking' as Category, label: '人気ランキング', icon: '🔥' },
    { id: 'people' as Category, label: '人物', icon: '👤' },
    { id: 'daily' as Category, label: '日常', icon: '🏠' },
    { id: 'animals' as Category, label: '動物', icon: '🐱' },
    { id: 'business' as Category, label: 'ビジネス', icon: '💼' },
    { id: 'food' as Category, label: '食べ物', icon: '🍎' },
    { id: 'nature' as Category, label: '自然', icon: '🌿' }
  ];

  // カテゴリーごとのカラースキーム（自然:#6e9e7f を基準）
  const getColors = (id: Category) => {
    const map: Record<string, { base: string; active: string }> = {
      all: { base: '#7a8899', active: '#6a7a8b' },
      ranking: { base: '#ad5f5f', active: '#9c5454' },
      people: { base: '#6a86b3', active: '#5875a3' },
      daily: { base: '#b49f7f', active: '#9f8b6f' },
      animals: { base: '#d7c975', active: '#c5b465' },
      business: { base: '#679eae', active: '#5b8f9d' },
      food: { base: '#d39a64', active: '#c0854e' },
      nature: { base: '#6e9e7f', active: '#5f8a73' },
    };
    return map[id] || { base: '#7a8899', active: '#6a7a8b' };
  };

  return (
    <section 
      className="fixed left-0 right-0 z-30 bg-white backdrop-blur-md border-b border-gray-200 shadow-sm transition-all duration-500 ease-in-out"
      style={{ 
        top: `${topPosition}px`,
        transform: `translateY(0)`
      }}
    >
      <div className="max-w-7xl mx-auto py-2.5 md:py-3">
        <div 
          className="flex items-center justify-center gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 px-1 sm:px-2 md:px-4 scrollbar-hide"
          style={{ 
            scrollBehavior: 'smooth',
            overflowX: 'auto',
            // モバイルでも中央寄せのスクロール開始位置
            scrollSnapType: 'x mandatory'
          }}
        >
          {categories.map((category) => {
            const c = getColors(category.id);
            const isActive = currentCategory === category.id;
            const bg = isActive ? c.active : c.base;
            const style: React.CSSProperties = {
              backgroundColor: bg,
              color: '#ffffff',
              borderColor: 'transparent',
              boxShadow: isActive
                ? 'inset 0 3px 10px rgba(0,0,0,0.28), inset 0 -2px 2px rgba(255,255,255,0.18)'
                : undefined
            };
            return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 md:px-2.5 lg:px-3 xl:px-4 py-1 sm:py-1.5 md:py-2 rounded-full border transition-all duration-200 whitespace-nowrap flex-shrink text-xs sm:text-sm lg:text-base ${isActive ? '' : 'hover:shadow-sm'}`}
              style={style}
            >
              <span className="text-xs sm:text-sm md:text-base lg:text-lg">{category.icon}</span>
              <span className={`font-medium text-xs sm:text-sm lg:text-base ${
                category.id === 'all' || category.id === 'ranking' 
                  ? 'inline' 
                  : 'hidden sm:inline'
              }`}>{category.label}</span>
            </button>
          );})}
        </div>
      </div>
    </section>
  );
}
