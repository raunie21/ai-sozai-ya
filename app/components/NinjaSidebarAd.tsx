'use client';

import { useEffect, useRef, useState } from 'react';

interface NinjaSidebarAdProps {
  src: string;
  className?: string;
  label?: string;
}

export default function NinjaSidebarAd({ src, className = '', label = 'スポンサーリンク' }: NinjaSidebarAdProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    if (!containerRef.current) return;

    // iframe 内で同期的に script を実行して document.write を許可
    containerRef.current.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('scrolling', 'no');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    containerRef.current.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <html><head><base target="_top"></head>
        <body style="margin:0;padding:0;">
          <script src="${src}"><\/script>
        </body></html>
      `);
      doc.close();
    }

    const timeoutId = window.setTimeout(() => {
      try {
        const body = iframe.contentDocument?.body;
        const empty = !body || body.childNodes.length === 0;
        if (empty) setCollapsed(true);
      } catch {
        /* noop */
      }
    }, 2500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [src]);

  if (collapsed) return null;

  return (
    <div className={className}>
      <div className="text-[11px] text-gray-500 mb-2">{label}</div>
      {/* サイドバー幅に合わせ、縦長（例: 300x600）を想定して高さ固定 */}
      <div className="w-full h-[600px] overflow-hidden border border-gray-200/60 rounded-md bg-white flex items-center justify-center">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}


