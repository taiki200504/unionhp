import React, { useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import SEO from './components/SEO';

// コンポーネント
import HeroSection from './components/home/HeroSection';
import CounterSection from './components/home/CounterSection';
import AboutSection from './components/home/AboutSection';
import MediaSection from './components/home/MediaSection';
import OrganizationsSection from './components/home/OrganizationsSection';
import ContactSection from './components/home/ContactSection';

const HomePage = () => {
  useEffect(() => {
    // スクロールを上部に戻す
    window.scrollTo(0, 0);
  }, []);

  // ホームページの構造化データ
  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "学生団体連合UNION",
    "description": "学生の声を社会に響かせる。学生団体と企業・社会をつなぐ架け橋となる学生メディア＆連合コミュニティ",
    "url": "https://union-student.jp",
    "logo": "https://union-student.jp/logo.png",
    "sameAs": [
      "https://twitter.com/UNION_gakusei",
      "https://www.instagram.com/union_gakusei/",
      "https://www.youtube.com/@UNION_gakusei"
    ]
  };

  return (
    <MainLayout>
      <SEO 
        title="ホーム"
        description="学生の声を社会に響かせる。学生団体と企業・社会をつなぐ架け橋となる学生メディア＆連合コミュニティ"
        structuredData={homeSchema}
      />
      <HeroSection />
      <CounterSection />
      <AboutSection />
      <MediaSection />
      <OrganizationsSection />
      <ContactSection />
    </MainLayout>
  );
};

export default HomePage; 