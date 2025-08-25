'use client';

import { Illustration } from '../types/illustration';

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
      <div className={`text-3xl font-bold ${getRankClass(rank)} mr-4 min-w-[50px] text-center`}>
        {rank}
      </div>
      
      <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center text-3xl mr-4 border border-gray-200">
        <span>{illustration.emoji}</span>
      </div>
      
      <div className="flex-1">
        <div className="text-lg font-bold text-gray-800 mb-2">
          {illustration.title}
        </div>
        <div className="text-indigo-600 text-lg font-medium flex items-center">
          <span className="mr-2">📥</span>
          {illustration.downloads.toLocaleString()} ダウンロード
          <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm ml-2">
            {formatDownloads(illustration.downloads)}
          </span>
        </div>
      </div>
    </div>
  );
}
