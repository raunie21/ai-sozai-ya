'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Illustration } from '@/app/types/illustration';
import { fetchIllustration, fetchIllustrations } from '@/app/utils/illustrations';
import OptimizedImage from '@/app/components/OptimizedImage';
import TagLinks from '@/app/components/TagLinks';

export default function IllustrationDetailPage() {
  const params = useParams();
  const id = Number(params?.id);
  const [data, setData] = useState<Illustration | null>(null);
  const [loading, setLoading] = useState(true);
  const [all, setAll] = useState<Illustration[]>([]);

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    (async () => {
      setLoading(true);
      const [ill, list] = await Promise.all([
        fetchIllustration(id),
        fetchIllustrations()
      ]);
      setData(ill);
      setAll(Array.isArray(list) ? list : []);
      setLoading(false);
    })();
  }, [id]);

  const jsonLd = useMemo(() => {
    if (!data) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'ImageObject',
      name: data.title,
      contentUrl: data.originalUrl || data.imageUrl || data.thumbnailUrl,
      thumbnailUrl: data.thumbnailUrl || data.imageUrl,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      keywords: Array.isArray(data.tags) ? data.tags.join(',') : undefined,
    };
  }, [data]);

  // 以降のフックは早期returnの前に定義して、フック呼び出し順序を安定させる
  const sameCategory = useMemo(() => {
    if (!data) return [] as Illustration[];
    return all
      .filter(i => i && i.category === data.category)
      .sort((a, b) => a.id - b.id);
  }, [all, data]);

  const indexInCat = useMemo(() => {
    if (!data) return -1;
    return sameCategory.findIndex(i => i.id === data.id);
  }, [sameCategory, data]);

  const prevItem = indexInCat > 0 ? sameCategory[indexInCat - 1] : null;
  const nextItem = indexInCat >= 0 && indexInCat < sameCategory.length - 1 ? sameCategory[indexInCat + 1] : null;

  const related = useMemo(() => {
    if (!data) return [] as Illustration[];
    const tags = new Set((data.tags || []).map(t => t.toLowerCase()));
    const pool = all.filter(i => i.id !== data.id);
    const scored = pool.map(i => {
      let score = 0;
      if (i.category === data.category) score += 2;
      if (Array.isArray(i.tags)) {
        for (const t of i.tags) if (tags.has(String(t).toLowerCase())) score += 1;
      }
      return { i, score };
    });
    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score || b.i.downloads - a.i.downloads)
      .slice(0, 8)
      .map(s => s.i);
  }, [all, data]);

  const breadcrumbs = useMemo(() => {
    if (!data) return null;
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://www.ai-sozaiya.com/' },
        { '@type': 'ListItem', position: 2, name: 'イラスト一覧', item: 'https://www.ai-sozaiya.com/' },
        { '@type': 'ListItem', position: 3, name: data.title, item: typeof window !== 'undefined' ? window.location.href : '' }
      ]
    };
  }, [data]);

  if (loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-gray-600">読み込み中...</p>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-12">
        <p className="text-gray-600">イラストが見つかりませんでした。</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      {breadcrumbs && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      )}

      <nav className="mb-4 text-sm text-gray-500">
        <a href="/" className="hover:underline">ホーム</a>
        <span className="mx-1">/</span>
        <a href="/" className="hover:underline">イラスト一覧</a>
        <span className="mx-1">/</span>
        <span className="text-gray-800">{data.title}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 mb-4">{data.title}</h1>
      <div className="text-sm text-gray-600 mb-4">カテゴリ: <a className="text-blue-600 hover:underline" href={`/categories/${data.category}`}>{data.category}</a></div>

      <div className="rounded-2xl overflow-hidden border bg-white">
        <OptimizedImage
          src={data.imageUrl || data.thumbnailUrl || data.originalUrl || ''}
          alt={data.title}
          width={1200}
          height={1200}
          className="w-full h-auto"
          title={data.title}
          fetchPriority="high"
        />
      </div>

      {Array.isArray(data.tags) && data.tags.length > 0 && (
        <div className="mt-6">
          <TagLinks tags={data.tags} maxVisible={20} variant="pill" size="md" />
        </div>
      )}

      {data.originalUrl && (
        <div className="mt-8">
          <a href={data.originalUrl} className="inline-flex items-center px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700">高解像度をダウンロード</a>
        </div>
      )}

      {(prevItem || nextItem) && (
        <div className="mt-10 flex justify-between gap-3">
          <a
            href={prevItem ? `/illustrations/${prevItem.id}` : '#'}
            className={`flex-1 min-w-0 inline-flex items-center justify-center px-4 py-2 rounded-lg border ${prevItem ? 'text-gray-700 hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
          >
            ← 前へ
          </a>
          <a
            href={nextItem ? `/illustrations/${nextItem.id}` : '#'}
            className={`flex-1 min-w-0 inline-flex items-center justify-center px-4 py-2 rounded-lg border ${nextItem ? 'text-gray-700 hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
          >
            次へ →
          </a>
        </div>
      )}

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">関連イラスト</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {related.map(r => (
              <a key={r.id} href={`/illustrations/${r.id}`} className="block group">
                <div className="aspect-square overflow-hidden rounded-lg border bg-white">
                  <OptimizedImage
                    src={r.thumbnailUrl || r.imageUrl || ''}
                    alt={r.title}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    title={r.title}
                  />
                </div>
                <div className="mt-2 text-xs text-gray-700 line-clamp-2">{r.title}</div>
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}


