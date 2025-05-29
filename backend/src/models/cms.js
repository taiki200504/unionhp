const mongoose = require('mongoose');

const cmsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'タイトルは必須です'],
    trim: true
  },
  content: {
    type: String,
    required: [true, '内容は必須です']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '著者は必須です']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// インデックスの設定
cmsSchema.index({ title: 'text', content: 'text' });
cmsSchema.index({ author: 1 });
cmsSchema.index({ isPublished: 1 });

module.exports = mongoose.model('CMS', cmsSchema); 