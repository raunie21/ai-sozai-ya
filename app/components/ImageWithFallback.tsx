'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageWithFallbackProps {
  src?: string;
  fallbackEmoji: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

export default function ImageWithFallback({
  src,
  fallbackEmoji,
  alt,
  width = 300,
  height = 300,
  className = ''
}: ImageWithFallbackProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 画像URLがない場合は絵文字を表示
  if (!src || hasError) {
    return (
      <div className={`flex items-center justify-center text-6xl ${className}`}>
        <span>{fallbackEmoji}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gray-100 animate-pulse">
          <span>{fallbackEmoji}</span>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-cover"
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
        priority={false}
      />
    </div>
  );
}
