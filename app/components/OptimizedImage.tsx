'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  fallbackEmoji?: string;
  className?: string;
  priority?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fallbackEmoji,
  className = '',
  priority = false
}: OptimizedImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError && fallbackEmoji) {
    return (
      <div className={`flex items-center justify-center text-6xl ${className}`}>
        <span>{fallbackEmoji}</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && fallbackEmoji && (
        <div className="absolute inset-0 flex items-center justify-center text-4xl bg-gray-100 animate-pulse">
          <span>{fallbackEmoji}</span>
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-cover transition-opacity duration-300"
        style={{ opacity: isLoading ? 0 : 1 }}
        onError={() => setHasError(true)}
        onLoad={() => setIsLoading(false)}
        priority={priority}
        quality={85}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
