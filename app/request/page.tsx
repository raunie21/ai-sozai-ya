export default function RequestPage() {
  const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSfRhZemBKWEHMdUH4rdFgAWc4jtkvqKrzhUe_74Boy0bWz5Rg/viewform?usp=header';

  return (
    <main className="min-h-screen bg-white py-16">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">イラストのリクエスト</h1>
        <p className="text-gray-600 mb-8">
          欲しいイラストの内容をお知らせください。回答はGoogleフォームに保存され、後からスプレッドシートとしてエクスポートできます。
        </p>
        <iframe
          src={formUrl}
          className="w-full h-[1200px] border rounded-xl shadow"
          title="request-form"
        />
      </div>
    </main>
  );
}


