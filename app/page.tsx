'use client';

import { useState, useMemo, useEffect } from 'react';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Gallery from './components/Gallery';
import Modal from './components/Modal';
import Footer from './components/Footer';
import CategoryFilter from './components/CategoryFilter';
import StructuredData from './components/StructuredData';
import Breadcrumb from './components/Breadcrumb';
import ResponsiveAd from './components/ResponsiveAd';
import InFeedAd from './components/InFeedAd';
import HorizontalAd from './components/HorizontalAd';
import { ADS_CONFIG } from './config/ads';
import { fetchIllustrations } from './utils/illustrations';
import { Illustration, Category } from './types/illustration';
import { useAnalytics } from './hooks/useAnalytics';
import AdSenseHead from './components/AdSenseHead';
import Sidebar from './components/Sidebar';

export default function Home() {
  const [currentCategory, setCurrentCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIllustration, setSelectedIllustration] = useState<Illustration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [justDownloaded, setJustDownloaded] = useState(false);
  const [illustrationData, setIllustrationData] = useState<Illustration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Analytics フック
  const { trackDownload, trackSearch, trackCategoryChange, trackModalOpen } = useAnalytics();

  // アプリケーション起動時にUpstashからイラストデータを読み込む
  useEffect(() => {
    const loadIllustrations = async () => {
      try {
        setIsLoading(true);
        const illustrations = await fetchIllustrations();
        setIllustrationData(illustrations);
      } catch (error) {
        console.error('Failed to load illustrations:', error);
        setIllustrationData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadIllustrations();
  }, []);

  const filteredIllustrations = useMemo(() => {
    // 不正データを除外（タイトル欠落やURL欠落など）
    let filtered = [...illustrationData].filter((ill) => {
      const hasTitle = !!ill?.title && ill.title.trim() !== '';
      const hasAnyUrl = !!ill?.thumbnailUrl || !!ill?.imageUrl || !!ill?.originalUrl;
      const hasId = typeof ill?.id === 'number' && Number.isFinite(ill.id);
      return hasTitle && hasAnyUrl && hasId;
    });

    // Sort by downloads for ranking
    if (currentCategory === 'ranking') {
      filtered = filtered.sort((a, b) => b.downloads - a.downloads);
    }

    // Filter by category (except for 'all' and 'ranking')
    if (currentCategory !== 'all' && currentCategory !== 'ranking') {
      filtered = filtered.filter(ill => ill.category === currentCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(ill => 
        ill.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (Array.isArray(ill.tags) && ill.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }

    return filtered;
  }, [illustrationData, currentCategory, searchQuery]);

  // 最終更新日（全イラストの中で最新のupdatedAt/createdAt）
  const lastUpdated = useMemo(() => {
    if (!illustrationData || illustrationData.length === 0) return null;
    const timestamps = illustrationData
      .map((ill) => new Date(ill?.updatedAt || ill?.createdAt || 0).getTime())
      .filter((t) => Number.isFinite(t));
    if (timestamps.length === 0) return null;
    const maxTs = Math.max(...timestamps);
    const d = new Date(maxTs);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    // 形式: YYYY-MM-DD（Aboutページと統一）
    return `${y}-${m}-${day}`;
  }, [illustrationData]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentCategory('all'); // Reset category when searching
    
    // Analytics: 検索イベントを追跡
    if (query.trim()) {
      const resultCount = illustrationData.filter(ill => 
        ill.title.toLowerCase().includes(query.toLowerCase()) ||
        (Array.isArray(ill.tags) && ill.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
      ).length;
      trackSearch(query, resultCount);
    }
  };

  const handleCategoryChange = (category: Category) => {
    setCurrentCategory(category);
    setSearchQuery(''); // Clear search when changing category
    
    // Analytics: カテゴリ変更イベントを追跡
    trackCategoryChange(category);
    
    // パンくず位置の少し上へスクロール
    setTimeout(() => {
      const element = document.getElementById('breadcrumb');
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - 80; // 100px上にオフセット
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setCurrentCategory('all');
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    setCurrentCategory('all');
  };

  const handleIllustrationClick = (illustration: Illustration) => {
    setSelectedIllustration(illustration);
    setJustDownloaded(false); // 新しいイラストを選択した時にリセット
    setIsModalOpen(true);
    
    // Analytics: モーダル開封イベントを追跡
    trackModalOpen(illustration.id, illustration.title);
  };

  const handleDownload = async () => {
    if (!selectedIllustration?.originalUrl) return;
    
    setIsDownloading(true);
    
    try {
      // ダウンロード数を更新（APIが利用できない場合はスキップ）
      try {
        const downloadResponse = await fetch('/api/downloads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            illustrationId: selectedIllustration.id,
          }),
        });

        if (downloadResponse.ok) {
          const downloadData = await downloadResponse.json();
          
          // ローカルのイラストデータを即座に更新
          setIllustrationData(prevIllustrations => 
            prevIllustrations.map(illustration => 
              illustration.id === selectedIllustration.id
                ? { ...illustration, downloads: downloadData.newDownloadCount }
                : illustration
            )
          );
          
          // 選択中のイラストも即座に更新
          setSelectedIllustration(prev => 
            prev ? { ...prev, downloads: downloadData.newDownloadCount } : null
          );
          
          console.log(`Download count updated: ${downloadData.previousCount} → ${downloadData.newDownloadCount}`);
        } else {
          console.warn('Failed to update download count:', downloadResponse.status);
          // ローカルでダウンロード数を増加
          setIllustrationData(prevIllustrations => 
            prevIllustrations.map(illustration => 
              illustration.id === selectedIllustration.id
                ? { ...illustration, downloads: illustration.downloads + 1 }
                : illustration
            )
          );
          
          setSelectedIllustration(prev => 
            prev ? { ...prev, downloads: prev.downloads + 1 } : null
          );
        }
      } catch (apiError) {
        console.warn('API call failed, using local count update:', apiError);
        // ローカルでダウンロード数を増加
        setIllustrationData(prevIllustrations => 
          prevIllustrations.map(illustration => 
            illustration.id === selectedIllustration.id
              ? { ...illustration, downloads: illustration.downloads + 1 }
              : illustration
          )
        );
        
        setSelectedIllustration(prev => 
          prev ? { ...prev, downloads: prev.downloads + 1 } : null
        );
      }

      // 実際にファイルをダウンロード
      const response = await fetch(selectedIllustration.originalUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // ダウンロードリンクを作成（安全なクリーンアップを保証）
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedIllustration.title}.png`;
      let appended = false;
      try {
        if (document.body) {
          document.body.appendChild(link);
          appended = true;
        }
        link.click();
      } finally {
        if (appended && link && link.parentNode) {
          link.parentNode.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
      }
      
      // ダウンロード完了フラグを設定
      setJustDownloaded(true);
      
      // Analytics: ダウンロード完了イベントを追跡
      trackDownload(selectedIllustration.id, selectedIllustration.title);
      
      // モーダルを閉じる
      setIsModalOpen(false);
    } catch (error) {
      console.error('Download error:', error);
      // エラーが発生した場合は新しいタブで開く
      window.open(selectedIllustration.originalUrl, '_blank');
      setIsModalOpen(false);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleNavigate = (section: string) => {
    switch (section) {
      case 'home':
        setCurrentCategory('all');
        setSearchQuery('');
        break;
      case 'illustrations':
        setCurrentCategory('all');
        break;
      case 'ranking':
        setCurrentCategory('ranking');
        break;
      case 'categories':
        // You could implement a categories overview page here
        break;
      case 'about':
      case 'contact':
        // These could link to dedicated pages
        alert(`${section === 'about' ? 'このサイトについて' : 'お問い合わせ'}ページは準備中です。`);
        break;
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
           <AdSenseHead />
           <StructuredData 
             illustrations={filteredIllustrations}
             type={selectedIllustration ? 'illustration' : 'gallery'}
             currentIllustration={selectedIllustration || undefined}
           />
      
      <div className="min-h-screen">
        <Hero 
          onSearch={handleSearch}
          illustrations={illustrationData}
        />
        
        {/* 固定カテゴリーフィルター */}
        <CategoryFilter 
          currentCategory={currentCategory}
          onCategoryChange={handleCategoryChange}
        />
        
        <main className="bg-white py-16" style={{paddingTop: '80px'}} id="main-content">
          <div className="xl:max-w-none xl:pl-4 xl:pr-0 max-w-7xl mx-auto px-4">
            {/* メインコンテンツエリア */}
            <div className="w-full">
                <Stats />
                
                {/* ヘッダー下横長広告 */}
                <HorizontalAd 
                  adSlot={ADS_CONFIG.AD_SLOTS.HEADER_BANNER} 
                  className="mb-8" 
                  position="header-below"
                />
                
                {/* パンくずナビゲーション */}
                <div id="breadcrumb">
                <Breadcrumb
                  currentCategory={currentCategory}
                  searchQuery={searchQuery}
                  currentIllustration={selectedIllustration || undefined}
                  onCategoryChange={handleCategoryChange}
                  onSearchClear={handleSearchClear}
                />
                </div>
                
                {/* セクションタイトル */}
                <div className="mb-8 px-4 md:px-6 xl:px-8">
                  <div className="flex items-end justify-start gap-4">
                    <div className="min-w-0">
                      <h2 className="text-3xl font-bold text-gray-800 mb-2">
                        {searchQuery ? `「${searchQuery}」の検索結果` :
                         currentCategory === 'all' ? 'すべてのイラスト' : 
                         currentCategory === 'ranking' ? '人気ランキング' :
                         currentCategory === 'people' ? '人物' :
                         currentCategory === 'animals' ? '動物' :
                         currentCategory === 'business' ? 'ビジネス' :
                         currentCategory === 'food' ? '食べ物' :
                         currentCategory === 'nature' ? '自然' :
                         currentCategory === 'daily' ? '日常' :
                         currentCategory === 'icons' ? 'アイコン' : 'イラスト'}
                      </h2>
                      <p className="text-gray-600 flex items-center gap-4 flex-wrap">
                        <span>{filteredIllustrations.length}件のイラストが見つかりました</span>
                        {currentCategory === 'all' && lastUpdated && (
                          <span className="text-sm text-gray-500 whitespace-nowrap">最終更新日: {lastUpdated}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  {/* カテゴリ説明＋内部リンク */}
                  {currentCategory !== 'all' && currentCategory !== 'ranking' && (
                    <div className="text-gray-600 mt-2 text-sm">
                      {currentCategory === 'people' && (
                        <>
                          人物のAI 素材（無料）。<a href="/categories/people" className="text-blue-600 hover:underline">人物カテゴリ一覧</a> ／ <a href="/ai-sozai/how-to" className="text-blue-600 hover:underline">使い方</a>
                        </>
                      )}
                      {currentCategory === 'animals' && (
                        <>
                          動物のAI 素材（無料）。<a href="/categories/animals" className="text-blue-600 hover:underline">動物カテゴリ一覧</a> ／ <a href="/ai-sozai/free" className="text-blue-600 hover:underline">フリー素材</a>
                        </>
                      )}
                      {currentCategory === 'business' && (
                        <>
                          ビジネス向けAI 素材（無料）。<a href="/categories/business" className="text-blue-600 hover:underline">ビジネスカテゴリ一覧</a> ／ <a href="/ai-sozai/commercial" className="text-blue-600 hover:underline">商用利用</a>
                        </>
                      )}
                      {currentCategory === 'food' && (
                        <>
                          食べ物のAI 素材（無料）。<a href="/categories/food" className="text-blue-600 hover:underline">食べ物カテゴリ一覧</a>
                        </>
                      )}
                      {currentCategory === 'nature' && (
                        <>
                          自然のAI 素材（無料）。<a href="/categories/nature" className="text-blue-600 hover:underline">自然カテゴリ一覧</a>
                        </>
                      )}
                      {currentCategory === 'daily' && (
                        <>
                          日常のAI 素材（無料）。<a href="/categories/daily" className="text-blue-600 hover:underline">日常カテゴリ一覧</a>
                        </>
                      )}
                      {currentCategory === 'icons' && (
                        <>
                          アイコン素材（無料）。<a href="/categories/icons" className="text-blue-600 hover:underline">アイコンカテゴリ一覧</a>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Gallery とサイドバーを並列配置 */}
                <div className="flex xl:gap-6 gap-0 justify-between">
                  {/* メインコンテンツエリア */}
                  <div className="flex-1 min-w-0 xl:pr-0 pr-4 flex justify-center">
                    <div className="w-full xl:max-w-6xl">
                    <Gallery
                      illustrations={filteredIllustrations}
                      currentCategory={currentCategory}
                      searchQuery={searchQuery}
                      onIllustrationClick={handleIllustrationClick}
                      onTagClick={handleTagClick}
                    />

                    {/* AI素材関連記事への内部リンク */}
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <a href="/ai-sozai/free" className="block p-4 border rounded-lg hover:bg-gray-50 transition">
                        <div className="text-sm text-gray-500 mb-1">AI素材の基礎</div>
                        <div className="font-semibold text-gray-800">AI素材 フリー素材</div>
                        <p className="text-gray-600 text-sm mt-1">完全無料のAI 素材まとめ</p>
                      </a>
                      <a href="/ai-sozai/commercial" className="block p-4 border rounded-lg hover:bg-gray-50 transition">
                        <div className="text-sm text-gray-500 mb-1">ビジネス活用</div>
                        <div className="font-semibold text-gray-800">AI素材 商用利用</div>
                        <p className="text-gray-600 text-sm mt-1">利用範囲と注意点</p>
                      </a>
                      <a href="/ai-sozai/how-to" className="block p-4 border rounded-lg hover:bg-gray-50 transition">
                        <div className="text-sm text-gray-500 mb-1">使い方ガイド</div>
                        <div className="font-semibold text-gray-800">AI素材 使い方</div>
                        <p className="text-gray-600 text-sm mt-1">検索・ダウンロードのコツ</p>
                      </a>
                    </div>
                    
                    {/* コンテンツ下横長広告 */}
                    <HorizontalAd 
                      adSlot={ADS_CONFIG.AD_SLOTS.CONTENT_BANNER} 
                      className="mt-12" 
                      position="content-below"
                    />
                    </div>
                  </div>

                  {/* サイドバー（PC版のみ表示・ギャラリーと並列） */}
                  <Sidebar className="hidden xl:block w-64 flex-shrink-0 sticky top-24 max-h-[calc(100vh-96px)] overflow-y-auto" />
                </div>
            </div>
          </div>

        </main>

        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setJustDownloaded(false);
          }}
          illustration={selectedIllustration}
          onDownload={handleDownload}
          isDownloading={isDownloading}
          justDownloaded={justDownloaded}
          allIllustrations={illustrationData}
          onIllustrationClick={handleIllustrationClick}
          onTagClick={handleTagClick}
        />
        
        {/* フッター上横長広告 */}
        <HorizontalAd 
          adSlot={ADS_CONFIG.AD_SLOTS.FOOTER_BANNER} 
          className="bg-gray-50 py-8" 
          position="footer-above"
        />
        
        <Footer />
      </div>
    </>
  );
}
