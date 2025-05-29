require('dotenv').config();
const mongoose = require('mongoose');
const News = require('../models/News');

// データベース接続
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/union_cms')
  .then(() => console.log('MongoDBに接続しました'))
  .catch(err => {
    console.error('MongoDB接続エラー:', err);
    process.exit(1);
  });

// サンプルニュース記事データ
const newsData = [
  // 2023年のニュース
  {
    title: 'UNIONウェブサイトリニューアル',
    content: 'UNIONのウェブサイトが新しくなりました。最新のデザインと機能で、より使いやすくなっています。',
    image: '/src/images/sample/news-sample1.jpg',
    year: 2023,
    publishedAt: new Date('2023-12-05'),
    author: 'UNION事務局',
    featured: true
  },
  {
    title: '2023年度活動報告書を公開',
    content: '2023年度のUNIONの活動をまとめた報告書を公開しました。今年度の成果と来年度の展望をご覧いただけます。',
    image: '/src/images/sample/news-sample2.jpg',
    year: 2023,
    publishedAt: new Date('2023-11-15'),
    author: 'UNION事務局'
  },
  {
    title: '会員向けワークショップ開催のお知らせ',
    content: '会員の皆様を対象としたスキルアップワークショップを開催します。参加希望の方は事務局までご連絡ください。',
    // 画像なし → デフォルト画像が使用される
    year: 2023,
    publishedAt: new Date('2023-10-20'),
    author: 'UNION事務局'
  },
  
  // 2024年のニュース
  {
    title: '新年のご挨拶',
    content: '新年あけましておめでとうございます。本年もUNIONをよろしくお願いいたします。',
    image: '/src/images/sample/news-sample3.jpg',
    year: 2024,
    publishedAt: new Date('2024-01-05'),
    author: 'UNION代表'
  },
  {
    title: '春季カンファレンス参加者募集',
    content: '今年の春季カンファレンスの参加者を募集しています。多くの方のご参加をお待ちしております。',
    image: '/src/images/sample/news-sample4.jpg', 
    year: 2024,
    publishedAt: new Date('2024-02-15'),
    author: 'UNION事務局'
  },
  {
    title: '新規プロジェクト始動のお知らせ',
    content: 'UNIONでは新たな共同プロジェクトを開始します。詳細は近日中にお知らせします。',
    // 画像なし
    year: 2024,
    publishedAt: new Date('2024-03-20'),
    author: 'プロジェクト担当'
  },
  {
    title: '夏期休業のお知らせ',
    content: '8月10日から8月15日まで夏期休業とさせていただきます。ご不便をおかけしますがご了承ください。',
    image: '/src/images/sample/news-sample5.jpg',
    year: 2024,
    publishedAt: new Date('2024-07-25'),
    author: 'UNION事務局'
  },
  
  // 2025年のニュース（将来の予定）
  {
    title: '2025年度会員募集開始',
    content: '来年度の新規会員募集を開始しました。詳細は会員募集ページをご覧ください。',
    image: '/src/images/sample/news-sample6.jpg',
    year: 2025,
    publishedAt: new Date('2025-01-10'),
    author: 'UNION事務局',
    featured: true
  },
  {
    title: '創立10周年記念イベント予告',
    content: 'UNIONは来年で創立10周年を迎えます。記念イベントの詳細は順次お知らせします。',
    // 画像なし
    year: 2025,
    publishedAt: new Date('2025-02-01'),
    author: 'UNION代表'
  }
];

// ニュース記事のシード処理
async function seedNews() {
  try {
    // 既存のニュースをクリア
    await News.deleteMany({});
    console.log('既存のニュース記事をクリアしました');
    
    // 新しいニュース記事を追加
    const news = await News.insertMany(newsData);
    console.log(`${news.length}件のニュース記事を追加しました`);
    
    // 年ごとの記事数を表示
    const years = await News.aggregate([
      { $group: { _id: '$year', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);
    
    console.log('\n年別ニュース記事数:');
    years.forEach(year => {
      console.log(`${year._id}年: ${year.count}件`);
    });
    
    return news;
  } catch (error) {
    console.error('ニュース記事のシードに失敗しました:', error);
    throw error;
  }
}

// 実行
seedNews()
  .then(() => {
    console.log('ニュース記事のシードが完了しました');
    process.exit(0);
  })
  .catch(error => {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }); 