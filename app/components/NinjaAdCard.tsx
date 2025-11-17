'use client';

import { useEffect, useRef, useState, CSSProperties } from 'react';

interface NinjaAdCardProps {
  src: string; // shinobi script src
  className?: string;
  label?: string;
}

export default function NinjaAdCard({ src, className = '', label = 'スポンサーリンク' }: NinjaAdCardProps) {
  const slotRef = useRef<HTMLDivElement | null>(null);       // 外枠（スケーリング基準）
  const containerRef = useRef<HTMLDivElement | null>(null);  // 実際にタグを挿入する内枠（300x250想定）
  const mountedRef = useRef(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    if (!containerRef.current) return;
    // 既存の子要素をクリアして iframe 内で同期実行
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
      doc.write(`<html><head><base target="_top"></head><body style="margin:0;padding:0;"></body></html>`);
      const s = doc.createElement('script') as HTMLScriptElement;
      s.src = src;
      // @ts-ignore
      s.async = false;
      doc.body.appendChild(s);
      const finalize = () => { try { doc.close(); } catch {} };
      s.onload = finalize;
      s.onerror = finalize;
    }
  }, [src]);

  // リサイズに応じて、枠幅が300px未満のときだけ縮小スケールを適用
  useEffect(() => {
    if (!slotRef.current) return;
    const el = slotRef.current;

    const compute = () => {
      const w = el.clientWidth || 0;
      const s = Math.min(1, Math.max(0, w / 300)); // 基準幅300、拡大はしない
      setScale(s || 1);
    };

    // 初回計算
    compute();

    let ro: ResizeObserver | undefined;
    if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
      // ResizeObserver が使える環境
      // @ts-ignore - TS の型ガード簡略化
      ro = new window.ResizeObserver(() => {
        compute();
      });
      ro.observe(el);
      return () => {
        ro && ro.disconnect();
      };
    } else {
      // フォールバック: window.resize
      if (typeof window !== 'undefined') {
        const onResize = () => compute();
        window.addEventListener('resize', onResize);
        return () => {
          window.removeEventListener('resize', onResize);
        };
      }
      return;
    }
  }, []);

  const innerStyle: CSSProperties = {
    width: 300,
    height: 250,
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
  };
  const outerStyle: CSSProperties = {
    height: 250 * scale, // スケールに応じて外枠の高さを調整してレイアウト崩れを防ぐ
  };

  return (
    <div className={`bg-white/90 border border-white/20 rounded-2xl p-3 md:p-4 shadow-lg mb-3 md:mb-5 ${className}`}>
      <div
        ref={slotRef}
        className="w-full overflow-hidden rounded-md flex justify-center items-start"
        style={outerStyle}
      >
        {/* 300x250 の生キャンバスにタグを描画し、外枠に対してスケーリング */}
        <div ref={containerRef} style={innerStyle} />
      </div>
      <div className="mt-2 text-[11px] text-gray-500 text-center">{label}</div>
    </div>
  );
}


