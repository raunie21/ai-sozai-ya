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

  // Cloudflare Image Resizing を使った srcset 生成（幅 320/480/600/900）
  const buildSrcSet = (url: string): string | undefined => {
    if (!url || url.indexOf('/cdn-cgi/image/') === -1) return undefined;
    // width パラメータを置換
    const replaceWidth = (u: string, w: number) =>
      u.replace(/(cdn-cgi\/image\/)([^/]+)/, (_m, p1) => `${p1}width=${w},height=${w},fit=cover,gravity=center`);
    const candidates = [
      { w: 320 }, { w: 480 }, { w: 600 }, { w: 900 }
    ];
    return candidates.map(c => `${replaceWidth(url, c.w)} ${c.w}w`).join(', ');
  };

  const srcSet = buildSrcSet(src);

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
      decoding="async"
      srcSet={srcSet}
    />
  );
}
