import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import MainLayout from './layouts/MainLayout';

const OrganizationsPage = () => {
  // 加盟団体データ（本来はAPIから取得）
  const [organizations, setOrganizations] = useState([
    { 
      id: 1, 
      name: "ONE JAPAN", 
      logo: "/logos/one-japan.png", 
      type: "起業家育成", 
      description: "日本の起業家精神を育む学生団体。イベントやワークショップを通じて起業家マインドを醸成。",
      members: 80,
      founded: "2018年",
      universities: ["東京大学", "慶應義塾大学", "早稲田大学", "他多数"],
      website: "https://onejapan.jp",
      social: {
        twitter: "https://twitter.com/onejapan",
        instagram: "https://instagram.com/onejapan"
      }
    },
    { 
      id: 2, 
      name: "アイセック", 
      logo: "/logos/aiesec.png", 
      type: "国際交流", 
      description: "世界126カ国に拠点を持つ国際学生団体。海外インターンシッププログラムを提供し、グローバルリーダーを育成。",
      members: 120,
      founded: "1948年",
      universities: ["全国の大学"],
      website: "https://aiesec.jp",
      social: {
        twitter: "https://twitter.com/aiesecjapan",
        instagram: "https://instagram.com/aiesecjapan"
      }
    },
    { 
      id: 3, 
      name: "キャリアサポート", 
      logo: "/logos/career-support.png", 
      type: "就活支援", 
      description: "学生による学生のためのキャリア支援団体。就活セミナーやES添削など、実践的なサポートを提供。",
      members: 50,
      founded: "2015年",
      universities: ["早稲田大学", "上智大学", "明治大学"],
      website: "https://career-support.jp",
      social: {
        twitter: "https://twitter.com/careersupport",
        instagram: "https://instagram.com/careersupport"
      }
    },
    { 
      id: 4, 
      name: "ドットジェイピー", 
      logo: "/logos/dot-jp.png", 
      type: "政治", 
      description: "政治の裾野を広げる活動を行う学生団体。インターンシップを通じて若者の政治参画を促進。",
      members: 100,
      founded: "2000年",
      universities: ["全国の大学"],
      website: "https://dot-jp.or.jp",
      social: {
        twitter: "https://twitter.com/dotjp",
        instagram: "https://instagram.com/dotjp"
      }
    },
    { 
      id: 5, 
      name: "ミライノカタチ", 
      logo: "/logos/mirai-no-katachi.png", 
      type: "メディア", 
      description: "学生の視点から社会課題を発信するメディア団体。記事やイベントを通じて若者の声を届ける。",
      members: 40,
      founded: "2019年",
      universities: ["立教大学", "法政大学", "青山学院大学"],
      website: "https://mirai-no-katachi.jp",
      social: {
        twitter: "https://twitter.com/miraino_katachi",
        instagram: "https://instagram.com/miraino_katachi"
      }
    },
    { 
      id: 6, 
      name: "SCORE", 
      logo: "/logos/score.png", 
      type: "教育支援", 
      description: "教育格差の解消を目指す学生団体。低所得家庭の子どもたちに無料で学習支援を提供。",
      members: 65,
      founded: "2017年",
      universities: ["東京大学", "京都大学", "名古屋大学"],
      website: "https://score-edu.org",
      social: {
        twitter: "https://twitter.com/score_edu",
        instagram: "https://instagram.com/score_edu"
      }
    },
    { 
      id: 7, 
      name: "グローバルビレッジ", 
      logo: "/logos/global-village.png", 
      type: "国際協力", 
      description: "国際協力・開発支援を行う学生団体。途上国での支援活動やスタディツアーを企画・実施。",
      members: 55,
      founded: "2012年",
      universities: ["筑波大学", "東京外国語大学", "上智大学"],
      website: "https://globalvillage.or.jp",
      social: {
        twitter: "https://twitter.com/globalvillage",
        instagram: "https://instagram.com/globalvillage"
      }
    },
    { 
      id: 8, 
      name: "TURE", 
      logo: "/logos/ture.png", 
      type: "環境保全", 
      description: "環境問題の解決に取り組む学生団体。清掃活動やエコイベントを通じて環境意識を高める。",
      members: 45,
      founded: "2016年",
      universities: ["東北大学", "一橋大学", "千葉大学"],
      website: "https://ture-eco.org",
      social: {
        twitter: "https://twitter.com/ture_eco",
        instagram: "https://instagram.com/ture_eco"
      }
    },
  ]);

  // フィルター機能
  const [selectedType, setSelectedType] = useState('all');
  const types = ['all', '起業家育成', '国際交流', '就活支援', '政治', 'メディア', '教育支援', '国際協力', '環境保全'];
  
  const filteredOrganizations = selectedType === 'all' 
    ? organizations 
    : organizations.filter(org => org.type === selectedType);

  useEffect(() => {
    // ページタイトルを設定
    document.title = '加盟団体 | 学生団体連合UNION';
    
    // スクロールを上部に戻す
    window.scrollTo(0, 0);
  }, []);

  return (
    <MainLayout>
      {/* ヒーローセクション */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              UNIONの<span className="text-gradient-primary">加盟団体</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              様々な分野で活動する全国の学生団体が集結しています
            </p>
          </div>
        </div>
      </section>

      {/* 統計セクション */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-3xl p-8 md:p-12 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <StatCard number="28" label="加盟団体数" />
              <StatCard number="512" label="加盟学生数" />
              <StatCard number="35+" label="参加大学数" />
            </div>
          </div>
        </div>
      </section>

      {/* 団体一覧セクション */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="text-gradient-primary">団体一覧</span>
          </h2>

          {/* フィルター */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {types.map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  selectedType === type 
                    ? 'bg-gradient-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'all' ? 'すべて' : type}
              </button>
            ))}
          </div>

          {/* 団体リスト */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganizations.map(org => (
              <OrganizationCard key={org.id} organization={org} />
            ))}
          </div>
        </div>
      </section>

      {/* 加盟のメリットセクション */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="text-gradient-primary">加盟のメリット</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BenefitCard 
              icon="fas fa-bullhorn"
              title="メディア露出"
              description="UNIONの各種メディアで団体の活動を紹介し、認知度向上をサポートします。"
            />
            <BenefitCard 
              icon="fas fa-users"
              title="団体間連携"
              description="様々な分野の学生団体との交流や連携を通じて、新しい価値を創出できます。"
            />
            <BenefitCard 
              icon="fas fa-building"
              title="企業連携"
              description="UNIONを通じて企業との連携機会を得ることができます。"
            />
            <BenefitCard 
              icon="fas fa-calendar-alt"
              title="イベント開催"
              description="合同イベントの開催やプロモーション支援を受けることができます。"
            />
            <BenefitCard 
              icon="fas fa-graduation-cap"
              title="スキルアップ"
              description="勉強会やワークショップを通じて、運営スキルを向上させることができます。"
            />
            <BenefitCard 
              icon="fas fa-handshake"
              title="メンバー獲得"
              description="UNIONの広報を通じて、新規メンバー獲得のチャンスが広がります。"
            />
          </div>
        </div>
      </section>

      {/* 加盟申し込みセクション */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            <span className="text-gradient-primary">あなたの団体も加盟しませんか？</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            UNIONは随時加盟団体を募集しています。
            詳細や申し込み方法については、加盟ページをご覧ください。
          </p>
          <Link 
            href="/join" 
            className="bg-gradient-primary text-white px-8 py-3 rounded-full hover:opacity-90 transition inline-flex items-center"
          >
            <span>加盟について詳しく見る</span>
            <i className="fas fa-arrow-right ml-2"></i>
          </Link>
        </div>
      </section>
    </MainLayout>
  );
};

// 統計カードコンポーネント
const StatCard = ({ number, label }) => (
  <div>
    <div className="text-4xl md:text-5xl font-bold mb-2 text-gradient-primary">{number}</div>
    <div className="text-gray-600">{label}</div>
  </div>
);

// 団体カードコンポーネント
const OrganizationCard = ({ organization }) => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100">
    <div className="p-6">
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 mr-4 flex-shrink-0 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
          <img 
            src={organization.logo || "/logos/placeholder.png"} 
            alt={organization.name} 
            className="max-w-full max-h-full object-contain"
            onError={(e) => { e.target.src = "/logos/placeholder.png" }}
          />
        </div>
        <div>
          <h3 className="text-xl font-bold">{organization.name}</h3>
          <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
            {organization.type}
          </span>
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {organization.description}
      </p>
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div className="flex items-center text-gray-600">
          <i className="fas fa-users mr-2 text-blue-500"></i>
          <span>{organization.members}名</span>
        </div>
        <div className="flex items-center text-gray-600">
          <i className="fas fa-calendar-alt mr-2 text-blue-500"></i>
          <span>設立: {organization.founded}</span>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          {organization.social.twitter && (
            <a 
              href={organization.social.twitter} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 hover:text-blue-400 transition"
            >
              <i className="fab fa-twitter"></i>
            </a>
          )}
          {organization.social.instagram && (
            <a 
              href={organization.social.instagram} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 hover:text-pink-500 transition"
            >
              <i className="fab fa-instagram"></i>
            </a>
          )}
        </div>
        <a 
          href={organization.website} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
        >
          <span>詳細を見る</span>
          <i className="fas fa-external-link-alt ml-1"></i>
        </a>
      </div>
    </div>
  </div>
);

// メリットカードコンポーネント
const BenefitCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
    <div className="text-4xl text-gradient-primary mb-4">
      <i className={icon}></i>
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

export default OrganizationsPage; 