// サイト全体のカラー設定
// このファイルを編集するだけで、サイト全体のカラーが変更できます

export const siteColors = {
  // メインカラー（基調色）
  primary: {
    main: '#ffffff',        // メイン背景色（純白）
    light: '#f8f9fa',       // ライトグレー（背景用）
    dark: '#f1f3f4',        // ダークグレー（セクション背景）
    muted: '#e8eaed',       // ミュートグレー（ボーダー用）
  },
  
  // テキストカラー
  text: {
    primary: '#202124',     // メインテキスト（ダークグレー）
    secondary: '#5f6368',   // セカンダリテキスト（ミディアムグレー）
    muted: '#9aa0a6',       // ミュートテキスト（ライトグレー）
    white: '#ffffff',       // 白テキスト
  },
  
  // アクセントカラー（カテゴリアイコン用）
  accent: {
    primary: '#1a73e8',     // プライマリブルー
    secondary: '#34a853',   // セカンダリグリーン
    tertiary: '#ea4335',    // テルシャリレッド
    warning: '#fbbc04',     // ワーニングイエロー
    info: '#9c27b0',        // インフォパープル
  },
  
  // グラデーション
  gradients: {
    // メイン背景グラデーション
    main: null, // 単色の場合はnull
    
    // テキストグラデーション
    text: {
      from: '#202124',
      via: '#5f6368', 
      to: '#9aa0a6'
    },
    
    // ボタングラデーション
    button: {
      from: '#1a73e8',
      to: '#1557b0'
    },
    
    // 利用規約ページ背景
    terms: {
      from: '#f8f9fa',
      via: '#ffffff',
      to: '#f1f3f4'
    },
    
    // CTAボタン
    cta: {
      from: '#1a73e8',
      via: '#1557b0',
      to: '#1a73e8'
    },
    
    // 統計カード
    stats: {
      from: '#f8f9fa',
      via: '#ffffff',
      to: '#f1f3f4'
    }
  },
  
  // 装飾効果
  effects: {
    // シマー効果
    shimmer: 'rgba(26, 115, 232, 0.1)',
    
    // 装飾グラデーション
    decorative: null,
    
    // ガラスモーフィズム
    glass: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: 'rgba(232, 234, 237, 0.3)',
      backdrop: 'backdrop-blur-md'
    },
    
    // シャドウ
    shadow: {
      small: '0 1px 3px rgba(0, 0, 0, 0.1)',
      medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
      large: '0 10px 25px rgba(0, 0, 0, 0.1)'
    }
  }
};

// カラーユーティリティ関数
export const getColorClasses = {
  // メイン背景
  mainBackground: () => siteColors.gradients.main 
    ? `bg-gradient-to-br ${siteColors.gradients.main}`
    : `bg-[${siteColors.primary.main}]`,
  
  // テキストグラデーション
  textGradient: () => `bg-gradient-to-r from-[${siteColors.gradients.text.from}] via-[${siteColors.gradients.text.via}] to-[${siteColors.gradients.text.to}]`,
  
  // ボタングラデーション
  buttonGradient: () => `bg-gradient-to-r from-[${siteColors.gradients.button.from}] to-[${siteColors.gradients.button.to}]`,
  
  // 利用規約背景
  termsBackground: () => `bg-gradient-to-br from-[${siteColors.gradients.terms.from}] via-[${siteColors.gradients.terms.via}] to-[${siteColors.gradients.terms.to}]`,
  
  // CTAボタン
  ctaGradient: () => `bg-gradient-to-r from-[${siteColors.gradients.cta.from}] via-[${siteColors.gradients.cta.via}] to-[${siteColors.gradients.cta.to}]`,
  
  // 統計カード
  statsGradient: () => `bg-gradient-to-br from-[${siteColors.gradients.stats.from}] via-[${siteColors.gradients.stats.via}] to-[${siteColors.gradients.stats.to}]`
};
