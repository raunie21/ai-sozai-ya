// Google Analytics 4設定
export const ANALYTICS_CONFIG = {
  // Google Analytics測定ID（実際の値に置き換えてください）
  GA_MEASUREMENT_ID: 'G-XXXXXXXXXX',
  
  // 設定
  SETTINGS: {
    // 開発環境では分析を無効にする
    ENABLED: process.env.NODE_ENV === 'production',
    
    // デバッグモード
    DEBUG_MODE: process.env.NODE_ENV === 'development',
    
    // Cookie設定
    COOKIE_FLAGS: {
      anonymize_ip: true,
      cookie_expires: 63072000, // 2年
      cookie_update: true,
      cookie_flags: 'SameSite=None;Secure'
    }
  }
};

// Analyticsが有効かどうかを判定
export const isAnalyticsEnabled = (): boolean => {
  return ANALYTICS_CONFIG.SETTINGS.ENABLED && typeof window !== 'undefined';
};

// Google Analytics スクリプトURL生成
export const getGAScriptUrl = (): string => {
  return `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.GA_MEASUREMENT_ID}`;
};

// カスタムイベントの型定義
export interface GAEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
}

// よく使用されるイベント定義
export const GA_EVENTS = {
  // ダウンロード関連
  DOWNLOAD_START: {
    action: 'download_start',
    category: 'engagement'
  },
  DOWNLOAD_COMPLETE: {
    action: 'download_complete',
    category: 'engagement'
  },
  
  // 検索関連
  SEARCH: {
    action: 'search',
    category: 'engagement'
  },
  
  // カテゴリ関連
  CATEGORY_CHANGE: {
    action: 'category_change',
    category: 'navigation'
  },
  
  // モーダル関連
  MODAL_OPEN: {
    action: 'modal_open',
    category: 'engagement'
  },
  
  // 広告関連
  AD_CLICK: {
    action: 'ad_click',
    category: 'monetization'
  }
};
