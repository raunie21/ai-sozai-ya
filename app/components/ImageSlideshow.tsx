'use client';

import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Illustration } from '../types/illustration';
import Modal from './Modal';

// Swiper CSS
import 'swiper/css';

interface ImageSlideshowProps {
  illustrations: Illustration[];
}

export default function ImageSlideshow({ illustrations }: ImageSlideshowProps) {
  const [selectedIllustration, setSelectedIllustration] = useState<Illustration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [updatedIllustrations, setUpdatedIllustrations] = useState<Illustration[]>(illustrations);

  // propsが変更された時にローカル状態を更新
  useEffect(() => {
    setUpdatedIllustrations(illustrations);
  }, [illustrations]);

  // コンポーネント初期化時にダウンロード数を読み込む
  useEffect(() => {
    const loadDownloadCounts = async () => {
      try {
        const response = await fetch('/api/downloads');
        if (response.ok) {
          const data = await response.json();
          const downloadCounts = data.downloads || {};
          
          // イラストデータにダウンロード数を適用
          const updatedIllustrations = illustrations.map(illustration => ({
            ...illustration,
            downloads: downloadCounts[illustration.id.toString()] || 0
          }));
          
          setUpdatedIllustrations(updatedIllustrations);
        }
      } catch (error) {
        console.error('Failed to load download counts in slideshow:', error);
      }
    };

    loadDownloadCounts();
  }, [illustrations]);

  // 最近追加された10個の画像を取得（IDが大きい順）
  const recentImages = updatedIllustrations
    .sort((a, b) => b.id - a.id)
    .slice(0, 10);

  if (recentImages.length === 0) {
    return null;
  }

  const handleImageClick = (illustration: Illustration) => {
    setSelectedIllustration(illustration);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedIllustration(null);
  };

  const handleDownload = async () => {
    if (selectedIllustration?.originalUrl) {
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
            setUpdatedIllustrations(prevIllustrations => 
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
            setUpdatedIllustrations(prevIllustrations => 
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
          setUpdatedIllustrations(prevIllustrations => 
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
        
        // モーダルを閉じる
        handleCloseModal();
      } catch (error) {
        console.error('Download error:', error);
        // エラーが発生した場合は新しいタブで開く
        window.open(selectedIllustration.originalUrl, '_blank');
        handleCloseModal();
      } finally {
        setIsDownloading(false);
      }
    }
  };

  // 4個ずつのグループに分割
  const imageGroups = [];
  for (let i = 0; i < recentImages.length; i += 4) {
    imageGroups.push(recentImages.slice(i, i + 4));
  }

  return (
    <section className="bg-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* スワイパー */}
        <Swiper
          modules={[Autoplay]}
          spaceBetween={10}
          slidesPerView={1}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          speed={2000}
          loop={true}
          className="swiper-container"
        >
          {imageGroups.map((group, groupIndex) => (
            <SwiperSlide key={groupIndex}>
              <div className="grid grid-cols-4 gap-4">
                {group.map((illustration) => (
                  <div
                    key={illustration.id}
                    className="relative bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
                    onClick={() => handleImageClick(illustration)}
                  >
                    <div className="aspect-square relative">
                      {illustration.imageUrl ? (
                        <img
                          src={illustration.imageUrl}
                          alt={illustration.title}
                          className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-2xl text-gray-400">📷</span>
                        </div>
                      )}
                      
                      {/* オーバーレイ情報 */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
                        <h3 className="text-sm font-bold text-white mb-1 truncate">
                          {illustration.title}
                        </h3>
                        <p className="text-white/90 text-xs truncate">
                          {illustration.tags?.slice(0, 2).join(' • ')}
                        </p>
                      </div>
                      
                      {/* クリックヒント */}
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-200">
                        クリック
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      {/* モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        illustration={selectedIllustration}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />
    </section>
  );
}
