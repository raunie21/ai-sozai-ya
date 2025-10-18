import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'お問い合わせ | AIそざいや',
  description: 'AIそざいやへのお問い合わせページ。素材の利用、商用利用、転載、その他ご質問はこちらからご連絡ください。',
  alternates: { canonical: 'https://www.ai-sozaiya.com/contact' },
};

export default function ContactPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">お問い合わせ</h1>
      <p className="text-gray-700 mb-6">素材の利用、商用利用、転載、その他ご質問は以下よりご連絡ください。</p>

      <div className="space-y-4">
        <a
          href="mailto:aisozaiya@ai-sozai.com?subject=%E3%81%8A%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B&body=%E3%81%8A%E5%90%8D%E5%89%8D%EF%BC%9A%0A%E3%81%94%E7%94%A8%E4%BB%B6%EF%BC%9A"
          className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition"
        >
          メールで問い合わせる
        </a>
        <div className="text-gray-600">
          または、<a href="/ai-sozai/how-to" className="text-blue-600 hover:underline">AI素材 使い方</a>や
          <a href="/terms" className="text-blue-600 hover:underline ml-1">利用規約</a>もご確認ください。
        </div>
      </div>
    </main>
  );
}


