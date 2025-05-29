import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center bg-gray-900 text-white">
      {/* 背景画像 */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/photo/union.concept.png"
          alt="UNION Hero Background"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          学生の声を社会に響かせる
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
          学生団体と企業・社会をつなぐ架け橋となる
          <br />
          学生メディア＆連合コミュニティ
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/about"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            UNIONについて
          </Link>
          <Link
            href="/contact"
            className="bg-white hover:bg-gray-100 text-gray-900 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            お問い合わせ
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 