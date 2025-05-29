const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'カテゴリー名は必須です'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// スラッグの自動生成
categorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  next();
});

// カテゴリーへの参照を検索するスタティックメソッド
categorySchema.statics.findRelatedNews = async function(categoryId) {
  const News = mongoose.model('News');
  return await News.find({ category: categoryId, status: 'published' })
    .sort({ publishedAt: -1 });
};

module.exports = mongoose.model('Category', categorySchema); 