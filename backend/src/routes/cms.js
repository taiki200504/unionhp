const express = require('express');
const { body } = require('express-validator');
const cmsController = require('../controllers/cmsController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const auditLog = require('../middleware/auditLog');
const { protect, restrictTo } = require('../middleware/auth');
const { apiLimiter, adminLimiter } = require('../middleware/rateLimiter');
const { uploadImageSingle, handleUploadError } = require('../middleware/upload');
const { buildSearchQuery, buildSortOptions, buildPagination, formatSearchResults } = require('../utils/search');
const { logger } = require('../utils/logger');
const Page = require('../models/Page');
const { verifyToken } = require('../utils/auth');
const CMS = require('../models/cms');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: CMS
 *   description: CMS API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CMS:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60f7c2b8e1b1c8a1b8e1b1g0"
 *         title:
 *           type: string
 *           example: "UNION CMS"
 *         content:
 *           type: string
 *           example: "UNION CMSの内容です..."
 *         status:
 *           type: string
 *           example: "published"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2024-03-31T10:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2024-04-01T12:00:00Z"
 */

/**
 * @swagger
 * /api/cms:
 *   get:
 *     summary: CMS一覧取得
 *     tags: [CMS]
 *     responses:
 *       200:
 *         description: CMS一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CMS'
 *   post:
 *     summary: CMS新規作成
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CMS'
 *     responses:
 *       201:
 *         description: 作成成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CMS'
 *       400:
 *         description: バリデーションエラー
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "バリデーションエラー"
 *                 error:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "タイトルは必須です"
 *                       param:
 *                         type: string
 *                         example: "title"
 *                       location:
 *                         type: string
 *                         example: "body"
 *       401:
 *         description: 認証エラー
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "認証が必要です"
 *                 error:
 *                   type: string
 *                   example: null
 *       403:
 *         description: 権限エラー
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "権限がありません"
 *                 error:
 *                   type: string
 *                   example: null
 */

/**
 * @swagger
 * /api/cms/{id}:
 *   get:
 *     summary: CMS詳細取得
 *     tags: [CMS]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: CMS詳細
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CMS'
 *   patch:
 *     summary: CMS更新
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CMS'
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CMS'
 *       400:
 *         description: バリデーションエラー
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "バリデーションエラー"
 *                 error:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "タイトルは必須です"
 *                       param:
 *                         type: string
 *                         example: "title"
 *                       location:
 *                         type: string
 *                         example: "body"
 *       401:
 *         description: 認証エラー
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "認証が必要です"
 *                 error:
 *                   type: string
 *                   example: null
 *       403:
 *         description: 権限エラー
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "権限がありません"
 *                 error:
 *                   type: string
 *                   example: null
 *       404:
 *         description: リソース未発見
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "CMSが見つかりません。"
 *                 error:
 *                   type: string
 *                   example: null
 *   delete:
 *     summary: CMS削除
 *     tags: [CMS]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 削除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "削除に成功しました"
 *       401:
 *         description: 認証エラー
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "認証が必要です"
 *                 error:
 *                   type: string
 *                   example: null
 *       403:
 *         description: 権限エラー
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "権限がありません"
 *                 error:
 *                   type: string
 *                   example: null
 *       404:
 *         description: リソース未発見
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "CMSが見つかりません。"
 *                 error:
 *                   type: string
 *                   example: null
 */

// 認証ミドルウェア
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: '認証が必要です' });
    }
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: '無効なトークンです' });
  }
};

// 管理者権限チェックミドルウェア
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: '管理者権限が必要です' });
  }
  next();
};

// 全てのエンドポイントに認証を要求
router.use(auth.protect);

// 管理者または編集者権限が必要なエンドポイント
router.use(checkRole(['admin', 'editor']));

// ダッシュボード統計データ
router.get('/dashboard', cmsController.getDashboardStats);

// コンテンツ一覧（すべてのコンテンツタイプ）
router.get('/content', cmsController.getAllContent);

// 特定のコンテンツタイプのリスト取得
router.get('/content/:type', cmsController.getContentByType);

// ドラフト記事の取得
router.get('/drafts', cmsController.getDrafts);

// 公開済み記事の取得
router.get('/published', cmsController.getPublished);

// アーカイブ済み記事の取得
router.get('/archived', cmsController.getArchived);

// 特集記事の管理
router.get('/featured', cmsController.getFeatured);
router.post('/featured/:id', cmsController.toggleFeatured);

// メディア管理
router.get('/media', cmsController.getMedia);
router.delete('/media/:filename', cmsController.deleteMedia);
router.post('/media/organize', cmsController.organizeMedia);

// ユーザー活動ログ
router.get('/activity-log', cmsController.getActivityLog);

