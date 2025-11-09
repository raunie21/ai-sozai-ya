'use client';

import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { Illustration } from '../types/illustration';
import { fetchIllustrations } from '../utils/illustrations';
import Gallery from '../components/Gallery';
import Breadcrumb from '../components/Breadcrumb';
import Footer from '../components/Footer';
import DynamicMeta from '../components/DynamicMeta';
import Modal from '../components/Modal';

export default function ChristmasPage() {
  const [allIllustrations, setAllIllustrations] = useState<Illustration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<Illustration | null>(null);
  const [selectedElements, setSelectedElements] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [justDownloaded, setJustDownloaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const list = await fetchIllustrations();
        setAllIllustrations(list);
      } catch (e) {
        console.error(e);
        setAllIllustrations([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // christmas 配下抽出
  const illustrations = useMemo(() => {
    const needle = '/images/originals/daily/christmas/';
    return (allIllustrations || []).filter((ill) => {
      const o = ill.originalUrl || '';
      const i = ill.imageUrl || '';
      return o.includes(needle) ||
        i.includes(needle) ||
        (ill.title?.includes('クリスマス') ?? false) ||
        (ill.tags || []).some(t => t.includes('クリスマス'));
    });
  }, [allIllustrations]);

  // 8要素フィルター
  const ELEMENTS = ['サンタ','動物','食べ物','植物','装飾','フレーム','建物','その他'] as const;
  type ElementKey = typeof ELEMENTS[number];

  const getFileName = (ill: Illustration): string => {
    const url = ill.originalUrl || ill.imageUrl || ill.thumbnailUrl || '';
    try {
      const pathname = new URL(url).pathname;
      const base = pathname.split('/').pop() || '';
      return base.toLowerCase();
    } catch {
      return (url.split('/').pop() || '').toLowerCase();
    }
  };

  const classify = (ill: Illustration): ElementKey => {
    const file = getFileName(ill).replace(/\.[^.]+$/, '');
    // サンタ
    if (file.startsWith('santaclaus')) return 'サンタ';
    // 動物
    if (/^(reindeer(-illustration)?\d+|penguin\d+)$/.test(file)) return '動物';
    // 食べ物
    if (/^(cake\d+|christmascake\d+|stollen\d+|hotchocolate1|wine\d+|christmascookie\d+|gingerbreadman(-illustration)?\d+|gingerbreadman1|candycane\d+|macarons1|roastedturkey\d+)$/.test(file)) return '食べ物';
    // 植物
    if (/^(hollybranch\d+|poinsettiaflower\d+|christmastree(-illustration)?\d+|chrismastree-illustration(3|4)|cranberries\d+)$/.test(file)) return '植物';
    // 装飾（mittens/angel/snowman も装飾）
    if (/^(wreath\d+|ribbon\d+|bell\d+|christmasstocking-illustration\d+|chrismasstocking\d+|christmasgoods(1|4)|christmasgood(2|3)|mittens1|angel1|snowman\d+)$/.test(file)) return '装飾';
    // フレーム
    if (/^borderframe/.test(file)) return 'フレーム';
    // 建物
    if (/^(christmasvillage\d+|fireplace\d+)$/.test(file)) return '建物';
    // その他（スノーフレーク/スター/チェック/文字/バッジ/矢印など）
    if (/^(snowflake\d+|stars\d+|checkpattern\d*|merrychristmastext1|happyholidays(1|2)|badge(-sale)?\d+|arrowpointing\d+)$/.test(file)) return 'その他';
    return 'その他';
  };

  const classified = useMemo(() => illustrations.map(ill => ({ ill, element: classify(ill) })), [illustrations]);

  const elementCounts = useMemo(() => {
    const counts: Record<ElementKey, number> = {
      サンタ: 0, 動物: 0, 食べ物: 0, 植物: 0, 装飾: 0, フレーム: 0, 建物: 0, その他: 0
    };
    classified.forEach(({ element }) => { counts[element]++; });
    return counts;
  }, [classified]);

  const filteredIllustrations = useMemo(() => {
    if (selectedElements.length === 0) return classified.map(c => c.ill);
    const set = new Set(selectedElements as ElementKey[]);
    return classified.filter(c => set.has(c.element)).map(c => c.ill);
  }, [classified, selectedElements]);

  const toggleElement = (key: ElementKey) => {
    setSelectedElements(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };
  const clearElements = () => setSelectedElements([]);

  const handleIllustrationClick = (ill: Illustration) => {
    setSelected(ill);
    setJustDownloaded(false);
    setIsModalOpen(true);
  };

  const handleDownload = async () => {
    if (!selected?.originalUrl) return;
    setIsDownloading(true);
    try {
      try {
        const resp = await fetch('/api/downloads', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ illustrationId: selected.id }),
        });
        if (resp.ok) {
          const data = await resp.json();
          setAllIllustrations(prev => prev.map(i => i.id === selected.id ? { ...i, downloads: data.newDownloadCount } : i));
          setSelected(prev => prev ? { ...prev, downloads: data.newDownloadCount } : prev);
        } else {
          setAllIllustrations(prev => prev.map(i => i.id === selected.id ? { ...i, downloads: i.downloads + 1 } : i));
          setSelected(prev => prev ? { ...prev, downloads: prev.downloads + 1 } : prev);
        }
      } catch {
        setAllIllustrations(prev => prev.map(i => i.id === selected.id ? { ...i, downloads: i.downloads + 1 } : i));
        setSelected(prev => prev ? { ...prev, downloads: prev.downloads + 1 } : prev);
      }
      try {
        const response = await fetch(selected.originalUrl);
        if (!response.ok) throw new Error('fetch failed');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selected.title}.png`;
        document.body?.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch {
        window.open(selected.originalUrl, '_blank');
      }
      setJustDownloaded(true);
      setIsModalOpen(false);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">イラストを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <DynamicMeta illustrations={illustrations} pageType="search" searchQuery="クリスマス" />
      {/* クリスマス特集のSEO強化 */}
      <Head>
        <title>クリスマス 素材 無料 AI イラスト特集 | AIそざいや</title>
        <meta
          name="description"
          content="クリスマスの無料AI素材を厳選。サンタ・動物・食べ物・植物・装飾・フレーム・建物など豊富なカテゴリから、商用利用OK・クレジット表記不要の高品質イラストを無料ダウンロード。"
        />
        <meta
          name="keywords"
          content="クリスマス, 素材, 無料, AI, クリスマス 素材, クリスマス 無料 素材, AI 素材, AI イラスト, クリスマス イラスト 無料, クリスマス アイコン 無料"
        />
        <link rel="canonical" href="https://www.ai-sozaiya.com/christmas" />
        <meta property="og:title" content="クリスマス 素材 無料 AI イラスト特集 | AIそざいや" />
        <meta
          property="og:description"
          content="クリスマスの無料AI素材を厳選。サンタ・動物・食べ物・植物・装飾・フレーム・建物など豊富なカテゴリから、商用利用OK・クレジット表記不要の高品質イラストを無料ダウンロード。"
        />
        <meta property="og:url" content="https://www.ai-sozaiya.com/christmas" />
      </Head>
      <div className="min-h-screen bg-white">
        <main className="py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-6 xl:px-8">
            <div id="breadcrumb">
              <Breadcrumb
                currentCategory="all"
                searchQuery="クリスマス特集"
                onCategoryChange={() => { window.location.href = '/'; }}
              />
            </div>

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800">クリスマスの無料AI素材 特集</h1>
              <p className="text-gray-600 mt-2 text-sm">
                クリスマスに関連する無料AIイラスト素材のまとめ（{illustrations.length}件）
              </p>
            </div>

            {/* 8要素のチェックボックスフィルタ */}
            <div className="mb-6 border border-gray-200 rounded-lg p-4 bg-gray-50/60">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-gray-800">要素で絞り込み</h2>
                <button
                  type="button"
                  onClick={clearElements}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  すべて解除
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-2">
                {ELEMENTS.map(key => {
                  const checked = selectedElements.includes(key);
                  return (
                    <label key={key} className="flex items-center gap-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-md px-2 py-1 hover:bg-gray-50">
                      <input
                        type="checkbox"
                        className="accent-blue-600"
                        checked={checked}
                        onChange={() => toggleElement(key)}
                      />
                      <span className="text-gray-700">{key}（{elementCounts[key as ElementKey] ?? 0}）</span>
                    </label>
                  );
                })}
              </div>
              {selectedElements.length > 0 && (
                <div className="mt-3 text-xs text-gray-600">
                  適用中: {selectedElements.join(', ')}（{filteredIllustrations.length}件）
                </div>
              )}
            </div>

            <Gallery
              illustrations={filteredIllustrations}
              currentCategory="all"
              searchQuery="クリスマス"
              onIllustrationClick={handleIllustrationClick}
              onTagClick={() => {}}
            />
          </div>
        </main>
        <Modal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setJustDownloaded(false); }}
          illustration={selected}
          onDownload={handleDownload}
          isDownloading={isDownloading}
          justDownloaded={justDownloaded}
          allIllustrations={allIllustrations}
          onIllustrationClick={handleIllustrationClick}
        />
        <Footer />
      </div>
    </>
  );
}


