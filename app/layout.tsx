import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'AIそざいや - 無料イラスト配布サイト',
    template: '%s | AIそざいや'
  },
  description: '商用利用OK！クレジット表記不要の高品質イラストを無料でダウンロード。45点以上の無料イラスト素材を配布中。',
  keywords: ['無料イラスト', '商用利用', 'AI', 'イラスト素材', 'ダウンロード', 'クレジット不要', 'フリー素材', '人物イラスト', '子供イラスト'],
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
    title: 'AIそざいや - 無料イラスト配布サイト',
    description: '商用利用OK！クレジット表記不要の高品質イラストを無料でダウンロード。45点以上の無料イラスト素材を配布中。',
    type: 'website',
    url: 'https://www.ai-sozaiya.com/',
    siteName: 'AIそざいや',
    locale: 'ja_JP',
    images: [
      {
        url: 'https://img.ai-sozaiya.com/cdn-cgi/image/width=1200,height=630,fit=cover/og/default-og.png',
        width: 1200,
        height: 630,
        alt: 'AIそざいや - 無料イラスト配布サイト',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIそざいや - 無料イラスト配布サイト',
    description: '商用利用OK！クレジット表記不要の高品質イラストを無料でダウンロード。45点以上の無料イラスト素材を配布中。',
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
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://img.ai-sozaiya.com" />
        <link rel="dns-prefetch" href="https://img.ai-sozaiya.com" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
