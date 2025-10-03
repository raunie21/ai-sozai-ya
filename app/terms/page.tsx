'use client';

import { useState } from 'react';

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState('usage');

  const sections = [
    { id: 'usage', label: '利用規約', icon: '📋' },
    { id: 'license', label: 'ライセンス', icon: '⚖️' },
    { id: 'copyright', label: '著作権', icon: '©️' },
    { id: 'disclaimer', label: '免責事項', icon: '⚠️' },
    { id: 'contact', label: 'お問い合わせ', icon: '📧' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">利用規約</h1>
            <a 
              href="/" 
              className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              ホームに戻る
            </a>
          </div>
        </div>
      </header>

      <main className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-2xl md:text-4xl font-bold text-center text-gray-800 mb-8 md:mb-12">
            利用規約
          </h1>

          {/* Tab Navigation */}
          <div className="mb-8">
            {/* デスクトップ表示 */}
            <div className="hidden lg:flex justify-center">
              <div className="bg-white rounded-2xl p-2 border border-gray-200 shadow-sm">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`px-6 py-3 rounded-xl transition-all duration-200 mx-1 whitespace-nowrap ${
                      activeSection === section.id
                        ? 'bg-gray-800 text-white shadow-sm'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{section.icon}</span>
                    {section.label}
                  </button>
                ))}
              </div>
            </div>

            {/* タブレット表示 */}
            <div className="hidden md:flex lg:hidden justify-center">
              <div className="grid grid-cols-3 gap-2 w-full max-w-2xl">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                      activeSection === section.id
                        ? 'bg-gray-800 text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg">{section.icon}</span>
                      <span className="font-medium">{section.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* モバイル表示 */}
            <div className="md:hidden space-y-2">
              {/* 最初の3つを1行目に配置 */}
              <div className="grid grid-cols-3 gap-2">
                {sections.slice(0, 3).map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`px-2 py-2 rounded-lg transition-all duration-200 text-xs ${
                      activeSection === section.id
                        ? 'bg-gray-800 text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </div>
              
              {/* 最後の2つを2行目に中央配置 */}
              <div className="flex justify-center gap-2">
                {sections.slice(3, 5).map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`px-3 py-2 rounded-lg transition-all duration-200 text-xs ${
                      activeSection === section.id
                        ? 'bg-gray-800 text-white shadow-sm'
                        : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl p-4 md:p-8 shadow-sm border border-gray-200">
            {activeSection === 'usage' && (
              <div className="space-y-6">
                <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">利用規約</h2>
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-3">1. 利用条件</h3>
                  <p className="text-gray-600 mb-4">
                    本サイトで提供されるイラスト素材は、個人利用・商用利用を問わずご利用いただけます。
                    ただし、以下の条件を遵守してください。
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">2. 利用可能な用途</h3>
                  <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                    <li>Webサイト・アプリケーションのデザイン</li>
                    <li>印刷物・パンフレット・チラシ</li>
                    <li>商品パッケージ・広告素材</li>
                    <li>ソーシャルメディア投稿</li>
                    <li>その他の商業的利用</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">3. YouTubeでの使用時（必須要件）</h3>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                    <p className="text-red-700 font-medium mb-3">
                      ⚠️ YouTubeで使用する場合は、以下のクレジット表記が<strong>必須</strong>です：
                    </p>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-600 mb-2">動画の概要欄に以下のテキストを必ず記載してください：</p>
                      <div className="bg-gray-100 p-3 rounded border font-mono text-sm">
                        <div className="text-gray-800">
                          <div>🎨 イラスト素材提供：AIそざいや</div>
                          <div>🌐 サイトURL：https://www.ai-sozaiya.com</div>
                          <div>📱 無料ダウンロード可能</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-red-600 text-sm font-medium">
                      この要件を満たさない場合、素材の使用を禁止します。
                    </p>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">4. 禁止事項</h3>
                  <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                    <li>素材の再配布・販売</li>
                    <li>素材の改変・加工後の再配布</li>
                    <li>違法な用途での利用</li>
                    <li>他者の権利を侵害する利用</li>
                    <li>YouTubeでの使用時にクレジット表記を怠ること</li>
                  </ul>
                </div>
              </div>
            )}

            {activeSection === 'license' && (
              <div className="space-y-6">
                <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">ライセンス</h2>
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">ライセンスの種類</h3>
                  <p className="text-gray-600 mb-4">
                  本サイトの利用許諾範囲 
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">利用許諾範囲</h3>
                  <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                    <li>利用の基本原則 ・著作権は当サイトが保有します。 </li>
                    <li>商用利用、個人利用ともに無料です。</li>
                    <li>改変・加工は自由です。</li>
                    <li>禁止事項 ・素材をそのまま、または加工しての再配布、転売、譲渡は一切禁止します。</li>
                    <li> 素材そのものを主体とする商品（グッズなど）の販売・配布は禁止します。</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">利用時の推奨事項</h3>
                  <p className="text-gray-600 mb-4">
                    法的な義務はありませんが、可能であれば素材の出典を明記していただけると幸いです。
                    また、素材を改変した場合は、その旨を明記することをお勧めします。
                  </p>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">YouTubeでの使用時（必須）</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-gray-700 font-medium mb-3">
                      YouTubeで使用する場合は、以下のクレジット表記が<strong>必須</strong>です：
                    </p>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-600 mb-2">概要欄に以下のテキストをコピー&ペーストしてください：</p>
                      <div className="bg-gray-100 p-3 rounded border font-mono text-sm">
                        <div className="text-gray-800">
                          <div>イラスト素材提供：AIそざいや</div>
                          <div>サイトURL：https://www.ai-sozaiya.com</div>
                          <div>無料ダウンロード可能</div>
                        </div>
                      </div>
                    </div>
                    <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                      <li>YouTube動画の概要欄（説明文）に記載</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'copyright' && (
              <div className="space-y-6">
                <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">著作権</h2>
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">著作権について</h3>
                  <p className="text-gray-600 mb-4">
                    利用者は自由に素材を利用できますが、著作権は当サイトが保有しております。
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">利用者の権利</h3>
                  <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                    <li>素材の自由な利用</li>
                    <li>素材の改変・加工</li>
                    <li>商用利用</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">注意事項</h3>
                  <p className="text-gray-600 mb-4">
                    素材の利用により生じた問題について、当サイトは一切の責任を負いません。
                    利用者は自己の責任において素材を利用してください。
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'disclaimer' && (
              <div className="space-y-6">
                <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">免責事項</h2>
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">責任の範囲</h3>
                  <p className="text-gray-600 mb-4">
                    当サイトで提供されるイラスト素材の利用により生じた問題について、
                    当サイトは一切の責任を負いません。
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">素材の品質</h3>
                  <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                    <li>素材の品質について保証しません</li>
                    <li>素材の継続的な提供を保証しません</li>
                    <li>素材の内容・表現について保証しません</li>
                    <li>素材の適合性について保証しません</li>
                  </ul>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">利用者の責任</h3>
                  <p className="text-gray-600 mb-4">
                    素材の利用は利用者の自己責任で行ってください。
                    素材の内容を確認し、適切な用途でご利用ください。
                  </p>
                </div>
              </div>
            )}

            {activeSection === 'contact' && (
              <div className="space-y-6">
                <h2 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-6">お問い合わせ</h2>
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">お問い合わせ方法</h3>
                  <p className="text-gray-600 mb-4">
                    素材の利用に関するご質問やご不明な点がございましたら、
                    以下の方法でお気軽にお問い合わせください。
                  </p>
                  
                  <h3 className="text-xl font-semibold text-gray-700 mb-3">連絡先</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📧</span>
                      <div>
                        <p className="font-semibold text-gray-700">メールアドレス</p>
                        <p className="text-gray-600">aisozaiya@ai-sozaiya.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🌐</span>
                      <div>
                        <p className="font-semibold text-gray-700">Webサイト</p>
                        <p className="text-gray-600">https://www.ai-sozaiya.com</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⏰</span>
                      <div>
                        <p className="font-semibold text-gray-700">対応時間</p>
                        <p className="text-gray-600">平日 9:00-18:00（土日祝日除く）</p>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-700 mb-3">お問い合わせ内容</h3>
                  <p className="text-gray-600 mb-4">
                    以下の内容についてお問い合わせいただけます：
                  </p>
                  <ul className="list-disc list-inside text-gray-600 mb-4 space-y-2">
                    <li>素材の利用方法について</li>
                    <li>ライセンスについて</li>
                    <li>その他のご質問</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 text-sm">最終更新日: 2025年1月26日</p>
          </div>
        </div>
      </main>
    </div>
  );
}
