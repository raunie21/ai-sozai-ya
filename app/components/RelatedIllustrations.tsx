'use client';

import { useState, useMemo } from 'react';
import { Illustration } from '../types/illustration';
import IllustrationCard from './IllustrationCard';

interface RelatedIllustrationsProps {
  currentIllustration: Illustration;
  allIllustrations: Illustration[];
  onIllustrationClick: (illustration: Illustration) => void;
  maxItems?: number;
}

export default function RelatedIllustrations({ 
  currentIllustration, 
  allIllustrations, 
  onIllustrationClick,
  maxItems = 8 
}: RelatedIllustrationsProps) {
  
  const [showAll, setShowAll] = useState(false);

  const relatedIllustrations = useMemo(() => {
    // 現在のイラストを除外し、必要なプロパティが存在するもののみをフィルタ
    const otherIllustrations = allIllustrations.filter(ill => 
      ill.id !== currentIllustration.id && 
      ill.id && 
      ill.category
    );
    
    // 関連度スコアを計算
    const scoredIllustrations = otherIllustrations.map(illustration => {
      let score = 0;
      
      // 1. 同じカテゴリ（高スコア）
      if (illustration.category === currentIllustration.category) {
        score += 10;
      }
      
      // 2. 共通タグの数（中スコア）
      const currentTags = currentIllustration.tags || [];
      const illustrationTags = illustration.tags || [];
      const commonTags = currentTags.filter(tag => illustrationTags.includes(tag));
      score += commonTags.length * 3;
      
      // 3. タイトルの類似性（低スコア）
      if (currentIllustration.title && illustration.title) {
        const currentWords = currentIllustration.title.toLowerCase().split(/\s+/);
        const illustrationWords = illustration.title.toLowerCase().split(/\s+/);
        const commonWords = currentWords.filter(word => 
          illustrationWords.some(w => w.includes(word) || word.includes(w))
        );
        score += commonWords.length * 1;
      }
      
      // 4. 人気度ボーナス（ダウンロード数）
      const downloads = illustration.downloads || 0;
      score += Math.log(downloads + 1) * 0.5;
      
      return { illustration, score };
    });
    
    // スコア順にソートして上位を取得
    return scoredIllustrations
      .sort((a, b) => b.score - a.score)
      .map(item => item.illustration);
  }, [currentIllustration, allIllustrations]);

  const displayedIllustrations = showAll ? relatedIllustrations.slice(0, 16) : relatedIllustrations.slice(0, maxItems);

  if (relatedIllustrations.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
          <span className="text-2xl mr-2">🔗</span>
          関連するイラスト
        </h2>
        
        {relatedIllustrations.length > maxItems && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 text-sm md:text-base"
          >
            {showAll ? '表示を減らす' : `すべて見る (${relatedIllustrations.length}件)`}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {displayedIllustrations.map((illustration) => (
          <IllustrationCard
            key={illustration.id}
            illustration={illustration}
            onClick={() => onIllustrationClick(illustration)}
          />
        ))}
      </div>

      {displayedIllustrations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>関連するイラストが見つかりませんでした。</p>
        </div>
      )}
    </section>
  );
}
