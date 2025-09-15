'use client';

import { useState } from 'react';

interface HeaderProps {
  onNavigate: (section: string) => void;
}

export default function Header({ onNavigate }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'request', label: 'リクエスト' },
    { id: 'illustrations', label: 'イラスト' },
    { id: 'ranking', label: '人気ランキング' },
    { id: 'categories', label: 'カテゴリ' },
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
              {navItems.map((item) => (
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
                    }}
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
            className="md:hidden text-white/90 text-2xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 glassmorphism rounded-lg p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
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
                    className="w-full text-left text-white/90 font-semibold py-2 px-4 rounded-lg hover:text-white hover:bg-white/10 transition-all duration-300"
                  >
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
