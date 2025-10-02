'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { ANALYTICS_CONFIG, isAnalyticsEnabled, getGAScriptUrl } from '../config/analytics';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export default function GoogleAnalytics() {
  useEffect(() => {
    if (!isAnalyticsEnabled()) return;

    // gtag関数の初期化
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: any[]) {
      window.dataLayer.push(args);
    };

    // 初期設定
    window.gtag('js', new Date());
    window.gtag('config', ANALYTICS_CONFIG.GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href,
      ...ANALYTICS_CONFIG.SETTINGS.COOKIE_FLAGS
    });

    // デバッグモードの設定
    if (ANALYTICS_CONFIG.SETTINGS.DEBUG_MODE) {
      window.gtag('config', ANALYTICS_CONFIG.GA_MEASUREMENT_ID, {
        debug_mode: true
      });
    }
  }, []);

  // 開発環境では何も表示しない
  if (!isAnalyticsEnabled()) {
    return null;
  }

  return (
    <>
      {/* Google Analytics スクリプト */}
      <Script
        src={getGAScriptUrl()}
        strategy="afterInteractive"
      />
    </>
  );
}
