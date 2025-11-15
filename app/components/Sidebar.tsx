'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SidebarProps {
  className?: string;
  style?: React.CSSProperties;
}

type SiteUpdate = { date: string; text: string };

export default function Sidebar({ className = '', style }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['ai-sozai']);
  const [updates, setUpdates] = useState<SiteUpdate[]>([]);

  useEffect(() => {
    let aborted = false;
    const load = async () => {
      try {
        const res = await fetch('/api/site-updates?limit=4', { cache: 'no-store' });
        if (!res.ok) throw new Error('failed');
        const json = await res.json();
        const list: SiteUpdate[] = (json?.updates || []).map((u: any) => ({ date: u?.date, text: u?.text })).filter((u: any) => u?.date && u?.text);
        if (!aborted) setUpdates(list);
      } catch {
        // フォールバック: 既存の静的データを遅延import
        import('@/app/data/updates').then(mod => {
          if (aborted) return;
          setUpdates((mod.siteUpdates || []).slice(0, 4));
        }).catch(() => {});
      }
    };
    load();
    return () => { aborted = true; };
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sidebarItems = [
    {
      id: 'ai-sozai',
      title: 'AI素材について',
      icon: '📘',
      items: [
        {
          title: 'AI素材とは？',
          href: '/ai-sozai',
          description: 'AI素材の基本概念と特徴'
        },
        {
          title: 'AI素材 フリー素材',
          href: '/ai-sozai/free',
          description: '完全無料のAI素材まとめ'
        },
        {
          title: 'AI素材 商用利用',
          href: '/ai-sozai/commercial',
          description: '商用利用の範囲と注意点'
        },
        {
          title: 'AI素材 使い方',
          href: '/ai-sozai/how-to',
          description: '検索・ダウンロードのコツ'
        }
        ,
        {
          title: '素材使用例まとめ',
          href: '/articles/usage-examples',
          description: 'サムネ・動画編集・ポスターの作り方'
        },
        {
          title: '画像生成AI比較と商用ガイド',
          href: '/articles/ai-services-comparison',
          description: '主要サービスの規約・商用可否まとめ'
        }
      ]
    },
    {
      id: 'categories',
      title: 'カテゴリ',
      icon: '🗂️',
      items: [
        { title: '人物', href: '/categories/people#breadcrumb', description: '人物のAI 素材' },
        { title: '日常', href: '/categories/daily#breadcrumb', description: '日常のAI 素材' },
        { title: '動物', href: '/categories/animals#breadcrumb', description: '動物のAI 素材' },
        { title: 'ビジネス', href: '/categories/business#breadcrumb', description: 'ビジネスのAI 素材' },
        { title: '食べ物', href: '/categories/food#breadcrumb', description: '食べ物のAI 素材' },
        { title: '自然', href: '/categories/nature#breadcrumb', description: '自然のAI 素材' },
        { title: 'アイコン', href: '/categories/icons#breadcrumb', description: 'アイコン素材' }
      ]
    },
    {
      id: 'support',
      title: 'サポート',
      icon: '🛠️',
      items: [
        {
          title: 'イラストリクエスト',
          href: '/request',
          description: '欲しいイラストをリクエスト'
        },
        {
          title: 'お問い合わせ',
          href: '/contact',
          description: 'ご質問・ご要望はこちら'
        }
      ]
    },
    {
      id: 'legal',
      title: '利用規約',
      icon: '📋',
      items: [
        {
          title: 'AI生成素材のポリシー',
          href: '/articles/ai-policy',
          description: '品質・権利リスク回避の方針とガイドライン'
        },
        {
          title: '利用規約',
          href: '/terms',
          description: '商用利用に関する重要な規約'
        },
        {
          title: 'プライバシーポリシー',
          href: '/privacy',
          description: '個人情報の取り扱いについて'
        }
      ]
    }
  ];

  return (
    <aside className={className} style={style}>
      <div className="p-4">
      
        <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center">
          <span className="text-lg mr-2">📚</span>
          サイト内記事
        </h2>
        
        <nav className="space-y-3">
          {sidebarItems.map((section) => (
            <div key={section.id} className="border border-gray-100 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <span className="text-sm mr-2">{section.icon}</span>
                  <span className="font-medium text-xs text-gray-800 whitespace-nowrap">{section.title}</span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${
                    expandedSections.includes(section.id) ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {expandedSections.includes(section.id) && (
                <div className="bg-white">
                  {section.items.map((item, index) => (
                    <Link
                      key={index}
                      href={item.href}
                      className="block p-3 border-t border-gray-100 hover:bg-blue-50 transition-colors duration-200 group"
                    >
                      <div className="font-medium text-sm text-gray-800 group-hover:text-blue-600 mb-1">
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-600 group-hover:text-blue-500 line-clamp-2">
                        {item.description}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
          {/* クリスマス特集ボタン */}
          <Link
          href="/christmas"
          aria-label="クリスマス特集ページへ"
          className="block w-full mt-4 text-center py-3 rounded-xl text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 bg-[url('/checkpattern2.png')] bg-cover bg-center transform hover:-translate-y-0.5"
        >
          🎄クリスマス特集を見る　
        </Link>

        {/* 人気記事セクション */}
        <div className="mt-6 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <h3 className="font-medium text-sm text-gray-800 mb-2 flex items-center">
            <span className="text-base mr-1">🔥</span>
            人気記事
          </h3>
          <div className="space-y-2">
            <Link href="/ai-sozai" className="block group">
              <div className="text-xs font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                AI素材とは？基本概念を解説
              </div>
            </Link>
            <Link href="/ai-sozai/commercial" className="block group">
              <div className="text-xs font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                商用利用時の注意点
              </div>
            </Link>
            <Link href="/request" className="block group">
              <div className="text-xs font-medium text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                イラストリクエスト方法
              </div>
            </Link>
          </div>
        </div>

        {/* 新着情報 */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <h3 className="font-medium text-sm text-gray-800 mb-2 flex items-center">
            <span className="text-base mr-1">🆕</span>
            新着情報
          </h3>
          <ul className="space-y-2">
            {updates.map((u, idx) => (
              <li key={idx} className="text-xs text-gray-700">
                <span className="font-semibold mr-2 text-gray-800">{u.date}</span>
                <span className="align-middle">{u.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* SNSリンク */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-sm text-gray-800 mb-2 flex items-center">
            <span className="text-base mr-1">👤</span>
            SNSアカウント
          </h3>
          <a
            href="https://twitter.com/ai_sozaiya"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-1.5 bg-black hover:bg-black/90 text-white text-xs rounded-md transition-colors duration-200"
          >
            <svg className="w-3 h-3 mr-1" viewBox="0 0 1200 1227" xmlns="http://www.w3.org/2000/svg">
              <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z" fill="white"/>
            </svg>
            Xで開く
          </a>
        </div>
      </div>
    </aside>
  );
}
