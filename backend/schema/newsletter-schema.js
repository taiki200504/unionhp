/**
 * ニュースレター関連のAPIスキーマ定義
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// 購読者スキーマ
const SubscriberSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'unsubscribed'],
    default: 'pending'
  },
  verificationToken: {
    type: String
  },
  verifiedAt: {
    type: Date
  },
  interests: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    type: Map,
    of: String
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
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
SubscriberSchema.index({ email: 1 });
SubscriberSchema.index({ status: 1 });
SubscriberSchema.index({ interests: 1 });
SubscriberSchema.index({ tags: 1 });

/**
 * プリセーブフック
 */
SubscriberSchema.pre('save', function(next) {
  // 更新日時
  this.updatedAt = Date.now();
  next();
});

// ニュースレタースキーマ
const NewsletterSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    html: {
      type: String,
      required: true
    },
    text: {
      type: String
    }
  },
  template: {
    type: Schema.Types.ObjectId,
    ref: 'Template'
  },
  sender: {
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  targetGroups: {
    interests: [{
      type: String,
      trim: true
    }],
    tags: [{
      type: String,
      trim: true
    }],
    specificSubscribers: [{
      type: Schema.Types.ObjectId,
      ref: 'Subscriber'
    }]
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed'],
    default: 'draft'
  },
  scheduledAt: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  stats: {
    recipients: {
      type: Number,
      default: 0
    },
    opened: {
      type: Number,
      default: 0
    },
    clicked: {
      type: Number,
      default: 0
    },
    bounced: {
      type: Number,
      default: 0
    },
    complaints: {
      type: Number,
      default: 0
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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
NewsletterSchema.index({ title: 'text', subject: 'text' });
NewsletterSchema.index({ status: 1 });
NewsletterSchema.index({ scheduledAt: 1 });
NewsletterSchema.index({ sentAt: -1 });
NewsletterSchema.index({ createdBy: 1 });

/**
 * プリセーブフック
 */
NewsletterSchema.pre('save', function(next) {
  // 更新日時
  this.updatedAt = Date.now();
  next();
});

// テンプレートスキーマ
const TemplateSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  content: {
    html: {
      type: String,
      required: true
    },
    text: {
      type: String
    }
  },
  thumbnail: {
    type: String
  },
  variables: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    defaultValue: {
      type: String
    }
  }],
  category: {
    type: String,
    trim: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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
TemplateSchema.index({ name: 'text', description: 'text' });
TemplateSchema.index({ category: 1 });
TemplateSchema.index({ createdBy: 1 });

/**
 * プリセーブフック
 */
TemplateSchema.pre('save', function(next) {
  // 更新日時
  this.updatedAt = Date.now();
  next();
});

// 送信履歴スキーマ
const DeliverySchema = new Schema({
  newsletter: {
    type: Schema.Types.ObjectId,
    ref: 'Newsletter',
    required: true
  },
  subscriber: {
    type: Schema.Types.ObjectId,
    ref: 'Subscriber',
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'failed'],
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  openedAt: {
    type: Date
  },
  clickedAt: {
    type: Date
  },
  bouncedAt: {
    type: Date
  },
  error: {
    type: String
  },
  metadata: {
    type: Map,
    of: String
  }
}, { timestamps: { createdAt: true, updatedAt: false } });

// インデックス設定
DeliverySchema.index({ newsletter: 1, subscriber: 1 });
DeliverySchema.index({ newsletter: 1, status: 1 });
DeliverySchema.index({ subscriber: 1 });
DeliverySchema.index({ sentAt: -1 });

// モデル登録
const Subscriber = mongoose.model('Subscriber', SubscriberSchema);
const Newsletter = mongoose.model('Newsletter', NewsletterSchema);
const Template = mongoose.model('Template', TemplateSchema);
const Delivery = mongoose.model('Delivery', DeliverySchema);

module.exports = {
  Subscriber,
  Newsletter,
  Template,
  Delivery
}; 