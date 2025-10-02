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
      
      // ダウンロードリンクを作成
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedIllustration.title}.png`;
      document.body.appendChild(link);
      link.click();
      
      // クリーンアップ
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
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
          <div className="max-w-6xl mx-auto px-4">
            <Stats />
            
            {/* ヘッダー下横長広告 */}
            <HorizontalAd 
              adSlot={ADS_CONFIG.AD_SLOTS.HEADER_BANNER} 
              className="mb-8" 
              position="header-below"
            />
            
            {/* パンくずナビゲーション */}
            <Breadcrumb
              currentCategory={currentCategory}
              searchQuery={searchQuery}
              currentIllustration={selectedIllustration || undefined}
              onCategoryChange={handleCategoryChange}
              onSearchClear={handleSearchClear}
            />
            
            {/* セクションタイトル */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {searchQuery ? `「${searchQuery}」の検索結果` :
                 currentCategory === 'all' ? 'すべてのイラスト' : 
                 currentCategory === 'ranking' ? '人気ランキング' :
                 currentCategory === 'people' ? '人物' :
                 currentCategory === 'animals' ? '動物' :
                 currentCategory === 'business' ? 'ビジネス' :
                 currentCategory === 'food' ? '食べ物' :
                 currentCategory === 'nature' ? '自然' :
                 currentCategory === 'icons' ? 'アイコン' : 'イラスト'}
              </h2>
              <p className="text-gray-600">
                {filteredIllustrations.length}件のイラストが見つかりました
              </p>
            </div>
            
            <Gallery
              illustrations={filteredIllustrations}
              currentCategory={currentCategory}
              searchQuery={searchQuery}
              onIllustrationClick={handleIllustrationClick}
              onTagClick={handleTagClick}
            />
            
            {/* コンテンツ下横長広告 */}
            <HorizontalAd 
              adSlot={ADS_CONFIG.AD_SLOTS.CONTENT_BANNER} 
              className="mt-12" 
              position="content-below"
            />
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
