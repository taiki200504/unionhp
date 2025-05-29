import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import MainLayout from './layouts/MainLayout';
import api from '../services/api';
import OptimizedImage from '../components/OptimizedImage';
import AnimatedElement from '../components/AnimatedElement';
import SEO from '../components/SEO';

const EventsPage = () => {
  // イベントデータ（APIから取得）
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // APIからイベントデータを取得
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const data = await api.getEvents();
        setEvents(data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('イベント情報の読み込みに失敗しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // フィルター機能
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');

  // イベントタイプの取得（重複なし）
  const types = ['all', ...new Set(events.map(event => event.type))];

  // フィルター適用
  const filteredEvents = events.filter(event => {
    const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus;
    const matchesType = selectedType === 'all' || event.type === selectedType;
    return matchesStatus && matchesType;
  });

  useEffect(() => {
    // ページタイトルを設定
    document.title = 'イベント | 学生団体連合UNION';
    
    // スクロールを上部に戻す
    window.scrollTo(0, 0);
  }, []);

  // 構造化データ（イベントリスト）
  const eventsSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": filteredEvents.map((event, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Event",
        "name": event.title,
        "description": event.description,
        "startDate": event.date,
        "location": {
          "@type": "Place",
          "name": event.location
        },
        "image": `https://union-student.jp${event.image}`
      }
    }))
  };

  return (
    <MainLayout>
      <SEO 
        title="イベント"
        description="学生団体連合UNIONが開催する様々なイベント情報。学生団体と社会をつなぐイベントに参加しませんか？"
        canonical="/events"
        structuredData={eventsSchema}
      />

      {/* ヒーローセクション */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement animation="fade-down" duration={0.8}>
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                UNION<span className="text-gradient-primary">イベント</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                学生団体と社会をつなぐ様々なイベントを開催しています
              </p>
            </div>
          </AnimatedElement>
        </div>
      </section>

      {/* イベント一覧セクション */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <AnimatedElement animation="fade-up">
              <h2 className="text-3xl font-bold text-center mb-12">
                <span className="text-gradient-primary">イベント一覧</span>
              </h2>
            </AnimatedElement>

            {/* フィルター */}
            <AnimatedElement animation="fade-up" delay={0.2}>
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between">
                  <div>
                    <p className="text-gray-700 font-medium mb-2">開催状況</p>
                    <div className="flex flex-wrap gap-2">
                      <FilterButton 
                        label="すべて" 
                        value="all" 
                        selected={selectedStatus} 
                        onChange={setSelectedStatus} 
                      />
                      <FilterButton 
                        label="開催予定" 
                        value="upcoming" 
                        selected={selectedStatus} 
                        onChange={setSelectedStatus} 
                      />
                      <FilterButton 
                        label="開催中" 
                        value="ongoing" 
                        selected={selectedStatus} 
                        onChange={setSelectedStatus} 
                      />
                      <FilterButton 
                        label="終了" 
                        value="past" 
                        selected={selectedStatus} 
                        onChange={setSelectedStatus} 
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-700 font-medium mb-2">イベントタイプ</p>
                    <div className="flex flex-wrap gap-2">
                      {types.map(type => (
                        <FilterButton 
                          key={type} 
                          label={type === 'all' ? 'すべて' : type} 
                          value={type} 
                          selected={selectedType} 
                          onChange={setSelectedType} 
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedElement>

            {/* ローディング表示 */}
            {loading && (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* エラー表示 */}
            {error && (
              <div className="text-center py-16">
                <p className="text-red-500 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  再度読み込む
                </button>
              </div>
            )}

            {/* イベントリスト */}
            {!loading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                  <AnimatedElement key={event.id} animation="fade-up" delay={0.1 * (index % 3)}>
                    <EventCard event={event} />
                  </AnimatedElement>
                ))}
              </div>
            )}

            {/* イベントがない場合 */}
            {!loading && !error && filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">該当するイベントがありません</p>
                <button 
                  onClick={() => {
                    setSelectedStatus('all');
                    setSelectedType('all');
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  全てのイベントを表示する
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* イベント開催案内セクション */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedElement animation="fade-up">
            <div className="bg-white rounded-3xl overflow-hidden shadow-md">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <h2 className="text-3xl font-bold mb-6">
                    <span className="text-gradient-primary">イベント開催のご案内</span>
                  </h2>
                  <p className="text-gray-600 mb-4">
                    UNIONでは、加盟団体やパートナー企業と連携した様々なイベントを開催しています。
                    団体の活動紹介、スキルアップワークショップ、交流会など、
                    学生の成長と団体間の連携を促進する機会を提供しています。
                  </p>
                  <p className="text-gray-600 mb-6">
                    イベントの最新情報はこのページや公式SNSでお知らせします。
                    ぜひお気軽にご参加ください。
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <a 
                      href="https://twitter.com/UNION_gakusei" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                    >
                      <i className="fab fa-twitter mr-2"></i>
                      <span>Twitter</span>
                    </a>
                    <a 
                      href="https://www.instagram.com/union_gakusei/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-yellow-500 text-white rounded-full hover:opacity-90 transition"
                    >
                      <i className="fab fa-instagram mr-2"></i>
                      <span>Instagram</span>
                    </a>
                  </div>
                </div>
                <div className="bg-blue-100 min-h-[300px] flex items-center justify-center">
                  <OptimizedImage 
                    src="/events/events-banner.jpg" 
                    alt="UNIONイベント" 
                    className="w-full h-full object-cover"
                    placeholderSrc="https://via.placeholder.com/600x400?text=UNION+Events"
                    width="600"
                    height="400"
                  />
                </div>
              </div>
            </div>
          </AnimatedElement>
        </div>
      </section>

      {/* イベント開催依頼セクション */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedElement animation="fade-up">
            <h2 className="text-3xl font-bold mb-6">
              <span className="text-gradient-primary">イベント開催のご相談</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              学生団体の合同イベントや企業との連携イベントなど、
              様々なイベント企画・運営のご相談を承っています。
            </p>
            <Link 
              href="/contact" 
              className="bg-gradient-primary text-white px-8 py-3 rounded-full hover:opacity-90 transition inline-flex items-center"
            >
              <span>お問い合わせ</span>
              <i className="fas fa-arrow-right ml-2"></i>
            </Link>
          </AnimatedElement>
        </div>
      </section>
    </MainLayout>
  );
};

// フィルターボタンコンポーネント
const FilterButton = ({ label, value, selected, onChange }) => (
  <button
    onClick={() => onChange(value)}
    className={`px-4 py-2 rounded-full text-sm font-medium transition ${
      selected === value 
        ? 'bg-gradient-primary text-white' 
        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
    }`}
  >
    {label}
  </button>
);

// イベントカードコンポーネント
const EventCard = ({ event }) => {
  // 開催状況に応じたバッジ
  let statusBadge;
  switch(event.status) {
    case 'upcoming':
      statusBadge = <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">開催予定</span>;
      break;
    case 'ongoing':
      statusBadge = <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">開催中</span>;
      break;
    case 'past':
      statusBadge = <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">終了</span>;
      break;
    default:
      statusBadge = null;
  }

  return (
    <div className={`bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-100 ${event.status === 'past' ? 'opacity-75' : ''}`}>
      <div className="aspect-[3/2] overflow-hidden relative">
        <OptimizedImage 
          src={event.image} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
          placeholderSrc="https://via.placeholder.com/600x400?text=UNION+Event"
          width="600"
          height="400"
        />
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start">
          <span className="bg-white text-gray-800 text-xs px-2 py-1 rounded-full">
            {event.type}
          </span>
          {statusBadge}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
        <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <i className="far fa-calendar mr-2 text-blue-500"></i>
            <span>{event.date}</span>
          </div>
          <div className="flex items-center">
            <i className="far fa-clock mr-2 text-blue-500"></i>
            <span>{event.time}</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-map-marker-alt mr-2 text-blue-500"></i>
            <span>{event.location}</span>
          </div>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {event.description}
        </p>
        <Link 
          href={event.link} 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
        >
          <span>詳細を見る</span>
          <i className="fas fa-arrow-right ml-1"></i>
        </Link>
      </div>
    </div>
  );
};

export default EventsPage; 