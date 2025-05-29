require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdminUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/union_cms');
        console.log('MongoDBに接続しました');

        const adminUser = new User({
            username: 'test1.union',
            password: 'union.hp.test1234', // テスト用パスワード
            role: 'admin'
        });

        await adminUser.save();
        console.log('テスト用管理者ユーザーを作成しました');
        process.exit(0);
    } catch (error) {
        console.error('エラーが発生しました:', error);
        process.exit(1);
    }
}

createAdminUser(); 