import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const MediaSection = () => {
  const mediaItems = [
    {
      title: '学生インタビュー',
      description: '様々な分野で活躍する学生の声を発信',
      image: '/images/photo/union-logotype1.png',
      link: '/media/interviews'
    },
    {
      title: 'イベントレポート',
      description: 'UNION主催イベントの様子をレポート',
      image: '/images/photo/union-logotype2.png',
      link: '/media/events'
    },
    {
      title: 'コラム',
      description: '学生目線での社会問題への提言',
      image: '/images/photo/union-logotype3.png',
      link: '/media/columns'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">メディア活動</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mediaItems.map((item, index) => (
            <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
              <div className="relative h-48">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <Link
                  href={item.link}
                  className="text-blue-600 hover:text-blue-700 font-semibold"
                >
                  詳しく見る →
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link
            href="/media"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            メディア一覧を見る
          </Link>
        </div>
      </div>
    </section>
  );
};

export default MediaSection; 