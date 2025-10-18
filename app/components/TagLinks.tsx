'use client';

import { useState } from 'react';
import { TagIcon } from 'lucide-react';

interface TagLinksProps {
  tags: string[];
  onTagClick: (tag: string) => void;
  maxVisible?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'pill';
}

export default function TagLinks({ 
  tags, 
  onTagClick, 
  maxVisible = 5,
  size = 'md',
  variant = 'default'
}: TagLinksProps) {
  
  const [showAll, setShowAll] = useState(false);

  if (!tags || tags.length === 0) {
    return null;
  }

  const displayedTags = showAll ? tags : tags.slice(0, maxVisible);
  const hasMoreTags = tags.length > maxVisible;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
      default:
        return 'text-sm px-3 py-1.5';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200';
      case 'pill':
        return 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-full';
      default:
        return 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300 hover:border-gray-400 shadow-sm hover:shadow-md';
    }
  };

  const baseClasses = `inline-flex items-center gap-1 rounded-lg font-medium transition-all duration-200 cursor-pointer ${getSizeClasses()} ${getVariantClasses()}`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {variant === 'default' && (
        <div className="flex items-center text-gray-500 mr-1">
          <TagIcon className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">タグ:</span>
        </div>
      )}
      
      {displayedTags.map((tag, index) => (
        <button
          key={index}
          onClick={() => onTagClick(tag)}
          className={baseClasses}
          type="button"
          title={`「${tag}」で検索`}
        >
          {variant === 'pill' && <TagIcon className="w-3 h-3" />}
          <span>{tag}</span>
        </button>
      ))}
      
      {hasMoreTags && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className={`${baseClasses} bg-gray-100 text-gray-500 hover:bg-gray-200 border-dashed`}
          type="button"
        >
          +{tags.length - maxVisible}個のタグ
        </button>
      )}
      
      {showAll && hasMoreTags && (
        <button
          onClick={() => setShowAll(false)}
          className={`${baseClasses} bg-gray-100 text-gray-500 hover:bg-gray-200`}
          type="button"
        >
          表示を減らす
        </button>
      )}
    </div>
  );
}




