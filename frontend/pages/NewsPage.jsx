import React, { useState } from 'react';
import MainLayout from './layouts/MainLayout';
import SEO from '../components/SEO';

// ニュースデータ（ハードコーディング例）
const newsData = [
  {
    id: 1,
    title: '新たな加盟団体を迎えました',
    date: '2025-05-01',
    category: 'notice',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    excerpt: '3つの新しい学生団体がUNIONに加盟しました。環境保全活動「Green Campus」、プログラミング教育「Code for Students」、芸術活動「Art Connect」です。',
    year: '2025',
  },
  {
    id: 2,
    title: '学生団体支援プログラム「UNION BOOST」開始のお知らせ',
    date: '2025-04-15',
    category: 'pressrelease',
    image: 'https://images.unsplash.com/photo-1560439514-e960a3ef5019?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    excerpt: 'UNIONは学生団体の活動を加速させる支援プログラム「UNION BOOST」を開始します。資金援助、メンタリング、広報支援など総合的なサポートを提供します。',
    year: '2025',
  },
  {
    id: 3,
    title: '学生団体向けウェブサイト制作サポートサービスを開始',
    date: '2025-03-20',
    category: 'service',
    image: 'https://images.unsplash.com/photo-1565022536102-f7645c84354a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    excerpt: '学生団体の情報発信力を強化するため、ウェブサイト制作・運用支援サービスを開始します。専門スタッフによる設計からメンテナンスまでをサポートします。',
    year: '2025',
  },
  {
    id: 4,
    title: 'UNION、学生支援活動で「ソーシャルインパクト賞」受賞',
    date: '2024-12-10',
    category: 'award',
    image: '/photo/union.about.png',
    excerpt: '当団体の学生支援活動が評価され、全国学生団体コンテストにて「ソーシャルインパクト賞」を受賞しました。',
    year: '2024',
  },
  {
    id: 5,
    title: '冬季休業のお知らせ',
    date: '2024-11-25',
    category: 'notice',
    image: '/photo/union.about.png',
    excerpt: '2024年12月28日から2025年1月5日まで冬季休業とさせていただきます。お問い合わせは1月6日以降にご連絡ください。',
    year: '2024',
  },
  {
    id: 6,
    title: '新番組「学生キャリアラボ」配信開始のお知らせ',
    date: '2024-10-15',
    category: 'service',
    image: '/photo/union.about.png',
    excerpt: '様々な分野で活躍する若手社会人をゲストに迎える新番組「学生キャリアラボ」の配信を10月より開始します。',
    year: '2024',
  },
  {
    id: 7,
    title: '秋学期の活動スケジュールを公開しました',
    date: '2024-10-01',
    category: 'notice',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    excerpt: '2024年秋学期のUNION活動スケジュールを公開しました。加盟団体向けイベントや一般参加可能なワークショップなど多数の企画を予定しています。',
    year: '2024',
  },
  {
    id: 8,
    title: '学生キャリアフォーラム開催のお知らせ',
    date: '2024-09-15',
    category: 'pressrelease',
    image: '/photo/union.about.png',
    excerpt: '業界をリードする企業と学生が交流する「学生キャリアフォーラム2024」を10月に開催します。就職活動中の学生だけでなく、低学年からのキャリア形成を支援するイベントです。',
    year: '2024',
  },
  {
    id: 9,
    title: '加盟団体が全国学生コンテストで最優秀賞を受賞',
    date: '2024-09-01',
    category: 'award',
    image: 'https://images.unsplash.com/photo-1546531130-0f3d47c9d799?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80',
    excerpt: 'UNIONの加盟団体「Technovation」が全国学生テクノロジーコンテストで最優秀賞を受賞しました。AI技術を活用した地域課題解決プロジェクトが高く評価されました。',
    year: '2024',
  },
];

const categoryOptions = [
  { key: 'all', label: 'すべて' },
  { key: 'event', label: 'イベント' },
  { key: 'notice', label: 'お知らせ' },
  { key: 'service', label: 'サービス' },
  { key: 'pressrelease', label: 'プレスリリース' },
  { key: 'award', label: '受賞・認定' },
];

const yearOptions = [
  { key: 'latest', label: '最新' },
  { key: '2025', label: '2025年' },
  { key: '2024', label: '2024年' },
];

const categoryClass = {
  event: 'bg-blue-50',
  notice: 'bg-gray-100',
  service: 'bg-indigo-50',
  pressrelease: 'bg-green-50',
  award: 'bg-yellow-50',
};

