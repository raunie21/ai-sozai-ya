'use client';

import { Illustration } from '../types/illustration';
import OptimizedImage from './OptimizedImage';
import TagLinks from './TagLinks';

interface IllustrationCardProps {
  illustration: Illustration;
  onClick: () => void;
  onTagClick?: (tag: string) => void;
}

export default function IllustrationCard({ illustration, onClick, onTagClick }: IllustrationCardProps) {
  const formatDownloads = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  };

  return (
    <div 
      className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-2xl md:rounded-3xl p-3 md:p-5 shadow-lg shadow-black/8 transition-all duration-400 cursor-pointer relative overflow-hidden group hover:-translate-y-1 md:hover:-translate-y-3 hover:scale-105 hover:shadow-2xl hover:shadow-black/15 hover:border-indigo-500/20"
      onClick={onClick}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
      
      <div className="w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl md:rounded-2xl flex items-center justify-center text-4xl md:text-6xl mb-3 md:mb-5 relative overflow-hidden border border-gray-200/80 shimmer-effect">
        {/* ダウンロード数表示 - 右上に配置 */}
        <div className="absolute top-2 md:top-3 right-2 md:right-3 bg-white/95 backdrop-blur-sm rounded-full px-2 md:px-3 py-1 md:py-1.5 shadow-lg border border-gray-200/50 flex items-center gap-1 md:gap-1.5 z-10">
          <svg className="w-3 h-3 md:w-4 md:h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span className="text-xs md:text-sm font-semibold text-gray-800">
            {formatDownloads(illustration.downloads)}
          </span>
        </div>
        
        {illustration.thumbnailUrl ? (
          <OptimizedImage
            src={illustration.thumbnailUrl}
            alt={`${illustration.title} - 無料イラスト素材`}
            title={`${illustration.title} - 商用利用OK、クレジット表記不要の無料イラスト`}
            className="w-full h-full object-cover rounded-xl md:rounded-2xl transition-opacity duration-300"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => {
              // 画像読み込みエラー時の処理
              console.warn(`Failed to load image: ${illustration.thumbnailUrl}`);
            }}
          />
        ) : (
          <span className="text-4xl md:text-6xl">
            📷
          </span>
        )}
      </div>
      
      <div className="text-center relative">
        <div className="font-bold text-sm md:text-lg mb-1 md:mb-2 text-gray-800 tracking-tight leading-tight">
          {illustration.title}
        </div>
        
        {onTagClick && illustration.tags && illustration.tags.length > 0 && (
          <div className="mb-2 md:mb-3">
            <TagLinks
              tags={illustration.tags}
              onTagClick={(tag) => {
                onTagClick(tag);
              }}
              maxVisible={2}
              size="sm"
              variant="compact"
            />
          </div>
        )}
        
        <button 
          className="button-gradient text-white border-none px-3 md:px-4 py-2 md:py-3 rounded-full cursor-pointer font-semibold text-sm md:text-base transition-all duration-300 shadow-lg shadow-indigo-500/30 relative overflow-hidden group/btn hover:-translate-y-1 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          title="ダウンロード"
        >
          <span className="relative z-10">
            <svg 
              className="w-4 h-4 md:w-5 md:h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2.5} 
                d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" 
              />
            </svg>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500" />
        </button>
      </div>
    </div>
  );
}
