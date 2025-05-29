/**
 * コンテンツ関連のAPIスキーマ定義
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// コンテンツスキーマ
const ContentSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['published', 'draft', 'archived'],
    default: 'draft'
  },
  thumbnail: {
    type: String
  },
  category: {
    type: Schema.Types.ObjectId,
    ref: 'Category'
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  publishedAt: {
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
ContentSchema.index({ title: 'text', content: 'text', tags: 'text' });
ContentSchema.index({ slug: 1 });
ContentSchema.index({ category: 1 });
ContentSchema.index({ status: 1 });
ContentSchema.index({ featured: 1 });
ContentSchema.index({ publishedAt: -1 });

/**
 * プリセーブフック
 * - slugが未設定の場合、タイトルから自動生成
 * - publishedで保存される場合、publishedAtを設定
 */
ContentSchema.pre('save', function(next) {
  // 更新日時
  this.updatedAt = Date.now();
  
  // スラッグが未設定の場合、タイトルから生成
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  
  // 抜粋が未設定の場合、コンテンツから自動生成
  if (!this.excerpt && this.content) {
    // HTML除去とテキスト抽出
    const plainText = this.content.replace(/<[^>]*>/g, '');
    // 最初の160文字を抜粋として使用
    this.excerpt = plainText.length > 160 ? plainText.substring(0, 160) + '...' : plainText;
  }
  
  // 公開時に公開日を記録
  if (this.status === 'published' && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  
  next();
});

// カテゴリースキーマ
const CategorySchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  parent: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  children: [{
    type: Schema.Types.ObjectId,
    ref: 'Category'
  }],
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
CategorySchema.index({ name: 'text', description: 'text' });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ parent: 1 });

/**
 * プリセーブフック 
 * - slugが未設定の場合、名前から自動生成
 */
CategorySchema.pre('save', function(next) {
  // 更新日時
  this.updatedAt = Date.now();
  
  // スラッグが未設定の場合、名前から生成
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  
  next();
});

// タグスキーマ
const TagSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  count: {
    type: Number,
    default: 0
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

/**
 * プリセーブフック
 * - slugが未設定の場合、名前から自動生成
 */
TagSchema.pre('save', function(next) {
  // 更新日時
  this.updatedAt = Date.now();
  
  // スラッグが未設定の場合、名前から生成
  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  
  next();
});

// モデル登録
const Content = mongoose.model('Content', ContentSchema);
const Category = mongoose.model('Category', CategorySchema);
const Tag = mongoose.model('Tag', TagSchema);

module.exports = {
  Content,
  Category,
  Tag
}; 