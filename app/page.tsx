'use client';

import { useState, useMemo } from 'react';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Gallery from './components/Gallery';
import Modal from './components/Modal';
import Footer from './components/Footer';
import { illustrations } from './data/illustrations';
import { Illustration, Category } from './types/illustration';

export default function Home() {
  const [currentCategory, setCurrentCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIllustration, setSelectedIllustration] = useState<Illustration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [illustrationData, setIllustrationData] = useState(illustrations);

  const filteredIllustrations = useMemo(() => {
    let filtered = [...illustrationData];

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
        ill.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [illustrationData, currentCategory, searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryChange = (category: Category) => {
    setCurrentCategory(category);
    setSearchQuery(''); // Clear search when changing category
  };

  const handleIllustrationClick = (illustration: Illustration) => {
    setSelectedIllustration(illustration);
    setIsModalOpen(true);
  };

  const handleDownload = async () => {
    if (!selectedIllustration?.originalUrl) return;
    
    setIsDownloading(true);
    
    try {
      // ダウンロード数を更新
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
        console.error('Failed to update download count:', downloadResponse.status);
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

  return (
    <div className="min-h-screen">
      <Hero 
        onSearch={handleSearch}
        onCategoryChange={handleCategoryChange}
        currentCategory={currentCategory}
        illustrations={illustrationData}
      />
      
      <main className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <Stats />
          
          {/* セクションタイトル */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              {currentCategory === 'all' ? 'すべてのイラスト' : 
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
          />
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        illustration={selectedIllustration}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />
      
      <Footer />
    </div>
  );
}
