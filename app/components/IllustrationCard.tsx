'use client';

import { Illustration } from '../types/illustration';

interface IllustrationCardProps {
  illustration: Illustration;
  onClick: () => void;
}

export default function IllustrationCard({ illustration, onClick }: IllustrationCardProps) {
  const formatDownloads = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
  };

  return (
    <div 
      className="bg-white/90 backdrop-blur-sm border border-white/20 rounded-3xl p-5 shadow-lg shadow-black/8 transition-all duration-400 cursor-pointer relative overflow-hidden group hover:-translate-y-3 hover:scale-105 hover:shadow-2xl hover:shadow-black/15 hover:border-indigo-500/20"
      onClick={onClick}
    >
      {/* Hover gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl" />
      
      <div className="w-full h-56 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center text-6xl mb-5 relative overflow-hidden border border-gray-200/80 shimmer-effect">
        {illustration.imageUrl ? (
          <img 
            src={illustration.thumbnailUrl || illustration.imageUrl} 
            alt={illustration.title}
            className="w-full h-full object-cover rounded-2xl"
            onError={(e) => {
              // フォールバック: 画像が読み込めない場合は絵文字を表示
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling!.style.display = 'flex';
            }}
          />
        ) : null}
        <span 
          className="absolute inset-0 flex items-center justify-center text-6xl"
          style={{ display: illustration.imageUrl ? 'none' : 'flex' }}
        >
          {illustration.emoji}
        </span>
      </div>
      
      <div className="text-center relative">
        <div className="absolute -top-2 right-3 button-gradient text-white rounded-xl px-3 py-1 text-sm font-semibold shadow-lg shadow-indigo-500/30 border-2 border-white/90">
          {formatDownloads(illustration.downloads)}
        </div>
        
        <div className="font-bold text-lg mb-2 text-gray-800 tracking-tight">
          {illustration.title}
        </div>
        
        <div className="text-gray-600 text-sm mb-4">
          {illustration.tags.join(', ')}
        </div>
        
        <button 
          className="button-gradient text-white border-none px-8 py-3 rounded-full cursor-pointer font-semibold text-sm transition-all duration-300 shadow-lg shadow-indigo-500/30 relative overflow-hidden group/btn hover:-translate-y-1 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <span className="relative z-10">ダウンロード</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500" />
        </button>
      </div>
    </div>
  );
}
