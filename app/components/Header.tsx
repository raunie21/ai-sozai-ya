'use client';

import { useState } from 'react';

interface HeaderProps {
  onNavigate: (section: string) => void;
}

export default function Header({ onNavigate }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // デスクトップ表示用のナビアイテム（リクエスト・お問い合わせを除外）
  const desktopNavItems = [
    { id: 'illustrations', label: 'イラスト' },
    { id: 'ranking', label: '人気ランキング' },
    { id: 'categories', label: 'カテゴリ' },
  ];

  // モバイル表示用のナビアイテム（全項目）
  const mobileNavItems = [
    { id: 'illustrations', label: 'イラスト' },
    { id: 'ranking', label: '人気ランキング' },
    { id: 'categories', label: 'カテゴリ' },
    { id: 'request', label: 'リクエスト' },
    { id: 'contact', label: 'お問い合わせ' },
  ];

  return (
    <header className="glassmorphism border-b border-white/20 p-4 sticky top-0 z-50 shadow-lg shadow-black/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <a 
            href="#" 
            className="text-3xl font-extrabold text-gradient flex items-center gap-3 tracking-tight"
            onClick={() => onNavigate('home')}
          >
            <span className="text-3xl filter drop-shadow-lg">🤖</span>
            AIそざいや
          </a>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex gap-8">
              {desktopNavItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className="text-white/90 font-semibold transition-all duration-300 px-4 py-2 rounded-lg hover:text-white hover:bg-white/10 hover:-translate-y-0.5"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white/90 p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="flex flex-col justify-center items-center w-6 h-6">
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 glassmorphism rounded-lg p-4 border border-white/20">
            <ul className="space-y-2">
              {mobileNavItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      if (item.id === 'request') {
                        window.location.href = '/request';
                      } else if (item.id === 'contact') {
                        window.location.href = 'mailto:aisozaiya@ai-sozaiya.com';
                      } else {
                        onNavigate(item.id);
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-left text-white/90 font-semibold py-3 px-4 rounded-lg hover:text-white hover:bg-white/10 transition-all duration-300 flex items-center gap-3"
                  >
                    <span>
                      {item.id === 'illustrations' && '🎨'}
                      {item.id === 'ranking' && '🔥'}
                      {item.id === 'categories' && '📁'}
                      {item.id === 'request' && '📝'}
                      {item.id === 'contact' && '📧'}
                    </span>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
