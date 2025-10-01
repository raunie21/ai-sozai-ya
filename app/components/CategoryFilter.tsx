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
      
      // スライドショーの高さを考慮した位置調整
      const slideshowElement = document.querySelector('[data-slideshow]') as HTMLElement;
      const slideshowHeight = slideshowElement ? slideshowElement.offsetHeight : 0;
      
      // スライドショーが表示されている場合の調整
      if (currentScrollY < slideshowHeight + headerHeight) {
        // スライドショーが見えている間はヘッダー下に配置
        setTopPosition(headerHeight);
      } else {
        // スライドショーを過ぎたら画面最上部に固定
        setTopPosition(0);
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
    { id: 'kids' as Category, label: 'キッズ', icon: '👶' },
    { id: 'animals' as Category, label: '動物', icon: '🐱' },
    { id: 'business' as Category, label: 'ビジネス', icon: '💼' },
    { id: 'food' as Category, label: '食べ物', icon: '🍎' },
    { id: 'nature' as Category, label: '自然', icon: '🌿' },
    { id: 'icons' as Category, label: 'アイコン', icon: '⭐' },
  ];

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
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 md:px-2.5 lg:px-3 xl:px-4 py-1 sm:py-1.5 md:py-2 rounded-full border transition-all duration-200 whitespace-nowrap flex-shrink text-xs sm:text-sm lg:text-base ${
                currentCategory === category.id
                  ? 'bg-gray-800 text-white border-gray-800 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <span className="text-xs sm:text-sm md:text-base lg:text-lg">{category.icon}</span>
              <span className={`font-medium text-xs sm:text-sm lg:text-base ${
                category.id === 'all' || category.id === 'ranking' 
                  ? 'inline' 
                  : 'hidden sm:inline'
              }`}>{category.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
