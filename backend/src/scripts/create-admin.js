const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

const email = 'gakusei.union226@gmail.com';
const password = 'gakusei.union.cms.login';

async function createAdmin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/union_hp');
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('既にこのメールアドレスのユーザーが存在します:', email);
      process.exit(0);
    }
    const admin = new User({
      email,
      password,
      role: 'admin',
      name: '管理者',
      organizationType: 'other',
      organizationName: 'UNION管理者',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await admin.save();
    console.log('管理者アカウントを作成しました:', email);
    process.exit(0);
  } catch (e) {
    console.error('エラー:', e);
    process.exit(1);
  }
}

createAdmin(); 