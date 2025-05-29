require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

// ルートのインポート
const newsRoutes = require('./backend/routes/news');
const authRoutes = require('./backend/routes/auth');
const uploadRoutes = require('./backend/routes/upload');

const app = express();

// ミドルウェアの設定
const allowedOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'];
app.use(cors({
  origin: function(origin, callback) {
    // 開発時はoriginがundefinedの場合も許可
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('CORSポリシー違反: ' + origin));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'public')));

// APIルートの設定
app.use('/api/news', newsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// Swagger設定
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'UNION API ドキュメント',
    version: '1.0.0',
    description: 'UNION HP/CMS用APIの仕様書',
  },
  servers: [
    { url: 'http://localhost:3000', description: 'ローカル開発環境' }
  ],
};
const options = {
  swaggerDefinition,
  apis: ['./backend/routes/*.js', './models/*.js'],
};
const swaggerSpec = swaggerJSDoc(options);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// MongoDBの接続
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDBに接続しました'))
.catch(err => console.error('MongoDBの接続に失敗しました:', err));

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'サーバーエラーが発生しました',
    error: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// 404エラーハンドリング
app.use((req, res) => {
  res.status(404).json({ message: 'リソースが見つかりません' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
}); 