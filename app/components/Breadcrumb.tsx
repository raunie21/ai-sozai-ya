'use client';

import { ChevronRightIcon, HomeIcon } from 'lucide-react';
import { Category, Illustration } from '../types/illustration';

interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
}

interface BreadcrumbProps {
  currentCategory?: Category;
  searchQuery?: string;
  currentIllustration?: Illustration;
  onCategoryChange?: (category: Category) => void;
  onSearchClear?: () => void;
}

export default function Breadcrumb({ 
  currentCategory = 'all', 
  searchQuery, 
  currentIllustration,
  onCategoryChange,
  onSearchClear
}: BreadcrumbProps) {
  
  const categoryNames = {
    'all': 'すべて',
    'ranking': '人気ランキング',
    'people': '人物',
    'animals': '動物',
    'business': 'ビジネス',
    'food': '食べ物',
    'nature': '自然',
    'icons': 'アイコン',
    'kids': '子供'
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: 'ホーム',
        onClick: () => {
          onCategoryChange?.('all');
          onSearchClear?.();
        }
      }
    ];

    // 検索結果の場合
    if (searchQuery) {
      breadcrumbs.push({
        label: `「${searchQuery}」の検索結果`,
        isActive: true
      });
      return breadcrumbs;
    }

    // 個別イラストの場合
    if (currentIllustration) {
      // カテゴリを追加
      if (currentIllustration.category !== 'all') {
        breadcrumbs.push({
          label: categoryNames[currentIllustration.category as Category] || currentIllustration.category,
          onClick: () => onCategoryChange?.(currentIllustration.category as Category)
        });
      }
      
      // イラスト名を追加
      breadcrumbs.push({
        label: currentIllustration.title,
        isActive: true
      });
      
      return breadcrumbs;
    }

    // カテゴリページの場合
    if (currentCategory !== 'all') {
      breadcrumbs.push({
        label: categoryNames[currentCategory],
        isActive: true
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // ホームのみの場合は表示しない
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav 
      className="flex items-center space-x-2 text-sm text-gray-600 mb-6 px-4 py-2 bg-gray-50/50 rounded-lg border border-gray-200/50"
      aria-label="パンくずナビゲーション"
    >
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
          )}
          
          {index === 0 && (
            <HomeIcon className="w-4 h-4 text-gray-500 mr-1" />
          )}
          
          {item.isActive ? (
            <span className="font-medium text-gray-800 line-clamp-1">
              {item.label}
            </span>
          ) : (
            <button
              onClick={item.onClick}
              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200 line-clamp-1"
              type="button"
            >
              {item.label}
            </button>
          )}
        </div>
      ))}
    </nav>
  );
}




