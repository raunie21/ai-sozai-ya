'use client';

import { useCallback } from 'react';
import { ANALYTICS_CONFIG, isAnalyticsEnabled } from '../config/analytics';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Eコマースイベント用の型定義
interface EcommerceItem {
  item_id: string;
  item_name: string;
  category: string;
  quantity: number;
  price: number;
}

interface PurchaseEvent {
  transaction_id: string;
  value: number;
  currency: string;
  items: EcommerceItem[];
}

export const useEcommerce = () => {
  // 広告収益の追跡（仮想的な購入として記録）
  const trackAdRevenue = useCallback((adSlot: string, revenue: number, currency: string = 'JPY') => {
    if (!isAnalyticsEnabled() || typeof window === 'undefined' || !window.gtag) {
      if (ANALYTICS_CONFIG.SETTINGS.DEBUG_MODE) {
        console.log('Ecommerce Event (Debug):', { adSlot, revenue, currency });
      }
      return;
    }

    // 広告収益を仮想的な購入として追跡
    window.gtag('event', 'purchase', {
      transaction_id: `ad_${adSlot}_${Date.now()}`,
      value: revenue,
      currency: currency,
      items: [{
        item_id: adSlot,
        item_name: `Ad Revenue - ${adSlot}`,
        category: 'advertising',
        quantity: 1,
        price: revenue
      }]
    });
  }, []);

  // ダウンロードを仮想的な購入として追跡（無料だが価値のあるアクション）
  const trackDownloadAsConversion = useCallback((illustrationId: number, illustrationTitle: string, estimatedValue: number = 100) => {
    if (!isAnalyticsEnabled() || typeof window === 'undefined' || !window.gtag) {
      if (ANALYTICS_CONFIG.SETTINGS.DEBUG_MODE) {
        console.log('Download Conversion (Debug):', { illustrationId, illustrationTitle, estimatedValue });
      }
      return;
    }

    // ダウンロードを価値のあるコンバージョンとして追跡
    window.gtag('event', 'purchase', {
      transaction_id: `download_${illustrationId}_${Date.now()}`,
      value: estimatedValue,
      currency: 'JPY',
      items: [{
        item_id: illustrationId.toString(),
        item_name: illustrationTitle,
        category: 'digital_download',
        quantity: 1,
        price: estimatedValue
      }]
    });
  }, []);

  // カスタムコンバージョンイベント
  const trackCustomConversion = useCallback((eventName: string, value: number, currency: string = 'JPY') => {
    if (!isAnalyticsEnabled() || typeof window === 'undefined' || !window.gtag) {
      if (ANALYTICS_CONFIG.SETTINGS.DEBUG_MODE) {
        console.log('Custom Conversion (Debug):', { eventName, value, currency });
      }
      return;
    }

    window.gtag('event', 'conversion', {
      send_to: ANALYTICS_CONFIG.GA_MEASUREMENT_ID,
      value: value,
      currency: currency,
      event_category: 'custom_conversion',
      event_label: eventName
    });
  }, []);

  return {
    trackAdRevenue,
    trackDownloadAsConversion,
    trackCustomConversion
  };
};
