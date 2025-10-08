'use client';

import { Illustration } from '../types/illustration';

interface StructuredDataProps {
  illustrations?: Illustration[];
  currentIllustration?: Illustration;
  type?: 'website' | 'illustration' | 'gallery';
}

export default function StructuredData({ illustrations, currentIllustration, type = 'website' }: StructuredDataProps) {
  const generateWebsiteSchema = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AI素材 - AIそざいや",
    "description": "AI素材・フリー素材を無料配布！商用利用OK・クレジット表記不要の高品質AI生成イラストをダウンロード",
    "keywords": "AI素材,AI 素材,AI イラスト,フリー素材,無料イラスト,商用利用,AI生成",
    "url": "https://www.ai-sozaiya.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.ai-sozaiya.com/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AIそざいや",
      "url": "https://www.ai-sozaiya.com",
      "logo": {
        "@type": "ImageObject",
        "url": "https://img.ai-sozaiya.com/logo/ai-sozaiya-logo.png"
      }
    }
  });

  const generateOrganizationSchema = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AI素材 - AIそざいや",
    "url": "https://www.ai-sozaiya.com",
    "logo": "https://img.ai-sozaiya.com/logo/ai-sozaiya-logo.png",
    "description": "AI素材・フリー素材を無料配布！商用利用OK・クレジット表記不要の高品質AI生成イラストをダウンロード",
    "keywords": "AI素材,AI 素材,AI イラスト,フリー素材,無料イラスト,商用利用,AI生成",
    "sameAs": [
      "https://twitter.com/ai_sozaiya"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "url": "https://www.ai-sozaiya.com/request"
    }
  });

  const generateIllustrationSchema = (illustration: Illustration) => ({
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "name": illustration.title,
    "description": `${illustration.title}のイラストです。商用利用OK、クレジット表記不要で無料ダウンロード可能。`,
    "url": illustration.imageUrl || illustration.thumbnailUrl,
    "thumbnailUrl": illustration.thumbnailUrl,
    "contentUrl": illustration.originalUrl || illustration.imageUrl,
    "encodingFormat": "image/png",
    "license": "https://creativecommons.org/publicdomain/zero/1.0/",
    "acquireLicensePage": "https://www.ai-sozaiya.com/terms",
    "creditText": "AIそざいや",
    "creator": {
      "@type": "Organization",
      "name": "AIそざいや"
    },
    "keywords": illustration.tags?.join(', ') || '',
    "category": illustration.category,
    "downloadUrl": illustration.originalUrl || illustration.imageUrl,
    "usageInfo": "商用利用OK、クレジット表記不要",
    "copyrightNotice": "AIそざいや - 商用利用OK"
  });

  const generateGallerySchema = (illustrations: Illustration[]) => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "AIそざいや - 無料イラストギャラリー（AI 素材）",
    "description": "商用利用OK！クレジット表記不要の高品質AI 素材イラストを無料でダウンロード",
    "url": "https://www.ai-sozaiya.com",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": illustrations.slice(0, 24).map((ill, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": ill.originalUrl || ill.imageUrl,
        "name": ill.title
      }))
    }
  });

  const generateBreadcrumbSchema = () => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "ホーム",
        "item": "https://www.ai-sozaiya.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "無料イラスト",
        "item": "https://www.ai-sozaiya.com"
      }
    ]
  });

  const generateFAQSchema = () => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "商用利用は可能ですか？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "はい、すべてのイラストは商用利用可能です。クレジット表記も不要です。"
        }
      },
      {
        "@type": "Question",
        "name": "クレジット表記は必要ですか？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "いいえ、クレジット表記は不要です。自由にご利用いただけます。"
        }
      },
      {
        "@type": "Question",
        "name": "ダウンロードは無料ですか？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "はい、すべてのイラストを無料でダウンロードできます。"
        }
      }
    ]
  });

  let schemas: any[] = [];

  // 基本スキーマは常に含める
  schemas.push(generateWebsiteSchema());
  schemas.push(generateOrganizationSchema());
  schemas.push(generateBreadcrumbSchema());
  schemas.push(generateFAQSchema());

  // タイプ別のスキーマを追加
  if (type === 'illustration' && currentIllustration) {
    schemas.push(generateIllustrationSchema(currentIllustration));
  } else if (type === 'gallery' && illustrations && illustrations.length > 0) {
    schemas.push(generateGallerySchema(illustrations));
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema, null, 2)
          }}
        />
      ))}
    </>
  );
}
