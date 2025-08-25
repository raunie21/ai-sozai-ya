'use client';

import { useEffect } from 'react';
import { Illustration } from '../types/illustration';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  illustration: Illustration | null;
  onDownload: () => void;
}

export default function Modal({ isOpen, onClose, illustration, onDownload }: ModalProps) {
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
      <div className="bg-white/95 backdrop-blur-xl p-10 rounded-3xl max-w-lg w-full text-center animate-modal-slide-in border border-white/20 shadow-2xl relative">
        <button
          className="absolute top-4 right-4 text-3xl text-gray-400 hover:text-gray-600 transition-colors duration-300 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
          onClick={onClose}
        >
          ×
        </button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6">ダウンロード</h2>
        
        <div className="text-8xl mb-6">
          {illustration.emoji}
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
          className="button-gradient text-white border-none px-8 py-4 rounded-full cursor-pointer font-semibold text-lg transition-all duration-300 shadow-lg shadow-indigo-500/30 relative overflow-hidden group hover:-translate-y-1 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40"
          onClick={onDownload}
        >
          <span className="relative z-10">PNG形式でダウンロード</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
        </button>
      </div>
    </div>
  );
}
