'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Illustration, Category } from '@/app/types/illustration';
import { fetchIllustrations } from '@/app/utils/illustrations';
import Gallery from '@/app/components/Gallery';
import Breadcrumb from '@/app/components/Breadcrumb';
import Sidebar from '@/app/components/Sidebar';

export default function CategoryLandingPage() {
  const params = useParams();
  const router = useRouter();
  const category = String(params?.category) as Category;
  const [all, setAll] = useState<Illustration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await fetchIllustrations();
      setAll(data);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    if (!Array.isArray(all)) return [];
    if (!category) return all;
    return all.filter(i => i.category === category);
  }, [all, category]);

  const titleMap: Record<Category, string> = {
    all: 'すべて',
    ranking: '人気ランキング',
    people: '人物',
    daily: '日常',
    animals: '動物',
    business: 'ビジネス',
    food: '食べ物',
    nature: '自然',
    icons: 'アイコン'
  };

  // タグ一覧（簡易生成）とタグフィルタ（フックは早期returnの前に定義）
  const allTags = useMemo(() => {
    const set = new Set<string>();
    filtered.forEach(i => (i.tags || []).forEach(t => set.add(t)));
    return Array.from(set).sort().slice(0, 30);
  }, [filtered]);

  const [activeTags, setActiveTags] = useState<string[]>([]);
  const refined = useMemo(() => {
    if (activeTags.length === 0) return filtered;
    const s = new Set(activeTags.map(t => t.toLowerCase()));
    return filtered.filter(i => Array.isArray(i.tags) && i.tags.some(t => s.has(String(t).toLowerCase())));
  }, [filtered, activeTags]);

  if (loading) {
    return <main className="bg-white py-16"><div className="max-w-7xl mx-auto px-4">読み込み中...</div></main>;
  }

  const handleCardClick = (ill: Illustration) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/illustrations/${ill.id}`;
    }
  };

  return (
    <main className="bg-white py-16">
      <div className="xl:max-w-none xl:pl-4 xl:pr-0 max-w-7xl mx-auto px-4">
        {/* パディング強化済みの上部コンテンツ */}
        <div className="px-4 md:px-6 xl:px-8">
          <div id="breadcrumb">
          <Breadcrumb
            currentCategory={category}
            searchQuery={''}
            onCategoryChange={(c) => router.push(`/categories/${c}#breadcrumb`)}
            onSearchClear={() => router.push('/')}
          />
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{titleMap[category] || 'イラスト'}</h1>
            <p className="text-gray-700">{titleMap[category]}のAI 素材（無料・商用利用OK）。背景透過ですぐ使える高品質イラストを厳選。用途例や検索のコツは「<a href="/ai-sozai/how-to" className="text-blue-600 hover:underline">AI素材 使い方</a>」も参照してください。</p>
          </div>

          {/* タグでさらに絞り込む */}
          {allTags.length > 0 && (
            <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-white">
              <div className="text-sm font-semibold text-gray-800 mb-2">タグで絞り込む</div>
              <div className="flex flex-wrap gap-3">
                {allTags.map(tag => {
                  const checked = activeTags.includes(tag);
                  return (
                    <label key={tag} className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={checked}
                        onChange={(e) => {
                          setActiveTags(prev => e.target.checked ? [...prev, tag] : prev.filter(t => t !== tag));
                        }}
                      />
                      <span>{tag}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ギャラリーとサイドバーをホームと同様の並列配置に */}
        <div className="flex xl:gap-6 gap-0 justify-between">
          <div className="flex-1 min-w-0 xl:pr-0 pr-0 flex justify-center">
            <div className="w-full xl:max-w-6xl">
            <Gallery
              illustrations={refined}
              currentCategory={category}
              searchQuery={''}
              onIllustrationClick={(ill) => handleCardClick(ill)}
            />
            </div>
          </div>
          <Sidebar className="hidden xl:block w-64 flex-shrink-0 sticky top-24 max-h-[calc(100vh-96px)] overflow-y-auto" />
        </div>
      </div>

      {/* 右下にホームへ戻るボタン */}
      <a
        href="/"
        className="fixed left-4 bottom-4 z-40 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
        aria-label="ホームに戻る"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6"/></svg>
        ホームへ
      </a>
    </main>
  );
}


