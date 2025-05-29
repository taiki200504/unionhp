import React from 'react';
import Link from 'next/link';

const MediaSection = () => {
  return (
    <section id="media" className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="section-title">Media</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            UNIONが運営する複数のメディアチャネルを通じて、
            <br className="hidden md:block" />
            学生の声を社会に届けています
          </p>
        </div>

        {/* メディアコンテンツ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <MediaCard
            title="ユニラジ"
            description="ちょっと先をいく先輩、学生団体の活動や思いを双子姉妹のあんりんが対話を通じて発信するUNIONのPodcast番組です。"
            icon="fas fa-podcast"
            gradientFrom="blue-500"
            gradientTo="pink-500"
            tags={['#Podcast', '#学生団体', '#インタビュー']}
            links={[
              { platform: 'apple', url: 'https://podcasts.apple.com/jp/podcast/学生団体unionのユニラジ/id1773603325', icon: 'fab fa-apple' },
              { platform: 'spotify', url: 'https://open.spotify.com/show/4Y81Zf6xXvgd8vdKr5R25c', icon: 'fab fa-spotify' },
              { platform: 'youtube', url: 'https://www.youtube.com/playlist?list=PLTtd12wBPw0TF7cUSGN_QSK56pnV4Ryld', icon: 'fab fa-youtube' },
              { platform: 'instagram', url: 'https://www.instagram.com/uniradibyunion/', icon: 'fab fa-instagram' }
            ]}
          />

          <MediaCard
            title="ここみゆの夢ぐらし"
            description="夢を追いかける学生の生き方や挑戦を紹介するインタビュー形式のポッドキャスト番組です。"
            icon="fas fa-microphone-alt"
            gradientFrom="pink-500"
            gradientTo="purple-500"
            tags={['#Podcast', '#夢追い人', '#ライフスタイル']}
            links={[
              { platform: 'apple', url: 'https://podcasts.apple.com/jp/podcast/ここみゆの夢ぐらし/id1806841907', icon: 'fab fa-apple' },
              { platform: 'spotify', url: 'https://open.spotify.com/show/3Hhp09NBFgXh3fR5e3sLCn', icon: 'fab fa-spotify' },
              { platform: 'youtube', url: 'https://youtu.be/JWIAruyvTLg', icon: 'fab fa-youtube' },
              { platform: 'instagram', url: 'https://www.instagram.com/cocomiyu.life/', icon: 'fab fa-instagram' }
            ]}
          />

          <MediaCard
            title="UNION SNS"
            description="UNIONや加盟団体の最新情報、イベント案内、学生団体の活動をSNSで発信しています。"
            icon="fas fa-hashtag"
            gradientFrom="blue-600"
            gradientTo="blue-400"
            tags={['#SNS', '#情報発信', '#イベント案内']}
            links={[
              { platform: 'instagram', url: 'https://www.instagram.com/gakusei.union', icon: 'fab fa-instagram' },
              { platform: 'twitter', url: 'https://twitter.com/UNION_gakusei26', icon: 'fab fa-twitter' },
              { platform: 'tiktok', url: 'https://www.tiktok.com/@gakusei.union.226', icon: 'fab fa-tiktok' },
              { platform: 'line', url: 'https://lin.ee/CVuq44t', icon: 'fab fa-line' }
            ]}
          />
        </div>

        {/* メディア詳細ページへのリンク */}
        <div className="text-center">
          <Link 
            href="/media" 
            className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 rounded-full shadow-sm text-base font-medium text-gray-700 hover:bg-gray-50 transition-all hover:shadow"
          >
            <span>メディア詳細を見る</span>
            <i className="fas fa-arrow-right ml-2"></i>
          </Link>
        </div>
      </div>
    </section>
  );
};

// メディアカードコンポーネント
const MediaCard = ({ title, description, icon, gradientFrom, gradientTo, tags, links }) => (
  <div className="group">
    <div className="bg-white rounded-xl overflow-hidden shadow-sm transform transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-lg h-full flex flex-col">
      <div className="relative overflow-hidden">
        <div className={`bg-gradient-to-r from-${gradientFrom} to-${gradientTo} aspect-video flex items-center justify-center p-8`}>
          <i className={`${icon} text-white text-5xl`}></i>
        </div>
        <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-50 transition-opacity"></div>
      </div>
      <div className="p-6 flex-grow">
        <h3 className="text-xl font-bold mb-3 text-gradient-primary">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => {
            const colorClasses = [
              'bg-blue-100 text-blue-800',
              'bg-pink-100 text-pink-800',
              'bg-purple-100 text-purple-800',
              'bg-green-100 text-green-800',
              'bg-yellow-100 text-yellow-800'
            ];
            return (
              <span 
                key={index} 
                className={`${colorClasses[index % colorClasses.length]} text-xs px-3 py-1 rounded-full`}
              >
                {tag}
              </span>
            );
          })}
        </div>
      </div>
      <div className="p-4 border-t border-gray-100 grid grid-cols-2 gap-2">
        {links.map((link, index) => (
          <a 
            key={index}
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-50 transition"
          >
            <i className={`${link.icon} text-gray-700 mr-2`}></i>
            <span className="text-sm font-medium">{link.platform.charAt(0).toUpperCase() + link.platform.slice(1)}</span>
          </a>
        ))}
      </div>
    </div>
  </div>
);

export default MediaSection; 