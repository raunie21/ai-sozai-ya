'use client';

import { useEffect, useRef } from 'react';

interface NinjaBannerProps {
  src: string; // shinobi script src
  className?: string;
  label?: string;
}

export default function NinjaBanner({ src, className = '', label = 'スポンサーリンク' }: NinjaBannerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    containerRef.current.appendChild(script);
  }, [src]);

  return (
    <div className={`w-full flex items-center justify-center ${className}`}>
      <div className="w-full max-w-[728px]">
        <div className="text-[11px] text-gray-500 mb-1"> {label} </div>
        {/* 高さを確保してCLSを防止。SPでは高さ60、MD以上は90を目安 */}
        <div className="w-full min-h-[60px] md:min-h-[90px] flex items-center justify-center border border-gray-200/60 rounded-md bg-white">
          <div ref={containerRef} className="w-full flex items-center justify-center" />
        </div>
      </div>
    </div>
  );
}