const categoryLabel = {
  event: 'イベント',
  notice: 'お知らせ',
  service: 'サービスニュース',
  pressrelease: 'プレスリリース',
  award: '受賞・認定',
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

const NewsPage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [year, setYear] = useState('latest');
  const [visibleCount, setVisibleCount] = useState(6);

  // フィルタリング
  const filtered = newsData.filter(item => {
    const categoryMatch = category === 'all' || item.category === category;
    const yearMatch = year === 'latest' || item.year === year;
    const searchMatch =
      search === '' ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.excerpt.toLowerCase().includes(search.toLowerCase());
    return categoryMatch && yearMatch && searchMatch;
  });

  const visibleNews = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  return (
    <MainLayout>
      <SEO title="News" description="学生団体の最新情報を発信。プレスリリース、お知らせ、イベント情報などをお届けします。" canonical="/news" />
      {/* ヒーローセクション */}
      <section className="relative bg-cover bg-center text-white py-28 mb-12 hero-section" style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1588681664899-f142ff2dc9b1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`}}>
        <div className="hero-content max-w-5xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">UNION News</h1>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed">
            学生団体の最新情報を発信。<br className="hidden md:block" />
            プレスリリース、お知らせ、イベント情報などをお届けします。
          </p>
          <div className="mt-8">
            <a href="#news-section" className="inline-block bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-3 rounded-full transition duration-300">
              ニュース一覧へ <i className="fas fa-arrow-down ml-2"></i>
            </a>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-pink-500" />
      </section>

      <main className="max-w-6xl mx-auto px-4 py-16" id="news-section">
        <div className="flex items-center my-16">
          <div className="flex-grow h-0.5 bg-gradient-to-r from-blue-600 to-pink-500" />
          <h2 className="px-6 font-bold text-2xl md:text-3xl">ニュース一覧</h2>
          <div className="flex-grow h-0.5 bg-gradient-to-r from-blue-600 to-pink-500" />
        </div>

        {/* フィルター・検索 */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow-sm sticky top-20 z-10">
          <div className="w-full mb-4">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="ニュースを検索"
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <i className="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
            {categoryOptions.map(opt => (
              <button
                key={opt.key}
                className={`filter-pill whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border border-gray-200 ${category === opt.key ? 'bg-gradient-primary text-white active' : ''}`}
                onClick={() => setCategory(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
            {yearOptions.map(opt => (
              <button
                key={opt.key}
                className={`year-pill whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium border border-gray-200 ${year === opt.key ? 'bg-gradient-primary text-white active' : ''}`}
                onClick={() => setYear(opt.key)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ニュースグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleNews.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">該当するニュースが見つかりませんでした。</div>
          )}
          {visibleNews.map(item => (
            <a
              key={item.id}
              href={`/news-detail?id=${item.id}`}
              className="news-item flex flex-col rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-white hover:shadow-md transition h-full"
              data-category={item.category}
              data-year={item.year}
            >
              <div className="news-item-image relative w-full aspect-video overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="absolute top-0 left-0 w-full h-full object-cover" />
                ) : (
                  <div className="default-news-image flex items-center justify-center bg-gray-100 w-full h-full">
                    <img src="/photo/union.about.png" alt="UNION" className="max-w-1/2 max-h-1/2 object-contain" />
                  </div>
                )}
              </div>
              <div className="news-content p-5 flex flex-col flex-grow">
                <span className={`news-tag mb-2 rounded-full px-3 py-1 text-xs font-semibold ${categoryClass[item.category]}`}>{categoryLabel[item.category]}</span>
                <time className="news-date block text-xs text-gray-500 mb-1" dateTime={item.date}>{formatDate(item.date)}</time>
                <h3 className="news-title text-lg font-bold mb-2 line-clamp-2">{item.title}</h3>
                <p className="news-excerpt text-gray-600 text-sm mt-auto line-clamp-2">{item.excerpt}</p>
              </div>
            </a>
          ))}
        </div>

        {/* ページネーション（もっと見る） */}
        {hasMore && (
          <div className="flex justify-center mt-10">
            <div className="inline-flex rounded-md shadow">
              <button
                onClick={() => setVisibleCount(c => c + 3)}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-primary hover:opacity-90 transition"
              >
                もっと見る <i className="fas fa-chevron-down ml-2"></i>
              </button>
            </div>
          </div>
        )}
      </main>
    </MainLayout>
  );
};

export default NewsPage; 