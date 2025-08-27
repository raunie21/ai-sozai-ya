'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Illustration } from '../types/illustration';

// Swiper CSS
import 'swiper/css';

interface ImageSlideshowProps {
  illustrations: Illustration[];
}

export default function ImageSlideshow({ illustrations }: ImageSlideshowProps) {
  // 最近追加された10個の画像を取得（IDが大きい順）
  const recentImages = illustrations
    .sort((a, b) => b.id - a.id)
    .slice(0, 10);

  if (recentImages.length === 0) {
    return null;
  }

  // 4個ずつのグループに分割
  const imageGroups = [];
  for (let i = 0; i < recentImages.length; i += 4) {
    imageGroups.push(recentImages.slice(i, i + 4));
  }

  return (
    <section className="bg-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* スワイパー */}
        <Swiper
          modules={[Autoplay]}
          spaceBetween={10}
          slidesPerView={1}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          speed={2000}
          loop={true}
          className="swiper-container"
        >
          {imageGroups.map((group, groupIndex) => (
            <SwiperSlide key={groupIndex}>
              <div className="grid grid-cols-4 gap-4">
                {group.map((illustration) => (
                  <div
                    key={illustration.id}
                    className="relative bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                  >
                    <div className="aspect-square relative">
                      {illustration.imageUrl ? (
                        <img
                          src={illustration.imageUrl}
                          alt={illustration.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <span className="text-2xl text-gray-400">📷</span>
                        </div>
                      )}
                      
                      {/* オーバーレイ情報 */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3">
                        <h3 className="text-sm font-bold text-white mb-1 truncate">
                          {illustration.title}
                        </h3>
                        <p className="text-white/90 text-xs truncate">
                          {illustration.tags?.slice(0, 2).join(' • ')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
