'use client';

import { useState } from 'react';
import { getImageUrl, getImageFallbackUrls } from '../utils/imageUrl';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  onError?: () => void;
  format?: 'auto' | 'webp' | 'png' | 'jpg' | 'avif';
  quality?: 'auto' | number;
  title?: string;
  sizes?: string;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  onError,
  format = 'auto',
  quality = 'auto',
  title,
  sizes,
}: OptimizedImageProps) {
  // src が既に /cdn-cgi/image を含む完全URLならそのまま使い、
  // そうでなければ getImageUrl でR2用URLを生成
  const initialSrc = src.includes('/cdn-cgi/image/') ? src : getImageUrl(src, { width, height, format, quality });
  const [currentSrc, setCurrentSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(false);
  const fallbackUrls = getImageFallbackUrls(src);

  const handleError = () => {
    if (hasError) return; // 既にエラーが発生している場合は何もしない
    
    setHasError(true);
    
    // フォールバックURLを試す
    const currentIndex = fallbackUrls.indexOf(currentSrc);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < fallbackUrls.length) {
      setCurrentSrc(fallbackUrls[nextIndex]);
    } else {
      // すべてのフォールバックが失敗した場合
      console.warn(`All image sources failed for: ${src}`);
      onError?.();
    }
  };

  const handleLoad = () => {
    setHasError(false);
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      title={title || alt}
      className={className}
      width={width}
      height={height}
      sizes={sizes}
      loading={priority ? 'eager' : 'lazy'}
      onError={handleError}
      onLoad={handleLoad}
      style={{
        opacity: hasError ? 0.5 : 1,
        transition: 'opacity 0.3s ease',
      }}
      // SEO最適化のための追加属性
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
}
