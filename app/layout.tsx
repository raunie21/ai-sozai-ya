import type { Metadata } from 'next';
import './globals.css';
import GoogleAnalytics from './components/GoogleAnalytics';
import Script from 'next/script';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

export const metadata: Metadata = {
  title: {
    default: 'AIそざいや | AI素材 - 無料ai素材データダウンロードサイト  ',
    template: '%s | AI素材 - AIそざいや'
  },
  description: 'AI素材の背景透過済み無料データダウンロードサイト。商用利用OK・クレジット表記不要の高品質で生成されたAI素材を無料でダウンロード。AI素材、フリー素材、無料イラスト素材を配布中。',
  keywords: ['AI素材', 'AI 素材', 'AI イラスト', 'AI生成', '無料イラスト', 'フリー素材', 'イラスト素材', '商用利用', 'ダウンロード', 'クレジット不要', '人物イラスト', '子供イラスト', 'AIアート', 'AI画像'],
  authors: [{ name: 'AIそざいや' }],
  creator: 'AIそざいや',
  publisher: 'AIそざいや',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'AI素材 - 無料イラスト配布サイト | AIそざいや',
    description: 'AI素材の無料イラスト配布サイト。商用利用OK・クレジット表記不要の高品質AI生成イラストを無料でダウンロード。AI素材、フリー素材を45点以上配布中。',
    type: 'website',
    url: 'https://www.ai-sozaiya.com/',
    siteName: 'AIそざいや',
    locale: 'ja_JP',
    images: [
      {
        url: 'https://img.ai-sozaiya.com/cdn-cgi/image/width=1200,height=630,fit=cover/og/default-og.png',
        width: 1200,
        height: 630,
        alt: 'AIそざいや - AI 素材 | 無料ai素材データダウンロードサイト',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI素材 - 無料イラスト配布サイト | AIそざいや',
    description: 'AI素材の無料イラスト配布サイト。商用利用OK・クレジット表記不要の高品質AI生成イラストを無料でダウンロード。',
    images: ['https://img.ai-sozaiya.com/cdn-cgi/image/width=1200,height=630,fit=cover/og/default-og.png'],
    creator: '@ai_sozaiya',
  },
  alternates: {
    canonical: 'https://www.ai-sozaiya.com/',
  },
  category: 'design',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="color-scheme" content="light" />
        <link rel="canonical" href="https://www.ai-sozaiya.com/" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://img.ai-sozaiya.com" />
        <link rel="dns-prefetch" href="https://img.ai-sozaiya.com" />
        <link rel="preconnect" href="https://www.googletagservices.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6554623340823430"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        {/* AdSense サイト所有権確認用メタタグ */}
        <meta name="google-adsense-account" content="ca-pub-6554623340823430" />
        {/* WebSite + SearchAction */}
        <Script id="ld-website" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'AIそざいや',
            url: 'https://www.ai-sozaiya.com/',
            potentialAction: {
              '@type': 'SearchAction',
              target: 'https://www.ai-sozaiya.com/?q={search_term_string}',
              'query-input': 'required name=search_term_string'
            }
          })}
        </Script>
        {/* Organization */}
        <Script id="ld-org" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'AIそざいや',
            alternateName: 'AIそざいや 無料で使える透過済みAI素材',
            url: 'https://www.ai-sozaiya.com/',
            logo: 'https://www.ai-sozaiya.com/favicon.svg',
            sameAs: [
              'https://twitter.com/ai_sozaiya'
            ],
            contactPoint: [{
              '@type': 'ContactPoint',
              email: 'aisozaiya@ai-sozai.com',
              contactType: 'customer support',
              availableLanguage: ['Japanese']
            }]
          })}
        </Script>
      </head>
      <body className="antialiased">
        <ScrollToTop />
        <GoogleAnalytics />
        {children}
        <Footer />
      </body>
    </html>
  );
}
