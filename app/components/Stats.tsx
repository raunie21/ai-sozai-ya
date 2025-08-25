'use client';

export default function Stats() {
  const stats = [
    { number: '15,000+', label: 'イラスト総数' },
    { number: '500+', label: '毎月更新' },
    { number: '100%', label: '商用利用OK' },
    { number: '0円', label: '完全無料' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white p-8 rounded-3xl text-center transition-all duration-300 relative overflow-hidden group hover:-translate-y-2 hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/30"
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          
          <span className="text-4xl font-bold block mb-2 relative z-10">
            {stat.number}
          </span>
          <span className="text-lg relative z-10">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}
