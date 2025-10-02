'use client';

import { useEffect } from 'react';
import { ADS_CONFIG, canShowAds } from '../config/ads';

interface AdCardProps {
  adSlot: string;
  className?: string;
  position?: string;
  index?: number; // グリッド内での位置
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function AdCard({ adSlot, className = '', position = 'unknown', index = 0 }: AdCardProps) {
  useEffect(() => {
    if (!canShowAds()) return;
    
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  // 開発環境では広告の代わりにプレースホルダーを表示
  if (!canShowAds()) {
    return (
      <div className={`w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl md:rounded-2xl flex items-center justify-center text-4xl md:text-6xl mb-3 md:mb-5 relative overflow-hidden border border-gray-200/80 shimmer-effect ${className}`}>
        <div className="text-center p-4">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-lg font-bold">広</span>
          </div>
          <p className="text-gray-600 text-sm font-medium">広告</p>
          <p className="text-xs text-gray-500 mt-1">Sponsored</p>
        </div>
        {/* シャイマーエフェクト */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className={`w-full aspect-square rounded-xl md:rounded-2xl overflow-hidden mb-3 md:mb-5 relative bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/80 ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ 
          display: 'block',
          width: '100%',
          height: '100%',
          minHeight: '200px' // 最小高さを設定
        }}
        data-ad-client={ADS_CONFIG.PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
