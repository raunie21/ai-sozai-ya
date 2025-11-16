'use client';

import { useEffect, useRef } from 'react';

interface NinjaAdCardProps {
  src: string; // shinobi script src
  className?: string;
  label?: string;
}

export default function NinjaAdCard({ src, className = '', label = 'スポンサーリンク' }: NinjaAdCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    if (!containerRef.current) return;
    // 既存の子要素をクリアしてからスクリプトを挿入
    containerRef.current.innerHTML = '';
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    containerRef.current.appendChild(script);
  }, [src]);

  return (
    <div className={`bg-white/90 border border-white/20 rounded-2xl p-3 md:p-4 shadow-lg mb-3 md:mb-5 aspect-square flex items-center justify-center ${className}`}>
      <div className="text-[11px] text-gray-500 mb-2">{label}</div>
      {/* 忍者AdMaxは300x250がベース想定。カード内中央に配置しつつ、幅が足りない端末では最大幅にフィット */}
      <div className="w-full h-full flex items-center justify-center">
        <div ref={containerRef} className="w-[300px] h-[250px] max-w-full" />
      </div>
    </div>
  );
}


