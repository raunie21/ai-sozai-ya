'use client';

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
  fetchPriority?: 'high' | 'low' | 'auto';
}

export default function OptimizedImage({ src, alt = '', className = '', width = 800, height = 800, priority = false, sizes, title, onError, fetchPriority }: OptimizedImageProps) {
  const fallbackAlt = 'AI 素材 無料イラスト';
  const baseAlt = alt && alt.trim().length > 0 ? alt.trim() : fallbackAlt;
  const hasAiSozai = /(AI素材|AI 素材)/.test(baseAlt);
  const safeAlt = hasAiSozai ? baseAlt : `${baseAlt} - AI 素材`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={safeAlt}
      className={className}
      width={width}
      height={height}
      title={title}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={fetchPriority}
      onError={onError}
      sizes={sizes}
    />
  );
}
