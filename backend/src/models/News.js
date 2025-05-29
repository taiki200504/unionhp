const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'タイトルは必須です'],
    trim: true
  },
  content: {
    type: String,
    required: [true, '内容は必須です']
  },
  summary: {
    type: String,
    required: [true, '要約は必須です'],
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'カテゴリーは必須です']
  },
  tags: [{
    type: String,
    trim: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '著者は必須です']
  },
  authorName: {
    type: String,
    required: [true, '著者名は必須です'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, '年は必須です'],
    min: [2000, '2000年以降の年を指定してください'],
    max: [new Date().getFullYear(), '現在の年以前を指定してください']
  },
  month: {
    type: Number,
    required: [true, '月は必須です'],
    min: [1, '1月から12月の間で指定してください'],
    max: [12, '1月から12月の間で指定してください']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  // アイキャッチ画像
  featuredImage: {
    type: String
  },
  // 添付ファイル（複数可）
  attachments: [{
    filename: String,     // 保存されたファイル名
    originalname: String, // 元のファイル名
    path: String,         // ファイルパス
    url: String,          // ファイルURL
    mimetype: String,     // MIMEタイプ
    size: Number          // ファイルサイズ（バイト）
  }],
  // 記事内画像（本文中で使用される画像）
  images: [{
    filename: String,
    path: String,
    url: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// インデックスの設定
newsSchema.index({ title: 'text', content: 'text', summary: 'text' });
newsSchema.index({ category: 1 });
newsSchema.index({ author: 1 });
newsSchema.index({ year: 1, month: 1 });
newsSchema.index({ isPublished: 1 });

// ステータスが「公開」に変更された場合に公開日時を設定
newsSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
    
    // 年の設定（公開日時から取得）
    if (!this.year) {
      this.year = new Date().getFullYear();
    }
  }
  next();
});

const News = mongoose.model('News', newsSchema);

module.exports = News; 