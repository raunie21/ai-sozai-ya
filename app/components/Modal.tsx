'use client';

import { useEffect, useState } from 'react';
import { Illustration } from '../types/illustration';
import OptimizedImage from './OptimizedImage';
import { getImageUrl } from '../utils/imageUrl';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  illustration: Illustration | null;
  onDownload: () => void;
  isDownloading?: boolean;
  justDownloaded?: boolean;
}

export default function Modal({ isOpen, onClose, illustration, onDownload, isDownloading = false, justDownloaded = false }: ModalProps) {
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
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
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
      className="fixed inset-0 bg-black/70 z-[1000] backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white/95 backdrop-blur-xl p-10 rounded-3xl max-w-lg w-full text-center border border-white/20 shadow-2xl relative">
        <button
          className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-gray-600 transition-colors duration-300 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          onClick={onClose}
        >
          ×
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6">ダウンロード</h2>
        
        <div className="w-80 h-80 mx-auto mb-6 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative">
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
        
        <p className="text-xl font-semibold text-gray-800 mb-2">
          {illustration.title}
        </p>
        
        <p className={`text-indigo-600 font-medium mb-6 transition-all duration-300 ${showCountUpdate ? 'scale-110 text-green-600' : ''}`}>
          <span className="inline-flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {illustration.downloads.toLocaleString()} ダウンロード
            {showCountUpdate && (
              <span className="ml-2 text-green-600 font-bold animate-pulse">
                +1
              </span>
            )}
          </span>
        </p>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          このイラストは商用利用可能です。<br />
          クレジット表記は不要です。
        </p>
        
        <button 
          className={`button-gradient text-white border-none px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg shadow-indigo-500/30 relative overflow-hidden group ${
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
              '高解像度画像をダウンロード'
            )}
          </span>
          {!isDownloading && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          )}
        </button>
      </div>
    </div>
  );
}
