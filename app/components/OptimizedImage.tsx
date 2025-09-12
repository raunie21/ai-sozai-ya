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
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState(getImageUrl(src, { width, height, format, quality }));
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
      className={className}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      onError={handleError}
      onLoad={handleLoad}
      style={{
        opacity: hasError ? 0.5 : 1,
        transition: 'opacity 0.3s ease',
      }}
    />
  );
}
