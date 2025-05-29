const mongoose = require('mongoose');
const Category = require('../models/Category');
require('dotenv').config();

// 初期カテゴリーデータ
const categories = [
  {
    name: 'お知らせ',
    slug: 'announcements',
    description: 'UNIONからの重要なお知らせや最新情報',
    color: '#3498db',
    icon: 'announcement',
    order: 1
  },
  {
    name: 'イベント',
    slug: 'events',
    description: 'UNIONが主催または参加するイベント情報',
    color: '#e74c3c',
    icon: 'event',
    order: 2
  },
  {
    name: 'プロジェクト',
    slug: 'projects',
    description: 'UNIONの進行中および完了したプロジェクト',
    color: '#2ecc71',
    icon: 'project',
    order: 3
  },
  {
    name: 'コミュニティ',
    slug: 'community',
    description: 'コミュニティに関連するニュースと活動',
    color: '#f39c12',
    icon: 'community',
    order: 4
  },
  {
    name: 'メディア',
    slug: 'media',
    description: 'メディア掲載情報や報道発表',
    color: '#9b59b6',
    icon: 'media',
    order: 5
  }
];

// データベース接続とシード実行
const seedCategories = async () => {
  try {
    // MongoDBに接続
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/union_hp');
    console.log('MongoDB接続成功');
    
    // 既存のカテゴリーを確認
    const existingCategories = await Category.find();
    
    if (existingCategories.length > 0) {
      console.log(`既に${existingCategories.length}件のカテゴリーが存在します。`);
      const overwrite = process.argv.includes('--force');
      
      if (!overwrite) {
        console.log('既存カテゴリーを保持します。上書きするには --force オプションを使用してください。');
        await mongoose.disconnect();
        return;
      }
      
      // 既存のカテゴリーを削除
      await Category.deleteMany({});
      console.log('既存のカテゴリーを削除しました。');
    }
    
    // カテゴリーを挿入
    const result = await Category.insertMany(categories);
    console.log(`${result.length}件のカテゴリーを正常に追加しました。`);
    
    // MongoDBから切断
    await mongoose.disconnect();
    console.log('MongoDB切断成功');
    
  } catch (error) {
    console.error('シードエラー:', error);
    process.exit(1);
  }
};

// スクリプトの実行
seedCategories(); 