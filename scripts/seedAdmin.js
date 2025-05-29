require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

// データベース接続
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/union_cms')
  .then(() => console.log('MongoDBに接続しました'))
  .catch(err => {
    console.error('MongoDB接続エラー:', err);
    process.exit(1);
  });

// 管理者ユーザーの作成
async function createAdminUser() {
  try {
    // 既存の管理者ユーザーを確認
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('管理者ユーザーは既に存在します:', existingAdmin.username);
      return existingAdmin;
    }
    
    // 新しい管理者ユーザーを作成
    const admin = new User({
      username: 'admin',
      email: 'admin@union.org',
      password: 'admin123', // 本番環境では強力なパスワードに変更してください
      role: 'admin',
      status: 'active'
    });
    
    await admin.save();
    console.log('管理者ユーザーを作成しました:', admin.username);
    return admin;
  } catch (error) {
    console.error('管理者ユーザーの作成に失敗しました:', error);
    throw error;
  }
}

// 実行
createAdminUser()
  .then(() => {
    console.log('管理者ユーザーの作成が完了しました');
    process.exit(0);
  })
  .catch(error => {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }); 