'use client';

import { useEffect } from 'react';
import { ADS_CONFIG, canShowAds } from '../config/ads';

interface HorizontalAdProps {
  adSlot: string;
  className?: string;
  position?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function HorizontalAd({ adSlot, className = '', position = 'unknown' }: HorizontalAdProps) {
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
      <div className={`w-full flex justify-center my-8 ${className}`}>
        <div className="bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-dashed border-blue-400 rounded-lg p-8 text-center w-full max-w-4xl min-h-[90px] md:min-h-[120px] lg:min-h-[180px]">
          <div className="flex items-center justify-center gap-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">広</span>
            </div>
            <div className="text-left">
              <p className="text-blue-600 text-sm font-medium">横長広告エリア (開発環境)</p>
              <p className="text-xs text-blue-500 mt-1">AdSlot: {adSlot} | Position: {position}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex justify-center my-8 ${className}`} style={{ minHeight: '90px' }}>
      <ins
        className="adsbygoogle"
        style={{ 
          display: 'block',
          width: '100%',
          maxWidth: '1200px',
          height: 'auto',
          minHeight: '90px'
        }}
        data-ad-client={ADS_CONFIG.PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
