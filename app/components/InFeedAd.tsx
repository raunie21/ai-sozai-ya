'use client';

import { useEffect } from 'react';

interface InFeedAdProps {
  adSlot: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function InFeedAd({ adSlot, className = '' }: InFeedAdProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('AdSense error:', error);
    }
  }, []);

  return (
    <div className={`w-full bg-gray-50 rounded-xl p-4 my-6 ${className}`}>
      <div className="text-xs text-gray-500 mb-2 text-center">スポンサーリンク</div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-format="fluid"
        data-ad-layout-key="-6t+ed+2i-1n-4w"
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX"
        data-ad-slot={adSlot}
      ></ins>
    </div>
  );
}
