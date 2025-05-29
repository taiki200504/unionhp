const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['general', 'email', 'security', 'appearance', 'integration'],
    default: 'general'
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// インデックスの設定
settingSchema.index({ key: 1 }, { unique: true });
settingSchema.index({ category: 1 });
settingSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Setting', settingSchema); 