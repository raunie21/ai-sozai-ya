'use client';

import { useEffect } from 'react';
import { Illustration } from '../types/illustration';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  illustration: Illustration | null;
  onDownload: () => void;
  isDownloading?: boolean;
}

export default function Modal({ isOpen, onClose, illustration, onDownload, isDownloading = false }: ModalProps) {
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
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

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
            <img
              src={illustration.imageUrl}
              alt={illustration.title}
              className="w-full h-full object-cover transition-opacity duration-300"
              onError={(e) => {
                // 画像読み込みエラー時のフォールバック
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
                const fallback = document.createElement('div');
                fallback.innerHTML = '<span class="text-6xl text-gray-400">📷</span>';
                fallback.className = 'flex items-center justify-center w-full h-full';
                target.parentNode?.appendChild(fallback);
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
        
        <p className="text-indigo-600 font-medium mb-6">
          {illustration.downloads.toLocaleString()} ダウンロード
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
