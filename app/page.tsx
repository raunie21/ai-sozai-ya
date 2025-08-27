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

  const handleDownload = () => {
    if (!selectedIllustration) return;

    // Update download count
    setIllustrationData(prev => 
      prev.map(ill => 
        ill.id === selectedIllustration.id 
          ? { ...ill, downloads: ill.downloads + 1 }
          : ill
      )
    );

    // Show success message
    alert(`「${selectedIllustration.title}」をPNG形式でダウンロードしました！\nダウンロード数: ${(selectedIllustration.downloads + 1).toLocaleString()}`);

    // Close modal
    setIsModalOpen(false);
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
      />
      
      <Footer />
    </div>
  );
}
