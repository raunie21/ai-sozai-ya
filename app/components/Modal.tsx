'use client';

import { useEffect, useState } from 'react';
import { Illustration } from '../types/illustration';
import OptimizedImage from './OptimizedImage';
import TagLinks from './TagLinks';
import RelatedIllustrations from './RelatedIllustrations';
import { getImageUrl } from '../utils/imageUrl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  illustration: Illustration | null;
  onDownload: () => void;
  isDownloading?: boolean;
  justDownloaded?: boolean;
  allIllustrations?: Illustration[];
  onIllustrationClick?: (illustration: Illustration) => void;
  onTagClick?: (tag: string) => void;
}

export default function Modal({ 
  isOpen, 
  onClose, 
  illustration, 
  onDownload, 
  isDownloading = false, 
  justDownloaded = false,
  allIllustrations = [],
  onIllustrationClick,
  onTagClick
}: ModalProps) {
  const [downloadCount, setDownloadCount] = useState<number>(0);
  const [showCountUpdate, setShowCountUpdate] = useState(false);
  const [lastIllustrationId, setLastIllustrationId] = useState<number | null>(null);

  useEffect(() => {
    if (illustration) {
      setDownloadCount(illustration.downloads);
      setLastIllustrationId(illustration.id);
    }
  }, [illustration]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // モーダル内でのスクロールを許可するため、bodyのスクロールは制御しない
    } else {
      // モーダルが閉じられた時に「+1」表示をリセット
      setShowCountUpdate(false);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // ダウンロード数が更新された時の視覚的フィードバック（同じイラストのみ）
  useEffect(() => {
    if (illustration && 
        illustration.id === lastIllustrationId && 
        illustration.downloads !== downloadCount) {
      setDownloadCount(illustration.downloads);
      setShowCountUpdate(true);
      setTimeout(() => setShowCountUpdate(false), 2000);
    }
  }, [illustration, downloadCount, lastIllustrationId]);

  // ダウンロード完了時の「+1」表示
  useEffect(() => {
    if (justDownloaded && illustration) {
      setShowCountUpdate(true);
      setTimeout(() => setShowCountUpdate(false), 2000);
    }
  }, [justDownloaded, illustration]);

  if (!isOpen || !illustration) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 z-[1000] backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white/95 backdrop-blur-xl p-6 md:p-8 lg:p-10 rounded-3xl max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl w-full text-center border border-white/20 shadow-2xl relative my-8 min-h-fit">
        <button
          className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-gray-600 transition-colors duration-300 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          onClick={onClose}
        >
          ×
        </button>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 lg:mb-8">ダウンロード</h2>
        
        {/* レスポンシブレイアウト: モバイルは縦並び、PC は横並び */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8 xl:gap-12">
          {/* 画像部分 */}
          <div className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 xl:w-[28rem] xl:h-[28rem] mx-auto lg:mx-0 mb-6 lg:mb-0 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative flex-shrink-0">
            {illustration.imageUrl ? (
              <OptimizedImage
                src={illustration.imageUrl}
                alt={illustration.title}
                className="w-full h-full object-cover transition-opacity duration-300"
                width={800}
                height={800}
                onError={() => {
                  console.warn(`Failed to load modal image: ${illustration.imageUrl}`);
                }}
              />
            ) : (
              <div className="text-6xl text-gray-400">
                📷
              </div>
            )}
          </div>
          
          {/* コンテンツ部分 */}
          <div className="flex-1 lg:text-left">
            <p className="text-xl md:text-2xl lg:text-3xl font-semibold text-gray-800 mb-3 lg:mb-4">
              {illustration.title}
            </p>
            
            <p className={`text-indigo-600 font-medium mb-6 lg:mb-8 transition-all duration-300 ${showCountUpdate ? 'scale-110 text-green-600' : ''}`}>
              <span className="inline-flex items-center gap-2 lg:justify-start">
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="text-base lg:text-lg">
                  {illustration.downloads.toLocaleString()} ダウンロード
                </span>
                {showCountUpdate && (
                  <span className="ml-2 text-green-600 font-bold animate-pulse">
                    +1
                  </span>
                )}
              </span>
            </p>
            
            <p className="text-gray-600 mb-6 lg:mb-8 leading-relaxed text-sm lg:text-base">
              このイラストは商用利用可能です。<br />
              クレジット表記は不要です。
            </p>

            {/* タグリンク */}
            {onTagClick && illustration.tags && illustration.tags.length > 0 && (
              <div className="mb-8 lg:mb-10">
                <TagLinks
                  tags={illustration.tags}
                  onTagClick={(tag) => {
                    onTagClick(tag);
                    onClose();
                  }}
                  maxVisible={8}
                  size="md"
                  variant="pill"
                />
              </div>
            )}
            
            <button 
              className={`button-gradient text-white border-none px-8 lg:px-12 py-4 lg:py-5 rounded-full font-semibold text-lg lg:text-xl transition-all duration-300 shadow-lg shadow-indigo-500/30 relative overflow-hidden group w-full lg:w-auto ${
                isDownloading 
                  ? 'cursor-not-allowed opacity-70' 
                  : 'cursor-pointer hover:-translate-y-1 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40'
              }`}
              onClick={onDownload}
              disabled={isDownloading}
            >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {isDownloading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ダウンロード中...
              </>
            ) : (
              <>
                <svg 
                  className="w-6 h-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2.5} 
                    d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" 
                  />
                </svg>
                高解像度画像をダウンロード
              </>
            )}
          </span>
          {!isDownloading && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          )}
            </button>
          </div>
        </div>

        {/* 関連イラスト */}
        {onIllustrationClick && allIllustrations.length > 0 && (
          <div className="mt-8 lg:mt-12">
            <RelatedIllustrations
              currentIllustration={illustration}
              allIllustrations={allIllustrations}
              onIllustrationClick={(relatedIllustration) => {
                onIllustrationClick(relatedIllustration);
                // モーダルは開いたままで、内容を更新
              }}
              maxItems={8}
            />
          </div>
        )}
      </div>
    </div>
  );
}
