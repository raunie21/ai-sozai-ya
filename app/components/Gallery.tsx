'use client';

import React from 'react';
import { Illustration, Category } from '../types/illustration';
import IllustrationCard from './IllustrationCard';
import RankingItem from './RankingItem';
import InFeedAd from './InFeedAd';
import AdCard from './AdCard';
import { ADS_CONFIG } from '../config/ads';

interface GalleryProps {
  illustrations: Illustration[];
  currentCategory: Category;
  searchQuery: string;
  onIllustrationClick: (illustration: Illustration) => void;
  onTagClick?: (tag: string) => void;
}

export default function Gallery({ illustrations, currentCategory, searchQuery, onIllustrationClick, onTagClick }: GalleryProps) {
  const getTitle = () => {
    if (currentCategory === 'ranking') {
      return `人気ランキング TOP ${illustrations.length}`;
    } else if (currentCategory === 'all') {
      return '人気のイラスト';
    } else {
      const categoryNames = {
        people: '人物イラスト',
        kids: 'キッズイラスト',
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
        <div className="max-w-4xl mx-auto px-4 md:px-6 xl:px-8">
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
        <div className="px-4 md:px-6 xl:px-8 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {(() => {
            const items: React.ReactNode[] = [];
            // 10カードに1回広告（0始まりindexで9, 19, 29...の直後に差し込む）
            const shouldInsertAdAfter = (index: number) => (index + 1) % 10 === 0;
            const adSlots = [
              ADS_CONFIG.AD_SLOTS.CARD_AD_1,
              ADS_CONFIG.AD_SLOTS.CARD_AD_2,
              ADS_CONFIG.AD_SLOTS.CARD_AD_3,
              ADS_CONFIG.AD_SLOTS.CARD_AD_4
            ];
            
            illustrations.forEach((illustration, index) => {
              // イラストカードを追加
              items.push(
                <div key={illustration.id}>
                  <IllustrationCard
                    illustration={illustration}
                    onClick={() => onIllustrationClick(illustration)}
                    onTagClick={onTagClick}
                  />
                </div>
              );
              
              // 10件ごとに広告カードを挿入（用意済みの4枠を循環使用）
              if (shouldInsertAdAfter(index)) {
                const cycle = Math.floor(index / 10) % adSlots.length;
                items.push(
                  <AdCard
                    key={`ad-${index}`}
                    adSlot={adSlots[cycle]}
                    position={`gallery-${index + 1}`}
                    index={index}
                  />
                );
              }
            });
            
            return items;
          })()}
        </div>
      )}
    </div>
  );
}
