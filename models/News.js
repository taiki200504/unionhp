const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'タイトルは必須です'],
    trim: true,
    maxlength: [200, 'タイトルは200文字以内で入力してください']
  },
  content: {
    type: String,
    required: [true, '内容は必須です'],
    trim: true
  },
  author: {
    type: String,
    required: [true, '著者は必須です'],
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  year: { 
    type: Number, 
    required: true,
    default: new Date().getFullYear() // 現在の年をデフォルト値に
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // createdAt、updatedAtフィールドを自動生成
});

// インデックスの作成
newsSchema.index({ title: 'text', content: 'text' });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ tags: 1 });

// 年ごとのニュース記事を取得するための静的メソッド
newsSchema.statics.findByYear = function(year) {
  return this.find({ year: parseInt(year) }).sort({ publishedAt: -1 });
};

// 利用可能な年のリストを取得するための静的メソッド
newsSchema.statics.getAvailableYears = async function() {
  const years = await this.distinct('year');
  return years.sort((a, b) => b - a); // 降順にソート
};

const News = mongoose.model('News', newsSchema);

module.exports = News; 