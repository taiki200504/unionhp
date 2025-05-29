const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'タイトルは必須です'],
    trim: true,
    maxlength: [100, 'タイトルは100文字以内である必要があります']
  },
  content: {
    type: String,
    required: [true, '内容は必須です']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['event', 'recruit', 'report', 'collab', 'intern', 'announcement'],
    required: true
  },
  group: {
    type: String,
    enum: ['academic', 'environment', 'volunteer', 'culture', 'startup', 'art', 'international', 'other'],
    required: true
  },
  featuredImage: {
    type: String
  },
  details: {
    type: Map,
    of: String
  },
  contact: {
    email: String,
    phone: String,
    website: String
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'rejected'],
    default: 'draft'
  },
  publishedAt: {
    type: Date
  },
  viewCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// インデックスの設定
postSchema.index({ title: 'text', content: 'text' });

// ステータスが「公開」に変更された場合に公開日時を設定
postSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post; 