import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const AboutSection = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* 画像 */}
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <Image
              src="/images/photo/union.about.png"
              alt="UNIONについて"
              fill
              style={{ objectFit: 'cover' }}
            />
          </div>

          {/* コンテンツ */}
          <div>
            <h2 className="text-3xl font-bold mb-6">UNIONについて</h2>
            <p className="text-gray-600 mb-6">
              UNIONは、学生の声を社会に響かせることを目的とした学生団体連合です。
              学生団体と企業・社会をつなぐ架け橋となり、学生の可能性を最大限に引き出す
              プラットフォームを提供しています。
            </p>
            <p className="text-gray-600 mb-8">
              メディア活動やイベント開催を通じて、学生の声を社会に届け、
              より良い社会の実現に貢献することを目指しています。
            </p>
            <Link
              href="/about"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              詳しく見る
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection; 