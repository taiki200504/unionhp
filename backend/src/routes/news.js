const express = require('express');
const { body } = require('express-validator');
const newsController = require('../controllers/newsController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const auditLog = require('../middleware/auditLog');
const { protect, restrictTo } = require('../middleware/auth');
const { apiLimiter, adminLimiter } = require('../middleware/rateLimiter');
const { uploadImageSingle, handleUploadError } = require('../middleware/upload');
const { buildSearchQuery, buildSortOptions, buildPagination, formatSearchResults } = require('../utils/search');
const { logger } = require('../utils/logger');
const News = require('../models/News');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: News
 *   description: ニュースAPI
 */

/**
 * @swagger
 * /api/news:
 *   get:
 *     summary: ニュース記事一覧取得
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: 年でフィルタ
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: カテゴリーIDでフィルタ
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 検索ワード
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: タグでフィルタ
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: ページ番号
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 1ページあたり件数
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *         description: 注目記事のみ
 *     responses:
 *       200:
 *         description: ニュース記事一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 news:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/News'
 *                 currentPage:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 10
 *                 totalNews:
 *                   type: integer
 *                   example: 100
 *   post:
 *     summary: ニュース記事新規作成
 *     tags: [News]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/News'
 *     responses:
 *       201:
 *         description: 作成成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
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
 * /api/news/{id}:
 *   get:
 *     summary: ニュース記事詳細取得
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ニュース記事詳細
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
 *   patch:
 *     summary: ニュース記事更新
 *     tags: [News]
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
 *             $ref: '#/components/schemas/News'
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
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
 *                   example: "ニュース記事が見つかりません。"
 *                 error:
 *                   type: string
 *                   example: null
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     News:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60f7c2b8e1b1c8a1b8e1b1c8"
 *         title:
 *           type: string
 *           example: "UNION新プロジェクト発表"
 *         content:
 *           type: string
 *           example: "UNIONは新たなプロジェクトを開始します..."
 *         category:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               example: "60f7c2b8e1b1c8a1b8e1b1c9"
 *             name:
 *               type: string
 *               example: "お知らせ"
 *             slug:
 *               type: string
 *               example: "news"
 *         author_name:
 *           type: string
 *           example: "山田太郎"
 *         featured_image:
 *           type: string
 *           example: "https://example.com/image.jpg"
 *         is_featured:
 *           type: boolean
 *           example: false
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["イベント", "新着"]
 *         year:
 *           type: integer
 *           example: 2024
 *         published_at:
 *           type: string
 *           format: date-time
 *           example: "2024-04-01T12:00:00Z"
 *         view_count:
 *           type: integer
 *           example: 123
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2024-03-31T10:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2024-04-01T12:00:00Z"
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *         images:
 *           type: array
 *           items:
 *             type: object
 */

// 検索可能なフィールド
const searchFields = ['title', 'content', 'category'];

// ニュース一覧取得（検索・ページネーション付き）
router.get('/', apiLimiter, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { skip, limit: paginationLimit } = buildPagination(page, limit);
    
    const query = buildSearchQuery(req.query, searchFields);
    const sortOptions = buildSortOptions(req.query);
    
    const [news, total] = await Promise.all([
      News.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(paginationLimit)
        .populate('category', 'name slug'),
      News.countDocuments(query)
    ]);

    const results = formatSearchResults(news, total, page, limit);
    logger.info('News list retrieved successfully');
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
});

// ニュース詳細取得
router.get('/:id', apiLimiter, async (req, res, next) => {
  try {
    const news = await News.findById(req.params.id).populate('category', 'name slug');
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    logger.info(`News ${req.params.id} retrieved successfully`);
    res.status(200).json(news);
  } catch (error) {
    next(error);
  }
});

// ニュース作成（管理者のみ）
router.post('/', 
  adminLimiter,
  protect, 
  restrictTo('admin'),
  uploadImageSingle,
  handleUploadError,
  async (req, res, next) => {
    try {
      const newsData = {
        ...req.body,
        image: req.file ? req.file.path : undefined
      };
      
      const news = await News.create(newsData);
      logger.info(`News created successfully: ${news._id}`);
      res.status(201).json(news);
    } catch (error) {
      next(error);
    }
  }
);

// ニュース更新（管理者のみ）
router.patch('/:id',
  adminLimiter,
  protect,
  restrictTo('admin'),
  uploadImageSingle,
  handleUploadError,
  async (req, res, next) => {
    try {
      const newsData = {
        ...req.body,
        image: req.file ? req.file.path : undefined
      };
      
      const news = await News.findByIdAndUpdate(
        req.params.id,
        newsData,
        { new: true, runValidators: true }
      );
      
      if (!news) {
        return res.status(404).json({ message: 'News not found' });
      }
      
      logger.info(`News ${req.params.id} updated successfully`);
      res.status(200).json(news);
    } catch (error) {
      next(error);
    }
  }
);

// ニュース削除（管理者のみ）
router.delete('/:id',
  adminLimiter,
  protect,
  restrictTo('admin'),
  async (req, res, next) => {
    try {
      const news = await News.findByIdAndDelete(req.params.id);
      
      if (!news) {
        return res.status(404).json({ message: 'News not found' });
      }
      
      logger.info(`News ${req.params.id} deleted successfully`);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 