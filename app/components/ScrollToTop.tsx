'use client';

import { useEffect } from 'react';

export default function ScrollToTop() {
  useEffect(() => {
    // スクロール復元を無効化
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // ページロード時に最上部へ
    window.scrollTo(0, 0);
  }, []);

  return null;
}

