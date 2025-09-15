import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AIそざいや - 無料イラスト配布サイト',
  description: '商用利用OK！クレジット表記不要の高品質イラストを無料でダウンロード',
  keywords: ['無料イラスト', '商用利用', 'AI', 'イラスト素材', 'ダウンロード'],
  openGraph: {
    title: 'AIそざいや - 無料イラスト配布サイト',
    description: '商用利用OK！クレジット表記不要の高品質イラストを無料でダウンロード',
    type: 'website',
    url: 'https://www.ai-sozaiya.com/',
    images: [
      {
        url: 'https://img.ai-sozaiya.com/cdn-cgi/image/width=1200,height=630,fit=cover/og/default-og.png',
        width: 1200,
        height: 630,
        alt: 'AIそざいや',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AIそざいや - 無料イラスト配布サイト',
    description: '商用利用OK！クレジット表記不要の高品質イラストを無料でダウンロード',
    images: ['https://img.ai-sozaiya.com/cdn-cgi/image/width=1200,height=630,fit=cover/og/default-og.png'],
  },
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
        <link rel="canonical" href="https://www.ai-sozaiya.com/" />
      </head>
      <body>{children}</body>
    </html>
  );
}
