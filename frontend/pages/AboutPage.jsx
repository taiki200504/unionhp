import React, { useEffect } from 'react';
import Link from 'next/link';
import MainLayout from './layouts/MainLayout';
import OptimizedImage from '../components/OptimizedImage';
import AnimatedElement from '../components/AnimatedElement';
import SEO from '../components/SEO';

const AboutPage = () => {
  useEffect(() => {
    // スクロールを上部に戻す
    window.scrollTo(0, 0);
  }, []);

  // 構造化データ（Organization）
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "学生団体連合UNION",
    "description": "学生の声を社会に響かせる。学生団体と企業・社会をつなぐ架け橋となる学生メディア＆連合コミュニティ",
    "url": "https://union-student.jp",
    "logo": "https://union-student.jp/logo.png",
    "foundingDate": "2022-04",
    "sameAs": [
      "https://twitter.com/UNION_gakusei",
      "https://www.instagram.com/union_gakusei/",
      "https://www.youtube.com/@UNION_gakusei"
    ]
  };

  return (
    <MainLayout>
      <SEO 
        title="About"
        description="UNIONの理念・ビジョン・戦略。学生の声を社会に響かせ、ムーブメントを起こす学生団体連合UNIONの紹介ページ。"
        canonical="/about"
        structuredData={organizationSchema}
      />

      {/* ヒーローセクション */}
      <section className="relative bg-cover bg-center text-white py-28 mb-12 hero-section" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`}}>
        <div className="absolute bg-blue-500 w-96 h-96 -top-48 -left-48 rounded-full opacity-15 blur-3xl animate-pulse" style={{zIndex: 1}} />
        <div className="absolute bg-pink-500 w-64 h-64 -bottom-32 -right-32 rounded-full opacity-15 blur-3xl animate-pulse" style={{zIndex: 1, animationDelay: '1s'}} />
        <div className="hero-content max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="section-title mb-4 inline-block bg-gradient-to-r from-blue-100 to-pink-100 text-gray-800 font-bold rounded-full px-6 py-2">UNION Philosophy</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">理念・ビジョン・戦略</h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed">
            学生の声を社会に響かせ<br className="hidden md:block" />
            ムーブメントを起こす
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-pink-500" />
      </section>

      <div className="wave-divider bg-white -mt-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
          <path fill="#f8fafc" d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,48C840,43,960,53,1080,58.7C1200,64,1320,64,1380,64L1440,64L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path>
        </svg>
      </div>

      <main className="max-w-5xl mx-auto px-4 pb-16">
        {/* Purpose セクション */}
        <SectionDivider title="Purpose" />
        <section className="mb-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 md:p-12 mt-10 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-primary opacity-5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-primary opacity-5 rounded-full translate-y-1/3 -translate-x-1/3" />
          <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-md">
                <i className="fas fa-star text-white text-xl"></i>
              </div>
              <span className="text-2xl text-gradient-primary font-medium">Why we need</span>
            </div>
            <div className="flex-grow">
              <h3 className="text-3xl font-bold mb-6 text-gray-900">学生から熱狂を生み出せる世界を作る。</h3>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>今の日本社会は自分の行動で、国や社会を変えられると思うことができる若者が少ない。</p>
                <p>そんな社会の中で、学生団体は社会を動かすタネを秘めていると思う。しかし課題として、情報伝達手段がない。そこで我々UNIONが学生活動の旗振り役・広告塔として、学生のサポートを行うことで、『<span className="font-bold">学生から変えようとする空気感・世界観を作り出す</span>』未来を目指す。</p>
              </div>
            </div>
          </div>
        </section>
        {/* Mission セクション */}
        <SectionDivider title="Mission" />
        <section className="mb-20 bg-gradient-to-br from-pink-50 to-pink-100 rounded-3xl p-8 md:p-12 mt-10 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-primary opacity-5 rounded-full -translate-y-1/2 -translate-x-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-primary opacity-5 rounded-full translate-y-1/3 translate-x-1/3" />
          <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-md">
                <i className="fas fa-bullhorn text-white text-xl"></i>
              </div>
              <span className="text-2xl text-gradient-primary font-medium">What we do</span>
            </div>
            <div className="flex-grow">
              <h3 className="text-3xl font-bold mb-6 text-gray-900">学生の声を社会に響かせる。</h3>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>学生団体連合UNIONは、このMissionを通して、学生・学生団体同士の連携を強化し、情報共有や共同イベントの開催、人材育成を促進します。また、学生・学生団体の影響力を集約し、イベントの告知や広報を我々のメディアを通して行うことで学生の声を多くの人に届けます。</p>
              </div>
            </div>
          </div>
        </section>
        {/* Vision セクション */}
        <SectionDivider title="Vision" />
        <section className="mb-20 bg-gradient-to-br from-purple-50 to-indigo-100 rounded-3xl p-8 md:p-12 mt-10 shadow-sm overflow-hidden relative">
          <div className="absolute right-0 w-64 h-64 bg-gradient-primary opacity-5 rounded-full -translate-x-1/4 -translate-y-1/4" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-primary opacity-5 rounded-full translate-y-1/3 translate-x-1/3" />
          <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-md">
                <i className="fas fa-binoculars text-white text-lg"></i>
              </div>
              <span className="text-lg text-gradient-primary font-medium">Where we go</span>
            </div>
            <div className="flex-grow">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                  <h4 className="text-xl font-bold mb-3 text-indigo-900">大ゴール(10年)</h4>
                  <p className="text-gray-700 leading-relaxed">学生発のムーブメントが、世の中を動かす『時代』をつくる。</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                  <h4 className="text-xl font-bold mb-3 text-indigo-700">中ゴール(5年)</h4>
                  <p className="text-gray-700 leading-relaxed">学生の挑戦が、社会の中で当たり前に受け入れられる『文化』をつくる。</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                  <h4 className="text-xl font-bold mb-3 text-indigo-500">小ゴール(1年)</h4>
                  <p className="text-gray-700 leading-relaxed">学生同士がつながり、互いに影響を与え合う『場』をつくる。</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Values セクション */}
        <SectionDivider title="Values" />
        <section className="mb-20 bg-gradient-to-br from-green-50 to-blue-50 rounded-3xl p-8 md:p-12 mt-10 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-primary opacity-5 rounded-full -translate-y-1/2 -translate-x-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-primary opacity-5 rounded-full translate-y-1/3 translate-x-1/3" />
          <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-md">
                <i className="fas fa-compass text-white text-lg"></i>
              </div>
              <span className="text-lg text-gradient-primary font-medium">How to do</span>
            </div>
            <div className="flex-grow">
              <div className="grid md:grid-cols-3 gap-6">
                <ValueCard
                  color="blue"
                  letter="C"
                  title="Collaboration"
                  subtitle="学生団体同士の連携を深め、共に成長し合う環境を作ります。"
                />
                <ValueCard
                  color="pink"
                  letter="I"
                  title="Impact"
                  subtitle="学生の声を広く届けることで、社会にポジティブな変化をもたらします。"
                />
                <ValueCard
                  color="purple"
                  letter="S"
                  title="Synergy"
                  subtitle="活躍する若者や団体が集い「熱狂」が生まれる場所を創出する。"
                />
              </div>
            </div>
          </div>
        </section>
        {/* About Us セクション */}
        <SectionDivider title="About Us" />
        <section className="mb-20 bg-gray-50 rounded-2xl p-8 md:p-12 mt-12">
          <div className="md:flex gap-12 items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h3 className="text-2xl font-bold mb-6 text-gradient-primary">学生団体連合UNIONとは</h3>
              <p className="text-gray-700 mb-4 leading-relaxed">
                UNIONは「学生のリアルな声を届ける」を軸に立ち上がった学生団体連合体です。
                学生向けにメディア型コミュニティを運営し、学生・学生団体の活動や活躍する若者を紹介・情報発信しています。
              </p>
              <p className="text-gray-700 leading-relaxed">
                学生の輪を広めていくことで、「学生の力で社会を変えていく」そのためのハブ団体として活動しています。
                公式Podcast、YouTubeチャンネル、各種SNSなどのメディアを通じて情報発信を行い、学生の声を社会に届けています。
              </p>
            </div>
            <div className="md:w-1/2">
              <img src="/union-logotype2.png" alt="UNION" className="w-full rounded-lg shadow-md" />
            </div>
          </div>
        </section>
        {/* Activities セクション */}
        <SectionDivider title="Activities" />
        <section className="grid md:grid-cols-2 gap-8 mt-12">
          <ActivityCard icon="fas fa-microphone" title="メディア発信" desc="学生・学生団体の活動紹介、Podcast配信、YouTube動画、SNS発信など複数のチャネルを通じて学生の声を届けます。" />
          <ActivityCard icon="fas fa-users" title="コミュニティ運営" desc="学生団体同士の交流・マッチング支援、Slackコミュニティの運営、定期ミートアップの開催などを通じて学生の輪を広げます。" />
          <ActivityCard icon="fas fa-handshake" title="企業・団体連携" desc="企業・団体とのコラボイベント企画、学生と企業のマッチング、共同プロジェクトなどを通じて学生と社会をつなぎます。" />
          <ActivityCard icon="fas fa-graduation-cap" title="人材育成" desc="学生向けインターン・プロジェクト紹介、リーダー向け1on1カウンセリング、スキルアップ支援など、学生の成長を促進する機会を提供します。" />
          <ActivityCard icon="fas fa-bullhorn" title="情報発信" desc="学生に関連するニュース・トピックの発信、学内外の情報提供、公式SNSやポッドキャストを通じた学生の声の拡散を行います。" />
          <ActivityCard icon="fas fa-comments" title="コミュニティ形成" desc="Slackコミュニティの運営、定期ミートアップの開催、団体間交流の促進など、学生同士がつながり影響を与え合う場を提供します。" />
        </section>
        <div className="text-center mt-12">
          <Link href="/join" className="inline-block bg-gradient-primary text-white px-8 py-4 rounded-full hover:shadow-lg transition transform hover:-translate-y-1 duration-300">
            <i className="fas fa-arrow-right-to-bracket mr-2"></i>
            UNIONに参加する
          </Link>
        </div>
      </main>
    </MainLayout>
  );
};

// セクションタイトル用
const SectionDivider = ({ title }) => (
  <div className="section-divider flex items-center my-16">
    <div className="section-divider-line flex-grow h-0.5 bg-gradient-to-r from-blue-600 to-pink-500" />
    <h2 className="section-divider-text px-6 font-bold text-2xl md:text-3xl">{title}</h2>
    <div className="section-divider-line flex-grow h-0.5 bg-gradient-to-r from-blue-600 to-pink-500" />
  </div>
);

// Valueカード
const ValueCard = ({ color, letter, title, subtitle }) => {
  const colorMap = {
    blue: 'border-blue-500 text-blue-600',
    pink: 'border-pink-500 text-pink-600',
    purple: 'border-purple-500 text-purple-600',
  };
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm relative border-t-4 hover:transform hover:scale-105 transition-all duration-300 ${colorMap[color]}`}>
      <span className={`absolute text-8xl opacity-10 font-bold right-4 bottom-0 ${colorMap[color]}`}>{letter}</span>
      <h4 className={`text-xl font-bold mb-3 ${colorMap[color]}`}>{title}</h4>
      <p className="text-gray-700 leading-relaxed relative z-10">{subtitle}</p>
    </div>
  );
};

// Activityカード
const ActivityCard = ({ icon, title, desc }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-start gap-4">
    <div className="activity-icon flex-shrink-0 rounded-full bg-gradient-primary flex items-center justify-center text-white w-12 h-12 text-xl">
      <i className={icon}></i>
    </div>
    <div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-700">{desc}</p>
    </div>
  </div>
);

export default AboutPage; 