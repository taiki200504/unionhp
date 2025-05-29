const mongoose = require('mongoose');
const User = require('../models/User');
const News = require('../models/News');
require('dotenv').config({ path: '../../.env' });

// MongoDB接続
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/union_hp');
    console.log('MongoDB接続成功');
  } catch (error) {
    console.error('MongoDB接続エラー:', error);
    process.exit(1);
  }
};

// テストデータの作成
const seedDatabase = async () => {
  try {
    // データベースのクリア
    // await User.deleteMany({});
    // await News.deleteMany({});
    console.log('既存のデータを保持します');

    // テスト管理者ユーザーの作成
    const adminUser = await User.findOne({ email: 'admin@union.jp' });
    let adminUserId;

    if (!adminUser) {
      const newAdmin = await User.create({
        name: '管理者ユーザー',
        email: 'admin@union.jp',
        password: 'password123',
        role: 'admin',
        organizationName: 'UNION',
        organizationType: 'academic'
      });
      adminUserId = newAdmin._id;
      console.log('管理者ユーザーを作成しました:', newAdmin.email);
    } else {
      adminUserId = adminUser._id;
      console.log('既存の管理者ユーザーを使用します:', adminUser.email);
    }

    // テストニュース記事の作成
    const testNews = [
      {
        title: 'UNIONが新プロジェクト発表',
        content: 'UNIONが新しい環境保全プロジェクトを開始しました。このプロジェクトでは、大学生と地域社会が協力して...',
        author: adminUserId,
        authorName: '管理者ユーザー',
        category: '環境',
        status: 'published',
        tags: ['環境', '大学生', 'プロジェクト'],
        year: 2023,
        publishedAt: new Date('2023-10-15'),
        isFeatured: true
      },
      {
        title: '学生イベント参加者募集中',
        content: '来月開催予定の学生イベントの参加者を募集しています。このイベントでは、さまざまな大学からの学生が集まり...',
        author: adminUserId,
        authorName: '管理者ユーザー',
        category: 'イベント',
        status: 'published',
        tags: ['イベント', '募集', '学生'],
        year: 2023,
        publishedAt: new Date('2023-11-20'),
        isFeatured: false
      },
      {
        title: '2024年度の活動計画を発表',
        content: 'UNIONは2024年度の活動計画を発表しました。新年度はより多くの学生団体との連携を強化し...',
        author: adminUserId,
        authorName: '管理者ユーザー',
        category: 'お知らせ',
        status: 'published',
        tags: ['計画', '2024', 'UNION'],
        year: 2024,
        publishedAt: new Date('2024-01-05'),
        isFeatured: true
      },
      {
        title: '国際交流プログラム開始',
        content: '今年から始まる国際交流プログラムの詳細が決定しました。アジア各国の大学生と日本の学生が協力して...',
        author: adminUserId,
        authorName: '管理者ユーザー',
        category: '国際',
        status: 'published',
        tags: ['国際', '交流', 'プログラム'],
        year: 2024,
        publishedAt: new Date('2024-02-10'),
        isFeatured: false
      },
      {
        title: 'サマーインターンシップ情報',
        content: '今年のサマーインターンシップ情報を公開しました。環境、IT、メディアなど様々な分野で...',
        author: adminUserId,
        authorName: '管理者ユーザー',
        category: 'キャリア',
        status: 'published',
        tags: ['インターンシップ', '夏', 'キャリア'],
        year: 2024,
        publishedAt: new Date('2024-04-20'),
        isFeatured: true
      }
    ];

    for (const newsItem of testNews) {
      // 同じタイトルの記事がすでに存在するかチェック
      const existingNews = await News.findOne({ title: newsItem.title });
      
      if (!existingNews) {
        await News.create(newsItem);
        console.log(`ニュース記事「${newsItem.title}」を作成しました`);
      } else {
        console.log(`ニュース記事「${newsItem.title}」は既に存在します`);
      }
    }

    console.log('シードデータの作成が完了しました');
    
  } catch (error) {
    console.error('シードデータ作成エラー:', error);
  }
};

// 実行
const runSeed = async () => {
  await connectDB();
  await seedDatabase();
  process.exit(0);
};

runSeed(); 