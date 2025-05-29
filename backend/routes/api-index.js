/**
 * API ルートインデックス
 * APIエンドポイントを結合し、公開します
 */
const express = require('express');
const router = express.Router();

// 認証ミドルウェア
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// API ルート
const authRoutes = require('./auth-routes');
const contentRoutes = require('./content-routes');
const categoryRoutes = require('./category-routes');
const mediaRoutes = require('./media-routes');
const newsletterRoutes = require('./newsletter-routes');
const userRoutes = require('./user-routes');

// ヘルスチェック
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'UNION CMS API is running',
    timestamp: new Date().toISOString()
  });
});

// API バージョンとドキュメントのエンドポイント
router.get('/', (req, res) => {
  res.status(200).json({
    name: 'UNION CMS API',
    version: '1.0.0',
    description: 'Content Management API for UNION website',
    documentation: '/docs',
    endpoints: {
      auth: '/api/auth',
      cms: '/api/cms',
      content: '/api/contents',
      category: '/api/categories',
      media: '/api/media',
      newsletter: '/api/newsletter',
      user: '/api/users'
    }
  });
});

// 認証ルート（トークン必須なし）
router.use('/auth', authRoutes);

// コンテンツルート（一部認証必須）
router.use('/contents', contentRoutes);

// カテゴリールート（一部認証必須）
router.use('/categories', categoryRoutes);

// メディアルート（一部認証必須）
router.use('/media', mediaRoutes);

// ニュースレタールート（一部認証必須）
router.use('/newsletter', newsletterRoutes);

// ユーザールート（認証必須）
router.use('/users', authMiddleware, userRoutes);

// CMS特有のエンドポイント（認証必須）
router.use('/cms', authMiddleware, require('./cms-routes'));

// 404ハンドラー
router.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Endpoint ${req.baseUrl}${req.url} does not exist`
  });
});

module.exports = router; 