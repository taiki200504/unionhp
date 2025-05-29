import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '../../services/api';
import OptimizedImage from '../OptimizedImage';
import AnimatedElement from '../AnimatedElement';

const OrganizationsSection = () => {
  // 団体データの状態管理
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // APIからデータを取得
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoading(true);
        const data = await api.getOrganizations();
        // 表示用に最初の6件のみ使用
        setOrganizations(data.slice(0, 6));
      } catch (err) {
        console.error('Failed to fetch organizations:', err);
        setError('団体情報の読み込みに失敗しました');
        // エラー時はダミーデータを使用
        setOrganizations([
          { id: 1, name: "ONE JAPAN", logo: "/logos/one-japan.png", type: "起業家育成", link: "/organizations/one-japan" },
          { id: 2, name: "アイセック", logo: "/logos/aiesec.png", type: "国際交流", link: "/organizations/aiesec" },
          { id: 3, name: "キャリアサポート", logo: "/logos/career-support.png", type: "就活支援", link: "/organizations/career-support" },
          { id: 4, name: "ドットジェイピー", logo: "/logos/dot-jp.png", type: "政治", link: "/organizations/dot-jp" },
          { id: 5, name: "ミライノカタチ", logo: "/logos/mirai-no-katachi.png", type: "メディア", link: "/organizations/mirai-no-katachi" },
          { id: 6, name: "SCORE", logo: "/logos/score.png", type: "教育支援", link: "/organizations/score" },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  return (
    <section id="organizations" className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedElement animation="fade-up">
          <div className="text-center mb-12">
            <h2 className="section-title">加盟団体</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              UNIONには様々な分野で活動する学生団体が加盟しています
            </p>
          </div>
        </AnimatedElement>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <AnimatedElement animation="fade-up" delay={0.2}>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 mb-12">
              {organizations.map((org, index) => (
                <AnimatedElement 
                  key={org.id} 
                  animation="fade-up" 
                  delay={0.1 * (index % 6)}
                >
                  <OrganizationCard 
                    name={org.name}
                    logo={org.logo}
                    type={org.type}
                    link={org.link}
                  />
                </AnimatedElement>
              ))}
            </div>
          </AnimatedElement>
        )}

        <AnimatedElement animation="fade-up" delay={0.3}>
          <div className="text-center">
            <Link 
              href="/organizations" 
              className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 rounded-full shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50 transition-all hover:shadow"
            >
              <span>加盟団体一覧を見る</span>
              <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
};

// 団体カードコンポーネント
const OrganizationCard = ({ name, logo, type, link }) => (
  <Link href={link} className="block">
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 h-full flex flex-col items-center">
      <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center mb-3">
        <OptimizedImage 
          src={logo || "/logos/placeholder.png"} 
          alt={name} 
          className="max-w-full max-h-full object-contain"
          placeholderSrc="/logos/placeholder.png"
          width="80"
          height="80"
        />
      </div>
      <h3 className="text-sm md:text-base font-medium text-center mb-1">{name}</h3>
      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{type}</span>
    </div>
  </Link>
);

export default OrganizationsSection; 