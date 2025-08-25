'use client';

import { Illustration, Category } from '../types/illustration';
import IllustrationCard from './IllustrationCard';
import RankingItem from './RankingItem';

interface GalleryProps {
  illustrations: Illustration[];
  currentCategory: Category;
  searchQuery: string;
  onIllustrationClick: (illustration: Illustration) => void;
}

export default function Gallery({ illustrations, currentCategory, searchQuery, onIllustrationClick }: GalleryProps) {
  const getTitle = () => {
    if (currentCategory === 'ranking') {
      return `人気ランキング TOP ${illustrations.length}`;
    } else if (currentCategory === 'all') {
      return '人気のイラスト';
    } else {
      const categoryNames = {
        people: '人物イラスト',
        animals: '動物イラスト',
        business: 'ビジネスイラスト',
        food: '食べ物イラスト',
        nature: '自然イラスト',
        icons: 'アイコン素材'
      };
      return categoryNames[currentCategory as keyof typeof categoryNames] || 'イラスト一覧';
    }
  };

  if (illustrations.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-2xl font-bold text-gray-600 mb-2">
          イラストが見つかりません
        </h3>
        <p className="text-gray-500">
          {searchQuery ? 
            `「${searchQuery}」に該当するイラストがありません。別のキーワードで検索してみてください。` :
            'このカテゴリにはまだイラストがありません。'
          }
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-center mb-8 text-3xl font-bold text-gray-800">
        {getTitle()}
      </h2>
      
      {currentCategory === 'ranking' ? (
        <div className="max-w-4xl mx-auto">
          {illustrations.map((illustration, index) => (
            <RankingItem
              key={illustration.id}
              illustration={illustration}
              rank={index + 1}
              onClick={() => onIllustrationClick(illustration)}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {illustrations.map((illustration) => (
            <IllustrationCard
              key={illustration.id}
              illustration={illustration}
              onClick={() => onIllustrationClick(illustration)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
