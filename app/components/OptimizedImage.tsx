'use client';

import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function OptimizedImage({ src, alt = '', className = '', width = 800, height = 800, priority = false }: OptimizedImageProps) {
  const safeAlt = alt && alt.trim().length > 0 ? alt : 'AI素材 無料イラスト';
  return (
    <Image
      src={src}
      alt={safeAlt}
      className={className}
      width={width}
      height={height}
      priority={priority}
    />
  );
}
