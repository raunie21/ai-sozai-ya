// Google AdSense設定
export const ADS_CONFIG = {
  // Google AdSenseのパブリッシャーID
  PUBLISHER_ID: 'ca-pub-6554623340823430',
  
  // 広告スロットID
  AD_SLOTS: {
    HEADER_BANNER: '8783196628',      // ヘッダー下バナー（横長）
    CONTENT_BANNER: '8783196628',     // コンテンツ下バナー（横長）
    INFEED_1: '8783196628',           // インフィード広告1（横長）
    INFEED_2: '8783196628',           // インフィード広告2（横長）
    SIDEBAR: '8783196628',            // サイドバー広告（横長）
    FOOTER_BANNER: '8783196628',      // フッター上バナー（横長）
    MODAL_BANNER: '8783196628',       // モーダル内バナー（横長）
    
    // IllustrationCard形式の広告（実際のスロットID）
    CARD_AD_1: '9430063889',          // カード広告1（6枚目）
    CARD_AD_2: '8277776072',          // カード広告2（12枚目）
    CARD_AD_3: '1712367720',          // カード広告3（18枚目）
    CARD_AD_4: '9399286050',          // カード広告4（24枚目）
  },
  
  // 広告表示設定
  SETTINGS: {
    // 開発環境では広告を表示しない
    SHOW_ADS: process.env.NODE_ENV === 'production',
    
    // 広告の表示間隔（イラスト何枚おきに表示するか）
    INFEED_INTERVAL: 8,
    
    // レスポンシブ広告を有効にするか
    RESPONSIVE_ADS: true,
  }
};

// 広告が表示可能かどうかを判定
export const canShowAds = (): boolean => {
  return ADS_CONFIG.SETTINGS.SHOW_ADS && typeof window !== 'undefined';
};

// AdSenseスクリプトのURL生成
export const getAdSenseScriptUrl = (): string => {
  return `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.PUBLISHER_ID}`;
};
