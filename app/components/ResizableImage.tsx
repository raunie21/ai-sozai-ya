'use client';

/* eslint-disable @next/next/no-img-element */
import { getImageUrl } from '@/app/utils/imageUrl';
import { useState } from 'react';

interface ResizableImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  format?: 'auto' | 'webp' | 'png' | 'jpg' | 'avif';
  quality?: 'auto' | number;
  className?: string;
  loading?: 'lazy' | 'eager';
  onError?: () => void;
  fallback?: string;
}

export default function ResizableImage({
  src,
  alt,
  width,
  height,
  format = 'auto',
  quality = 'auto',
  className = '',
  loading = 'lazy',
  onError,
  fallback
}: ResizableImageProps) {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  // リサイズオプションを適用してURLを生成
  const getOptimizedUrl = () => {
    if (width || height) {
      return getImageUrl(src, { width, height, format, quality });
    }
    return getImageUrl(src);
  };

  const handleError = () => {
    if (!imageError && fallback) {
      setImageError(true);
      setCurrentSrc(fallback);
    } else if (onError) {
      onError();
    }
  };

  const optimizedUrl = getOptimizedUrl();

  return (
    <img
      src={imageError ? fallback : optimizedUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={loading}
      onError={handleError}
      style={{
        objectFit: 'cover',
        transition: 'opacity 0.3s ease',
      }}
    />
  );
}

// プリセットサイズのヘルパー関数
export const ImageSizes = {
  thumbnail: { width: 200, height: 200 },
  small: { width: 400, height: 400 },
  medium: { width: 600, height: 600 },
  large: { width: 800, height: 800 },
  xlarge: { width: 1200, height: 1200 },
} as const;

// よく使われる画像コンポーネント
export function ThumbnailImage(props: Omit<ResizableImageProps, 'width' | 'height'>) {
  return <ResizableImage {...props} {...ImageSizes.thumbnail} />;
}

export function SmallImage(props: Omit<ResizableImageProps, 'width' | 'height'>) {
  return <ResizableImage {...props} {...ImageSizes.small} />;
}

export function MediumImage(props: Omit<ResizableImageProps, 'width' | 'height'>) {
  return <ResizableImage {...props} {...ImageSizes.medium} />;
}

export function LargeImage(props: Omit<ResizableImageProps, 'width' | 'height'>) {
  return <ResizableImage {...props} {...ImageSizes.large} />;
}

