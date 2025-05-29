import React from 'react';
import Link from 'next/link';

const AboutSection = () => {
  return (
    <section id="about" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="section-title">About us</h2>
        
        <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-3xl p-8 md:p-12 mb-12 shadow-sm">
          <div className="text-center max-w-3xl mx-auto mb-8">
            <h3 className="text-3xl font-bold mb-6">
              <span className="text-gradient-primary">学生から熱狂を生み出せる世界を作る</span>
            </h3>
            <p className="text-lg text-gray-700 leading-relaxed">
              UNIONは、「学生の声を社会に響かせる」をミッションに掲げ、
              <br className="hidden md:block" />
              学生団体と企業・社会をつなぐ架け橋となります。
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon="fas fa-podcast"
              title="メディア発信"
              description="Podcast、YouTube、SNSなど複数の媒体を通じて学生の活動や思いを発信します。"
            />
            
            <FeatureCard 
              icon="fas fa-users"
              title="コミュニティ形成"
              description="学生団体間の連携促進や交流の場を提供し、学生同士のつながりを創出します。"
            />
            
            <FeatureCard 
              icon="fas fa-handshake"
              title="社会連携"
              description="企業・団体と学生をつなぎ、社会に学生の声を届けるハブ機能を果たします。"
            />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2">
            <h3 className="text-2xl font-bold text-gradient-primary mb-6">UNIONの目指す未来</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              今の日本社会は自分の行動で、国や社会を変えられると思える若者が少ない状況にあります。しかし、学生団体は社会を動かすタネを秘めています。
            </p>
            <p className="text-gray-700 leading-relaxed">
              UNIONは学生活動の旗振り役・広告塔として、学生のサポートを行うことで、
              <span className="font-bold">学生から変えようとする空気感・世界観を作り出す</span>
              未来を目指します。
            </p>
            <div className="mt-6">
              <Link 
                href="/about" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                理念・ビジョンの詳細を見る <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </div>
          </div>
          
          <div className="md:w-1/2 relative">
            <div className="relative overflow-hidden rounded-xl shadow-lg bg-white min-h-[320px]">
              <img 
                src="/union.about.png" 
                alt="UNIONの目指す未来" 
                className="w-full block min-h-[240px] md:min-h-[320px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60 z-20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 z-30 flex flex-col">
                <div className="font-bold text-xl mb-2 text-white drop-shadow">学生の声を社会の力に</div>
                <p className="text-white text-sm mb-4 drop-shadow">学生発のムーブメントを、次の時代の原動力に</p>
                <Link 
                  href="/about" 
                  className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm hover:bg-white/30 transition"
                >
                  <span>ビジョンを詳しく見る</span>
                  <i className="fas fa-arrow-right ml-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// 特徴カードコンポーネント
const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm transform transition hover:-translate-y-1 hover:shadow-md">
    <div className="text-4xl text-gradient-primary mb-4">
      <i className={icon}></i>
    </div>
    <h4 className="text-xl font-bold mb-2">{title}</h4>
    <p className="text-gray-600">
      {description}
    </p>
  </div>
);

export default AboutSection; 