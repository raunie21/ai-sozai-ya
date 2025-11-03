'use client';

import { Illustration } from '../types/illustration';
import OptimizedImage from './OptimizedImage';
import { getImageUrl } from '../utils/imageUrl';

interface RankingItemProps {
  illustration: Illustration;
  rank: number;
  onClick: () => void;
}

export default function RankingItem({ illustration, rank, onClick }: RankingItemProps) {
  const formatDownloads = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  };

  const getRankClass = (rank: number) => {
    if (rank === 1) return 'text-yellow-500'; // Gold
    if (rank === 2) return 'text-gray-400'; // Silver
    if (rank === 3) return 'text-orange-600'; // Bronze
    return 'text-indigo-600';
  };

  return (
    <div 
      className="flex items-center bg-white rounded-2xl p-4 mb-4 shadow-md shadow-black/5 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-black/10"
      onClick={onClick}
    >
      {/* デスクトップでは左の順位数字、モバイルはサムネ左上バッジ */}
      <div className={`hidden md:block text-3xl font-bold ${getRankClass(rank)} mr-4 min-w-[50px] text-center`}>
        {rank}
      </div>
      
      <div className="relative w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center text-3xl mr-4 border border-gray-200 overflow-hidden">
        {illustration.thumbnailUrl ? (
          <OptimizedImage
            src={getImageUrl(illustration.thumbnailUrl, { width: 200, height: 200 })}
            alt={illustration.title}
            className="w-full h-full object-cover"
            width={200}
            height={200}
          />
        ) : (
          <span className="text-3xl text-gray-400">📷</span>
        )}
        {/* モバイル用順位バッジ */}
        <div className={`md:hidden absolute top-1 left-1 px-2 py-0.5 rounded-full text-xs font-bold ${getRankClass(rank)} bg-white/90 backdrop-blur border border-gray-200`}>
          #{rank}
        </div>
      </div>
      
      <div className="flex-1">
        <div className="text-base sm:text-lg font-bold text-gray-800 mb-1.5 md:mb-2 leading-snug">
          {illustration.title}
        </div>
        <div className="text-indigo-600 text-sm md:text-lg font-medium flex items-center gap-1 md:gap-2 whitespace-nowrap">
          <svg 
            className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" 
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
          {/* モバイルは短く、デスクトップはフル表記 */}
          <span className="md:hidden">{formatDownloads(illustration.downloads)}</span>
          <span className="hidden md:inline">{illustration.downloads.toLocaleString()} ダウンロード</span>
          <span className="hidden md:inline bg-indigo-600 text-white px-3 py-1 rounded-full text-sm ml-2">
            {formatDownloads(illustration.downloads)}
          </span>
        </div>
      </div>
    </div>
  );
}
