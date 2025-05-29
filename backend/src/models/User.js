const mongoose = require('mongoose');
const { hashPassword } = require('../utils/auth');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '名前は必須です'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'メールアドレスは必須です'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'パスワードは必須です'],
    minlength: [8, 'パスワードは8文字以上必要です']
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'user'],
    default: 'user'
  },
  organizationName: {
    type: String,
    required: [true, '組織名は必須です'],
    trim: true
  },
  organizationType: {
    type: String,
    enum: ['academic', 'corporate', 'government', 'other'],
    required: [true, '組織タイプは必須です']
  },
  profileImage: {
    type: String
  },
  contactInfo: {
    phone: String,
    website: String,
    address: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// パスワードのハッシュ化
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await hashPassword(this.password);
  }
  next();
});

// パスワード比較メソッド
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema, 'users');

module.exports = User; 