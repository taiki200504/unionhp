const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();
const rateLimit = require('express-rate-limit');

// ルーターをインポート
const postRoutes = require('./routes/posts');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const uploadRoutes = require('./routes/upload');
const categoryRoutes = require('./routes/categories');
const searchRoutes = require('./routes/search');
const newsletterRoutes = require('./routes/newsletter');
const cmsRoutes = require('./routes/cms');

// アプリケーションの初期化
const app = express();
const PORT = process.env.NODE_ENV === 'test' ? 5002 : process.env.PORT || 5001;

// ミドルウェアの設定
app.use(helmet()); // セキュリティヘッダーの設定
app.use(morgan('dev')); // リクエストログ
app.use(cors()); // CORS設定
app.use(express.json()); // JSONリクエストボディの解析
app.use(express.urlencoded({ extended: true })); // URL encoded形式のリクエストボディの解析

// 静的ファイルの提供
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// レートリミット（1分間に100リクエストまで）
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1分
  max: 100,
  message: { message: 'リクエストが多すぎます。しばらくしてから再度お試しください。', error: null }
});
app.use('/api/', apiLimiter);

// データベース接続
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/union_hp')
  .then(() => {
    console.log('MongoDB接続成功');
  })
  .catch((err) => {
    console.error('MongoDB接続エラー:', err);
    process.exit(1);
  });

// ルートの設定
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/cms', cmsRoutes);

// 基本ルート
app.get('/', (req, res) => {
  res.json({ message: 'UNION HP API サーバーが稼働中です' });
});

// 死活監視エンドポイント
app.get('/health', async (req, res) => {
  let dbStatus = 'unknown';
  try {
    dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  } catch (e) {
    dbStatus = 'error';
  }
  res.json({
    status: 'ok',
    db: dbStatus
  });
});

// エラーハンドリング
app.use((req, res, next) => {
  const error = new Error('リソースが見つかりません');
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーがポート${PORT}で起動しました`);
});

module.exports = app; 