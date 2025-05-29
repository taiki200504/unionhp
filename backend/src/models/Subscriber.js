const mongoose = require('mongoose');
const crypto = require('crypto');

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'メールアドレスは必須です'],
    unique: true,
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['active', 'unsubscribed', 'bounced'],
    default: 'active'
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date
  },
  lastEmailSent: {
    type: Date
  },
  preferences: {
    categories: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }],
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly'
    }
  },
  metadata: {
    source: String,
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true
});

// インデックス
subscriberSchema.index({ email: 1 }, { unique: true });
subscriberSchema.index({ status: 1 });

// 確認トークンの生成メソッド
subscriberSchema.methods.generateConfirmationToken = function() {
  this.confirmationToken = crypto.randomBytes(32).toString('hex');
  this.confirmationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24時間有効
  return this.confirmationToken;
};

// 退会トークンの生成メソッド
subscriberSchema.methods.generateUnsubscribeToken = function() {
  this.unsubscribeToken = crypto.randomBytes(32).toString('hex');
  return this.unsubscribeToken;
};

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

module.exports = Subscriber; 