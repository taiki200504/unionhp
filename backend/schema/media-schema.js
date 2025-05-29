/**
 * メディア関連のAPIスキーマ定義
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// メディアスキーマ
const MediaSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  fileName: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['image', 'video', 'audio', 'document', 'other'],
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  dimensions: {
    width: Number,
    height: Number
  },
  duration: {
    type: Number // 動画・音声のみ
  },
  alt: {
    type: String
  },
  caption: {
    type: String
  },
  folder: {
    type: String,
    default: '/'
  },
  uploader: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  usage: [
    {
      entity: {
        type: String,
        enum: ['content', 'category', 'user', 'newsletter']
      },
      entityId: {
        type: Schema.Types.ObjectId
      }
    }
  ],
  metadata: {
    type: Map,
    of: String
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
MediaSchema.index({ name: 'text' });
MediaSchema.index({ fileName: 1 });
MediaSchema.index({ type: 1 });
MediaSchema.index({ folder: 1 });
MediaSchema.index({ uploader: 1 });
MediaSchema.index({ 'usage.entity': 1, 'usage.entityId': 1 });

/**
 * プリセーブフック
 */
MediaSchema.pre('save', function(next) {
  // 更新日時
  this.updatedAt = Date.now();
  next();
});

// メディアフォルダスキーマ
const MediaFolderSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  path: {
    type: String,
    required: true,
    unique: true
  },
  parent: {
    type: String,
    default: '/'
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
MediaFolderSchema.index({ path: 1 });
MediaFolderSchema.index({ parent: 1 });

/**
 * プリセーブフック
 */
MediaFolderSchema.pre('save', function(next) {
  // 更新日時
  this.updatedAt = Date.now();
  next();
});

// モデル登録
const Media = mongoose.model('Media', MediaSchema);
const MediaFolder = mongoose.model('MediaFolder', MediaFolderSchema);

module.exports = {
  Media,
  MediaFolder
}; 