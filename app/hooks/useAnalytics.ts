'use client';

import { useCallback } from 'react';
import { ANALYTICS_CONFIG, isAnalyticsEnabled, GAEvent } from '../config/analytics';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export const useAnalytics = () => {
  // カスタムイベントを送信
  const trackEvent = useCallback((event: GAEvent) => {
    if (!isAnalyticsEnabled() || typeof window === 'undefined' || !window.gtag) {
      if (ANALYTICS_CONFIG.SETTINGS.DEBUG_MODE) {
        console.log('Analytics Event (Debug):', event);
      }
      return;
    }

    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value
    });
  }, []);

  // ページビューを送信
  const trackPageView = useCallback((url: string, title?: string) => {
    if (!isAnalyticsEnabled() || typeof window === 'undefined' || !window.gtag) {
      if (ANALYTICS_CONFIG.SETTINGS.DEBUG_MODE) {
        console.log('Analytics PageView (Debug):', { url, title });
      }
      return;
    }

    window.gtag('config', ANALYTICS_CONFIG.GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title
    });
  }, []);

  // ダウンロードイベントを送信
  const trackDownload = useCallback((illustrationId: number, illustrationTitle: string) => {
    trackEvent({
      action: 'download_complete',
      category: 'engagement',
      label: `${illustrationTitle} (ID: ${illustrationId})`,
      value: 1
    });
  }, [trackEvent]);

  // 検索イベントを送信
  const trackSearch = useCallback((searchTerm: string, resultCount: number) => {
    trackEvent({
      action: 'search',
      category: 'engagement',
      label: searchTerm,
      value: resultCount
    });
  }, [trackEvent]);

  // カテゴリ変更イベントを送信
  const trackCategoryChange = useCallback((category: string) => {
    trackEvent({
      action: 'category_change',
      category: 'navigation',
      label: category
    });
  }, [trackEvent]);

  // モーダル開封イベントを送信
  const trackModalOpen = useCallback((illustrationId: number, illustrationTitle: string) => {
    trackEvent({
      action: 'modal_open',
      category: 'engagement',
      label: `${illustrationTitle} (ID: ${illustrationId})`
    });
  }, [trackEvent]);

  // 広告クリックイベントを送信
  const trackAdClick = useCallback((adSlot: string, adPosition: string) => {
    trackEvent({
      action: 'ad_click',
      category: 'monetization',
      label: `${adPosition} - ${adSlot}`
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackDownload,
    trackSearch,
    trackCategoryChange,
    trackModalOpen,
    trackAdClick
  };
};
