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

// 管理者ユーザーの更新
async function updateAdminUser() {
  try {
    // 既存の管理者ユーザーを確認
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (!existingAdmin) {
      console.log('管理者ユーザーが見つかりません。新しい管理者を作成します。');
      
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
    }
    
    // 既存の管理者を更新
    console.log('既存の管理者ユーザーを更新します:', existingAdmin.username);
    
    // emailフィールドが無い場合は追加
    if (!existingAdmin.email) {
      existingAdmin.email = `${existingAdmin.username}@union.org`;
    }
    
    // statusフィールドが無い場合は追加
    if (!existingAdmin.status) {
      existingAdmin.status = 'active';
    }
    
    // 更新されたフィールドを保存
    await existingAdmin.save();
    
    console.log('管理者ユーザーを更新しました:');
    console.log('- ユーザー名:', existingAdmin.username);
    console.log('- メールアドレス:', existingAdmin.email);
    console.log('- 役割:', existingAdmin.role);
    console.log('- ステータス:', existingAdmin.status);
    
    return existingAdmin;
  } catch (error) {
    console.error('管理者ユーザーの更新に失敗しました:', error);
    throw error;
  }
}

// 実行
updateAdminUser()
  .then(() => {
    console.log('管理者ユーザーの更新が完了しました');
    process.exit(0);
  })
  .catch(error => {
    console.error('エラーが発生しました:', error);
    process.exit(1);
  }); 