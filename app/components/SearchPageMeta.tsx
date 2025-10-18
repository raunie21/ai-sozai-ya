'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function SearchPageMeta() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  useEffect(() => {
    // 既存のcanonicalタグを削除
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // 既存のrobotsメタタグを削除
    const existingRobots = document.querySelector('meta[name="robots"]');
    if (existingRobots) {
      existingRobots.remove();
    }

    if (query && query.trim()) {
      // 検索ページの場合：noindexを設定し、canonicalをホームページに
      const robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      robotsMeta.content = 'noindex, follow';
      document.head.appendChild(robotsMeta);

      const canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = 'https://www.ai-sozaiya.com/';
      document.head.appendChild(canonicalLink);

      // ページタイトルを動的に更新
      document.title = `「${query}」の検索結果 | AI素材や - 無料AIイラスト配布サイト`;
      
      // descriptionを動的に更新
      let existingDescription = document.querySelector('meta[name="description"]');
      if (existingDescription) {
        existingDescription.setAttribute('content', 
          `「${query}」に関するAI素材・無料イラストの検索結果。商用利用OK・クレジット表記不要の高品質AI生成イラストを無料でダウンロード。`
        );
      }
    } else {
      // 通常のホームページの場合：indexを許可
      const robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      robotsMeta.content = 'index, follow';
      document.head.appendChild(robotsMeta);

      const canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = 'https://www.ai-sozaiya.com/';
      document.head.appendChild(canonicalLink);
    }
  }, [query]);

  return null;
}
