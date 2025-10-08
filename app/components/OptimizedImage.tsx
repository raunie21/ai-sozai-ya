'use client';

import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  title?: string;
  onError?: () => void;
}

export default function OptimizedImage({ src, alt = '', className = '', width = 800, height = 800, priority = false, sizes, title, onError }: OptimizedImageProps) {
  const fallbackAlt = 'AI 素材 無料イラスト';
  const baseAlt = alt && alt.trim().length > 0 ? alt.trim() : fallbackAlt;
  const hasAiSozai = /(AI素材|AI 素材)/.test(baseAlt);
  const safeAlt = hasAiSozai ? baseAlt : `${baseAlt} - AI 素材`;

  return (
    <Image
      src={src}
      alt={safeAlt}
      className={className}
      width={width}
      height={height}
      priority={priority}
      sizes={sizes}
      title={title}
      onError={onError}
    />
  );
}
