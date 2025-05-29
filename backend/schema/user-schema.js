/**
 * ユーザー関連のAPIスキーマ定義
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

// ユーザースキーマ
const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'editor', 'author', 'contributor'],
    default: 'contributor'
  },
  avatar: {
    type: String
  },
  bio: {
    type: String
  },
  active: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
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
}, { timestamps: true });

// インデックス設定
UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

/**
 * パスワードのハッシュ化
 */
UserSchema.pre('save', async function(next) {
  // 更新日時
  this.updatedAt = Date.now();
  
  // パスワードが変更されていない場合はスキップ
  if (!this.isModified('password')) return next();
  
  try {
    // パスワードのハッシュ化
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * パスワード検証メソッド
 * @param {string} password - 検証するパスワード
 * @return {Promise<boolean>} 検証結果
 */
UserSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// ユーザー活動ログスキーマ
const UserActivitySchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'publish', 'unpublish', 'archive', 'restore', 'login', 'logout']
  },
  resource: {
    type: String,
    required: true,
    enum: ['article', 'category', 'user', 'media', 'subscriber', 'newsletter', 'template', 'system']
  },
  resourceId: {
    type: Schema.Types.ObjectId
  },
  details: {
    type: String
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: { createdAt: true, updatedAt: false } });

// インデックス設定
UserActivitySchema.index({ user: 1 });
UserActivitySchema.index({ action: 1 });
UserActivitySchema.index({ resource: 1 });
UserActivitySchema.index({ createdAt: -1 });

// モデル登録
const User = mongoose.model('User', UserSchema);
const UserActivity = mongoose.model('UserActivity', UserActivitySchema);

module.exports = {
  User,
  UserActivity
}; 