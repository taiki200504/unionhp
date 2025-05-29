require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function deleteAdminUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/union_cms');
        console.log('MongoDBに接続しました');

        const result = await User.deleteOne({ username: 'admin' });
        if (result.deletedCount > 0) {
            console.log('adminユーザーを削除しました');
        } else {
            console.log('adminユーザーは存在しません');
        }
        process.exit(0);
    } catch (error) {
        console.error('エラーが発生しました:', error);
        process.exit(1);
    }
}

deleteAdminUser(); 