// サイト設定
router.get('/settings', cmsController.getSettings);
router.patch('/settings', 
  checkRole(['admin']),  // 設定変更は管理者のみ
  cmsController.updateSettings
);

// router.delete('/:id',
//   checkRole(['admin', 'editor']),
//   auditLog('delete', 'cms'),
//   cmsController.deleteCMS
// );

// 検索可能なフィールド
const searchFields = ['title', 'content', 'slug', 'status'];

// ページ一覧取得（検索・ページネーション付き）
router.get('/', apiLimiter, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { skip, limit: paginationLimit } = buildPagination(page, limit);
    
    const query = buildSearchQuery(req.query, searchFields);
    const sortOptions = buildSortOptions(req.query);
    
    const [pages, total] = await Promise.all([
      Page.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(paginationLimit),
      Page.countDocuments(query)
    ]);

    const results = formatSearchResults(pages, total, page, limit);
    logger.info('Pages list retrieved successfully');
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
});

// ページ詳細取得（スラッグまたはID）
router.get('/:identifier', apiLimiter, async (req, res, next) => {
  try {
    const page = await Page.findOne({
      $or: [
        { slug: req.params.identifier },
        { _id: req.params.identifier }
      ]
    });
    
    if (!page) {
      return res.status(404).json({ message: 'Page not found' });
    }
    
    logger.info(`Page ${req.params.identifier} retrieved successfully`);
    res.status(200).json(page);
  } catch (error) {
    next(error);
  }
});

// ページ作成（管理者のみ）
router.post('/',
  adminLimiter,
  protect,
  restrictTo('admin'),
  uploadImageSingle,
  handleUploadError,
  async (req, res, next) => {
    try {
      const pageData = {
        ...req.body,
        image: req.file ? req.file.path : undefined
      };
      
      const page = await Page.create(pageData);
      logger.info(`Page created successfully: ${page._id}`);
      res.status(201).json(page);
    } catch (error) {
      next(error);
    }
  }
);

// ページ更新（管理者のみ）
router.patch('/:id',
  adminLimiter,
  protect,
  restrictTo('admin'),
  uploadImageSingle,
  handleUploadError,
  async (req, res, next) => {
    try {
      const pageData = {
        ...req.body,
        image: req.file ? req.file.path : undefined
      };
      
      const page = await Page.findByIdAndUpdate(
        req.params.id,
        pageData,
        { new: true, runValidators: true }
      );
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      logger.info(`Page ${req.params.id} updated successfully`);
      res.status(200).json(page);
    } catch (error) {
      next(error);
    }
  }
);

// ページ削除（管理者のみ）
router.delete('/:id',
  adminLimiter,
  protect,
  restrictTo('admin'),
  async (req, res, next) => {
    try {
      const page = await Page.findByIdAndDelete(req.params.id);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      logger.info(`Page ${req.params.id} deleted successfully`);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// ページの公開状態変更（管理者のみ）
router.patch('/:id/publish',
  adminLimiter,
  protect,
  restrictTo('admin'),
  async (req, res, next) => {
    try {
      const page = await Page.findById(req.params.id);
      
      if (!page) {
        return res.status(404).json({ message: 'Page not found' });
      }
      
      page.status = page.status === 'published' ? 'draft' : 'published';
      page.publishedAt = page.status === 'published' ? new Date() : undefined;
      await page.save();
      
      logger.info(`Page ${req.params.id} ${page.status} successfully`);
      res.status(200).json(page);
    } catch (error) {
      next(error);
    }
  }
);

// CMS一覧の取得
router.get('/cms', async (req, res) => {
  try {
    const cms = await CMS.find().sort({ createdAt: -1 });
    res.json(cms);
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 特定のCMSの取得
router.get('/cms/:id', async (req, res) => {
  try {
    const cms = await CMS.findById(req.params.id);
    if (!cms) {
      return res.status(404).json({ message: 'CMSが見つかりません' });
    }
    res.json(cms);
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// CMSの作成
router.post('/cms', authenticate, isAdmin, async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'タイトルと内容は必須です' });
    }
    const cms = new CMS({
      title,
      content,
      author: req.user.id
    });
    await cms.save();
    res.status(201).json(cms);
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// CMSの更新
router.patch('/cms/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { title, content } = req.body;
    const cms = await CMS.findById(req.params.id);
    if (!cms) {
      return res.status(404).json({ message: 'CMSが見つかりません' });
    }
    if (title) cms.title = title;
    if (content) cms.content = content;
    await cms.save();
    res.json(cms);
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// CMSの削除
router.delete('/cms/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const cms = await CMS.findByIdAndDelete(req.params.id);
    if (!cms) {
      return res.status(404).json({ message: 'CMSが見つかりません' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

module.exports = router; 