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

// ユーザー一覧の取得
async function listUsers() {
  try {
    const users = await User.find().select('-password');
    
    console.log('\nユーザー一覧:');
    console.log('='.repeat(80));
    console.log('ID\t\tユーザー名\tメールアドレス\t\t\t役割\tステータス');
    console.log('-'.repeat(80));
    
    users.forEach(user => {
      console.log(`${user._id}\t${user.username}\t${user.email || 'なし'}\t\t${user.role}\t${user.status || 'active'}`);
    });
    
    console.log('='.repeat(80));
    console.log(`合計: ${users.length} ユーザー`);
    
    return users;
  } catch (error) {
    console.error('ユーザー一覧の取得に失敗しました:', error);
    throw error;
  }
}

// 実行
listUsers()
  .then(() => {
    console.log('ユーザー一覧の表示が完了しました');
    process.exit(0);
  })
  .catch(error => {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }); 