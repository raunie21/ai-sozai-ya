'use client';

import Head from 'next/head';
import { Illustration, Category } from '../types/illustration';

interface DynamicMetaProps {
  illustrations?: Illustration[];
  currentCategory?: Category;
  searchQuery?: string;
  currentIllustration?: Illustration;
  pageType?: 'home' | 'category' | 'search' | 'illustration' | 'terms' | 'request';
}

export default function DynamicMeta({ 
  illustrations = [], 
  currentCategory = 'all', 
  searchQuery = '', 
  currentIllustration,
  pageType = 'home' 
}: DynamicMetaProps) {
  
  const baseUrl = 'https://www.ai-sozaiya.com';
  const defaultTitle = 'AIそざいや - 無料イラスト配布サイト';
  const defaultDescription = '商用利用OK！クレジット表記不要の高品質イラストを無料でダウンロード';
  
  const generateMetaData = () => {
    let title = defaultTitle;
    let description = defaultDescription;
    let keywords = ['無料イラスト', '商用利用', 'AI', 'イラスト素材', 'ダウンロード', 'クレジット不要'];
    let canonicalUrl = baseUrl;
    let ogImage = 'https://img.ai-sozaiya.com/cdn-cgi/image/width=1200,height=630,fit=cover/og/default-og.png';

    // ページタイプ別のメタデータ生成
    switch (pageType) {
      case 'category':
        const categoryNames = {
          'all': 'すべて',
          'ranking': '人気ランキング',
          'people': '人物',
          'animals': '動物',
          'business': 'ビジネス',
          'food': '食べ物',
          'nature': '自然',
          'icons': 'アイコン',
          'kids': '子供'
        };
        const categoryName = categoryNames[currentCategory] || 'すべて';
        title = `${categoryName}のイラスト一覧 | AIそざいや`;
        description = `${categoryName}カテゴリの無料イラスト一覧。商用利用OK、クレジット表記不要で高品質なイラストを無料ダウンロード。`;
        keywords.push(categoryName, `${categoryName} イラスト`, `${categoryName} 素材`);
        canonicalUrl = `${baseUrl}?category=${currentCategory}`;
        break;

      case 'search':
        if (searchQuery) {
          title = `「${searchQuery}」の検索結果 | AIそざいや`;
          description = `「${searchQuery}」に関する無料イラストの検索結果。商用利用OK、クレジット表記不要で高品質なイラストを無料ダウンロード。`;
          keywords.push(searchQuery, `${searchQuery} イラスト`, `${searchQuery} 素材`);
          canonicalUrl = `${baseUrl}?search=${encodeURIComponent(searchQuery)}`;
        }
        break;

      case 'illustration':
        if (currentIllustration) {
          title = `${currentIllustration.title} | AIそざいや`;
          description = `${currentIllustration.title}の無料イラスト。商用利用OK、クレジット表記不要で高品質なイラストを無料ダウンロード。`;
          keywords.push(currentIllustration.title, ...(currentIllustration.tags || []));
          canonicalUrl = `${baseUrl}/illustration/${currentIllustration.id}`;
          ogImage = currentIllustration.thumbnailUrl || currentIllustration.imageUrl || ogImage;
        }
        break;

      case 'terms':
        title = '利用規約 | AIそざいや';
        description = 'AIそざいやの利用規約。商用利用OK、クレジット表記不要の無料イラスト配布サイトの利用条件について。';
        keywords.push('利用規約', '商用利用', 'ライセンス');
        canonicalUrl = `${baseUrl}/terms`;
        break;

      case 'request':
        title = 'お問い合わせ・リクエスト | AIそざいや';
        description = 'AIそざいやへのお問い合わせやイラストリクエストはこちらから。無料イラスト配布サイトへのご要望をお聞かせください。';
        keywords.push('お問い合わせ', 'リクエスト', '要望');
        canonicalUrl = `${baseUrl}/request`;
        break;

      default:
        // ホームページの場合、統計情報を含める
        if (illustrations.length > 0) {
          description = `${illustrations.length}点以上の無料イラストを配布中！商用利用OK、クレジット表記不要で高品質なイラストを無料ダウンロード。`;
        }
        break;
    }

    return { title, description, keywords, canonicalUrl, ogImage };
  };

  const metaData = generateMetaData();

  return (
    <Head>
      <title>{metaData.title}</title>
      <meta name="description" content={metaData.description} />
      <meta name="keywords" content={metaData.keywords.join(', ')} />
      <link rel="canonical" href={metaData.canonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={metaData.title} />
      <meta property="og:description" content={metaData.description} />
      <meta property="og:url" content={metaData.canonicalUrl} />
      <meta property="og:image" content={metaData.ogImage} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="AIそざいや" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={metaData.title} />
      <meta name="twitter:description" content={metaData.description} />
      <meta name="twitter:image" content={metaData.ogImage} />
      
      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="author" content="AIそざいや" />
      <meta name="publisher" content="AIそざいや" />
      
      {/* Language and region */}
      <meta name="language" content="ja" />
      <meta name="geo.region" content="JP" />
      <meta name="geo.country" content="JP" />
      
      {/* Mobile optimization */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      
      {/* Preconnect for performance */}
      <link rel="preconnect" href="https://img.ai-sozaiya.com" />
      <link rel="dns-prefetch" href="https://img.ai-sozaiya.com" />
    </Head>
  );
}




