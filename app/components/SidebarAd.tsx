'use client';

import { useEffect } from 'react';

interface SidebarAdProps {
  adSlot: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function SidebarAd({ adSlot, className = '' }: SidebarAdProps) {
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
    <div className={`sticky top-24 ${className}`}>
      <div className="text-xs text-gray-500 mb-2 text-center">スポンサーリンク</div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '300px', height: '600px' }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXXX"
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="false"
      ></ins>
    </div>
  );
}
