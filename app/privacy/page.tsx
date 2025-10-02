import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'プライバシーポリシー | AIそざいや',
  description: 'AIそざいやのプライバシーポリシーについて',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">プライバシーポリシー</h1>
        
        <div className="prose max-w-none">
          <p className="text-gray-700 mb-4">
            最終更新日: {new Date().toLocaleDateString('ja-JP')}
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">1. 個人情報の収集について</h2>
          <p className="text-gray-700 mb-4">
            当サイトでは、Google AdSenseによる広告配信を行っており、ユーザーの行動を分析するためにCookieを使用しています。
            また、Google Analyticsを使用してサイトの利用状況を分析しています。
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">2. Cookieについて</h2>
          <p className="text-gray-700 mb-4">
            当サイトでは、以下の目的でCookieを使用しています：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li>広告の配信と効果測定</li>
            <li>サイトの利用状況の分析</li>
            <li>ユーザー体験の向上</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">3. 第三者による情報収集</h2>
          <p className="text-gray-700 mb-4">
            当サイトでは、以下の第三者サービスを使用しています：
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
            <li><strong>Google AdSense:</strong> 広告配信と効果測定</li>
            <li><strong>Google Analytics:</strong> サイト利用状況の分析</li>
          </ul>
          <p className="text-gray-700 mb-4">
            これらのサービスは、独自のプライバシーポリシーに従って情報を収集・使用します。
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">4. 広告について</h2>
          <p className="text-gray-700 mb-4">
            当サイトでは、Google AdSenseによる広告を表示しています。
            これらの広告は、ユーザーの興味に基づいて配信される場合があります。
            広告の配信を停止したい場合は、Googleの広告設定ページで設定を変更できます。
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">5. データの保存期間</h2>
          <p className="text-gray-700 mb-4">
            収集されたデータは、各サービスの利用規約に従って保存されます。
            詳細については、各サービスのプライバシーポリシーをご確認ください。
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">6. お問い合わせ</h2>
          <p className="text-gray-700 mb-4">
            プライバシーポリシーに関するご質問がございましたら、
            <a href="mailto:aisozaiya@ai-sozai.com" className="text-blue-600 hover:text-blue-700">
              aisozaia@ai-sozai.com
            </a>
            までお問い合わせください。
          </p>

          <h2 className="text-2xl font-semibold text-gray-800 mb-4 mt-8">7. プライバシーポリシーの変更</h2>
          <p className="text-gray-700 mb-4">
            当サイトは、必要に応じて本プライバシーポリシーを変更する場合があります。
            変更があった場合は、このページでお知らせいたします。
          </p>
        </div>
      </div>
    </div>
  );
}
