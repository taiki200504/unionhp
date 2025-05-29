import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

const MediaPage = () => {
  useEffect(() => {
    // ページタイトルを設定
    document.title = 'Media | 学生団体連合UNION';
    
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
              学生の声を<span className="text-gradient-primary">メディア</span>で届ける
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              UNIONは様々なメディアを通じて学生の声や活動を社会に発信しています
            </p>
          </div>
        </div>
      </section>

      {/* メディア概要セクション */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-3xl p-8 md:p-12 mb-12 shadow-sm">
            <div className="text-center max-w-3xl mx-auto mb-8">
              <h2 className="text-3xl font-bold mb-6">
                <span className="text-gradient-primary">UNIONメディア</span>
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                UNIONは「学生の声を社会に響かせる」をミッションに、
                複数のメディアチャネルを運営しています。ポッドキャスト、YouTube、SNSなど
                様々な媒体を通じて、学生団体の活動や学生の思いを広く発信しています。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ポッドキャスト：ユニラジセクション */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <div className="bg-gradient-to-r from-blue-500 to-pink-500 p-1 rounded-xl shadow-lg">
                <div className="bg-white rounded-lg aspect-square flex items-center justify-center p-8">
                  <i className="fas fa-podcast text-gradient-primary text-8xl"></i>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">
                <span className="text-gradient-primary">ユニラジ</span>
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                ちょっと先をいく先輩、学生団体の活動や思いを双子姉妹のあんりんが対話を通じて発信するUNIONのPodcast番組です。
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                学生団体のリーダーや活動を紹介することで、より多くの人に学生団体の存在や取り組みを知ってもらうことを目指しています。
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <PodcastButton 
                  platform="Apple Podcasts" 
                  icon="fab fa-apple" 
                  url="https://podcasts.apple.com/jp/podcast/学生団体unionのユニラジ/id1773603325" 
                />
                <PodcastButton 
                  platform="Spotify" 
                  icon="fab fa-spotify" 
                  url="https://open.spotify.com/show/4Y81Zf6xXvgd8vdKr5R25c" 
                />
                <PodcastButton 
                  platform="YouTube" 
                  icon="fab fa-youtube" 
                  url="https://www.youtube.com/playlist?list=PLTtd12wBPw0TF7cUSGN_QSK56pnV4Ryld" 
                />
              </div>
              <div className="flex items-center text-gray-600">
                <i className="fas fa-hashtag mr-2"></i>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">#Podcast</span>
                  <span className="bg-pink-100 text-pink-800 text-xs px-3 py-1 rounded-full">#学生団体</span>
                  <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">#インタビュー</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ポッドキャスト：ここみゆの夢ぐらしセクション */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="md:w-1/2">
              <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-1 rounded-xl shadow-lg">
                <div className="bg-white rounded-lg aspect-square flex items-center justify-center p-8">
                  <i className="fas fa-microphone-alt text-gradient-primary text-8xl"></i>
                </div>
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">
                <span className="text-gradient-primary">ここみゆの夢ぐらし</span>
              </h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                夢を追いかける学生の生き方や挑戦を紹介するインタビュー形式のポッドキャスト番組です。
              </p>
              <p className="text-gray-700 mb-6 leading-relaxed">
                夢を持つ学生にフォーカスし、その情熱や挑戦、日々の生活について深掘りしていきます。リスナーに新たな視点や可能性を提供します。
              </p>
              <div className="flex flex-wrap gap-4 mb-6">
                <PodcastButton 
                  platform="Apple Podcasts" 
                  icon="fab fa-apple" 
                  url="https://podcasts.apple.com/jp/podcast/ここみゆの夢ぐらし/id1806841907" 
                />
                <PodcastButton 
                  platform="Spotify" 
                  icon="fab fa-spotify" 
                  url="https://open.spotify.com/show/3Hhp09NBFgXh3fR5e3sLCn" 
                />
                <PodcastButton 
                  platform="YouTube" 
                  icon="fab fa-youtube" 
                  url="https://youtu.be/JWIAruyvTLg" 
                />
              </div>
              <div className="flex items-center text-gray-600">
                <i className="fas fa-hashtag mr-2"></i>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-pink-100 text-pink-800 text-xs px-3 py-1 rounded-full">#Podcast</span>
                  <span className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">#夢追い人</span>
                  <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">#ライフスタイル</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SNSセクション */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="text-gradient-primary">SNS</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <SocialCard 
              platform="Instagram" 
              icon="fab fa-instagram" 
              url="https://www.instagram.com/union_gakusei/" 
              color="from-pink-500 to-yellow-500"
              description="学生団体の活動や日常、イベント情報などを発信"
            />
            <SocialCard 
              platform="Twitter" 
              icon="fab fa-twitter" 
              url="https://twitter.com/UNION_gakusei" 
              color="from-blue-400 to-blue-600"
              description="リアルタイムな情報や学生団体の話題を発信"
            />
            <SocialCard 
              platform="YouTube" 
              icon="fab fa-youtube" 
              url="https://www.youtube.com/@UNION_gakusei" 
              color="from-red-500 to-red-700"
              description="ポッドキャストや学生団体紹介の動画コンテンツ"
            />
            <SocialCard 
              platform="note" 
              icon="fas fa-pen-fancy" 
              url="https://note.com/union_gakusei/" 
              color="from-green-400 to-green-600"
              description="学生団体や活動に関する記事やコラムを配信"
            />
          </div>
        </div>
      </section>

      {/* メディア運営メンバー募集セクション */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-50 to-pink-50 rounded-3xl p-8 md:p-12 shadow-sm">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-6">
                <span className="text-gradient-primary">メディア運営メンバー募集中</span>
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                UNIONでは、各メディアの運営に携わるメンバーを募集しています。
                編集、企画、SNS運用、インタビューなど、あなたのスキルや興味を活かせる場所があります。
              </p>
              <Link 
                to="/join" 
                className="bg-gradient-primary text-white px-8 py-3 rounded-full hover:opacity-90 transition inline-flex items-center"
              >
                <span>詳細を見る</span>
                <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 企業・メディア連携セクション */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-6">
              <span className="text-gradient-primary">企業・メディア連携</span>
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              UNIONでは、企業やメディアとの連携も積極的に行っています。
              学生と社会をつなぐ取り組みにご興味のある方は、お気軽にお問い合わせください。
            </p>
          </div>
          <div className="flex justify-center">
            <Link 
              to="/contact" 
              className="bg-white text-gray-800 border-2 border-gray-300 px-8 py-3 rounded-full hover:bg-gray-100 transition inline-flex items-center"
            >
              <i className="fas fa-envelope mr-2"></i>
              <span>お問い合わせ</span>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

// Podcastボタンコンポーネント
const PodcastButton = ({ platform, icon, url }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition"
  >
    <i className={`${icon} text-gray-700 mr-2`}></i>
    <span className="text-sm font-medium">{platform}</span>
  </a>
);

// ソーシャルカードコンポーネント
const SocialCard = ({ platform, icon, url, color, description }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
  >
    <div className={`bg-gradient-to-r ${color} h-24 flex items-center justify-center`}>
      <i className={`${icon} text-white text-4xl`}></i>
    </div>
    <div className="p-4">
      <h3 className="text-xl font-bold mb-2">{platform}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <div className="flex items-center text-gray-800 text-sm">
        <i className="fas fa-external-link-alt mr-2"></i>
        <span>フォローする</span>
      </div>
    </div>
  </a>
);

export default MediaPage; 