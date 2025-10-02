'use client';

import { useEffect, useCallback } from 'react';
import { ADS_CONFIG, canShowAds } from '../config/ads';
import { useAnalytics } from '../hooks/useAnalytics';

interface ResponsiveAdProps {
  adSlot: string;
  className?: string;
  position?: string; // 広告の位置を識別するため
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function ResponsiveAd({ adSlot, className = '', position = 'unknown' }: ResponsiveAdProps) {
  const { trackAdClick } = useAnalytics();

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

  const handleAdClick = useCallback(() => {
    trackAdClick(adSlot, position);
  }, [trackAdClick, adSlot, position]);

  // 開発環境では広告の代わりにプレースホルダーを表示
  if (!canShowAds()) {
    return (
      <div className={`w-full flex justify-center my-8 ${className}`}>
        <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg p-8 text-center">
          <p className="text-gray-600 text-sm">広告エリア (開発環境)</p>
          <p className="text-xs text-gray-500 mt-1">AdSlot: {adSlot}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full flex justify-center my-8 ${className}`} onClick={handleAdClick}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADS_CONFIG.PUBLISHER_ID}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
