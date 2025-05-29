import React from 'react';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className="pt-24 pb-12 md:pt-32 md:pb-20 bg-gradient-to-b from-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            学生の声を届ける<br />
            <span className="text-gradient-primary">学生メディア＆連合コミュニティ</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">
            「学生のリアルな声を届ける」を軸に立ち上がった学生団体
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <Link href="/join" className="bg-gradient-primary text-white px-8 py-3 rounded-full hover:opacity-90 transition">
              加盟する
            </Link>
            <Link href="/contact" className="bg-white text-gray-800 border-2 border-gray-300 px-8 py-3 rounded-full hover:bg-gray-100 transition">
              お問い合わせ
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 