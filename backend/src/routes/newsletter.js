const express = require('express');
const { body } = require('express-validator');
const newsletterController = require('../controllers/newsletterController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const auditLog = require('../middleware/auditLog');
const { protect, restrictTo } = require('../middleware/auth');
const { apiLimiter, adminLimiter } = require('../middleware/rateLimiter');
const { buildSearchQuery, buildSortOptions, buildPagination, formatSearchResults } = require('../utils/search');
const { logger } = require('../utils/logger');
const Newsletter = require('../models/Newsletter');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Newsletter
 *   description: ニュースレターAPI
 */

/**
 * @swagger
 * /api/newsletter:
 *   get:
 *     summary: ニュースレター一覧取得
 *     tags: [Newsletter]
 *     responses:
 *       200:
 *         description: ニュースレター一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Newsletter'
 *   post:
 *     summary: ニュースレター新規作成
 *     tags: [Newsletter]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Newsletter'
 *     responses:
 *       201:
 *         description: 作成成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Newsletter'
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
 * /api/newsletter/{id}:
 *   get:
 *     summary: ニュースレター詳細取得
 *     tags: [Newsletter]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ニュースレター詳細
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Newsletter'
 *   patch:
 *     summary: ニュースレター更新
 *     tags: [Newsletter]
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
 *             $ref: '#/components/schemas/Newsletter'
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Newsletter'
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
 *                   example: "ニュースレターが見つかりません。"
 *                 error:
 *                   type: string
 *                   example: null
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Newsletter:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60f7c2b8e1b1c8a1b8e1b1f0"
 *         title:
 *           type: string
 *           example: "UNIONニュースレター"
 *         content:
 *           type: string
 *           example: "UNIONからの最新情報をお届けします..."
 *         status:
 *           type: string
 *           example: "draft"
 *         sent_at:
 *           type: string
 *           format: date-time
 *           example: "2024-04-01T12:00:00Z"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2024-03-31T10:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2024-04-01T12:00:00Z"
 */

// 検索可能なフィールド
const searchFields = ['title', 'content', 'status'];

// ニュースレター一覧取得（検索・ページネーション付き）
router.get('/', apiLimiter, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { skip, limit: paginationLimit } = buildPagination(page, limit);
    
    const query = buildSearchQuery(req.query, searchFields);
    const sortOptions = buildSortOptions(req.query);
    
    const [newsletters, total] = await Promise.all([
      Newsletter.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(paginationLimit),
      Newsletter.countDocuments(query)
    ]);

    const results = formatSearchResults(newsletters, total, page, limit);
    logger.info('Newsletters list retrieved successfully');
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
});

// ニュースレター詳細取得
router.get('/:id', apiLimiter, async (req, res, next) => {
  try {
    const newsletter = await Newsletter.findById(req.params.id);
    if (!newsletter) {
      return res.status(404).json({ message: 'Newsletter not found' });
    }
    logger.info(`Newsletter ${req.params.id} retrieved successfully`);
    res.status(200).json(newsletter);
  } catch (error) {
    next(error);
  }
});

// ニュースレター作成（管理者のみ）
router.post('/',
  adminLimiter,
  protect,
  restrictTo('admin'),
  async (req, res, next) => {
    try {
      const newsletter = await Newsletter.create(req.body);
      logger.info(`Newsletter created successfully: ${newsletter._id}`);
      res.status(201).json(newsletter);
    } catch (error) {
      next(error);
    }
  }
);

// ニュースレター更新（管理者のみ）
router.patch('/:id',
  adminLimiter,
  protect,
  restrictTo('admin'),
  async (req, res, next) => {
    try {
      const newsletter = await Newsletter.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!newsletter) {
        return res.status(404).json({ message: 'Newsletter not found' });
      }
      
      logger.info(`Newsletter ${req.params.id} updated successfully`);
      res.status(200).json(newsletter);
    } catch (error) {
      next(error);
    }
  }
);

// ニュースレター削除（管理者のみ）
router.delete('/:id',
  adminLimiter,
  protect,
  restrictTo('admin'),
  async (req, res, next) => {
    try {
      const newsletter = await Newsletter.findByIdAndDelete(req.params.id);
      
      if (!newsletter) {
        return res.status(404).json({ message: 'Newsletter not found' });
      }
      
      logger.info(`Newsletter ${req.params.id} deleted successfully`);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

// ニュースレター配信（管理者のみ）
router.post('/:id/send',
  adminLimiter,
  protect,
  restrictTo('admin'),
  async (req, res, next) => {
    try {
      const newsletter = await Newsletter.findById(req.params.id);
      
      if (!newsletter) {
        return res.status(404).json({ message: 'Newsletter not found' });
      }
      
      // 配信処理を実装
      // TODO: メール送信処理の実装
      
      newsletter.status = 'sent';
      newsletter.sentAt = new Date();
      await newsletter.save();
      
      logger.info(`Newsletter ${req.params.id} sent successfully`);
      res.status(200).json({ message: 'Newsletter sent successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// 公開ルート - 購読登録
router.post('/subscribe',
  [
    body('email')
      .isEmail()
      .withMessage('有効なメールアドレスを入力してください'),
    body('name')
      .optional()
      .isString()
      .trim()
  ],
  newsletterController.subscribe
);

// 購読確認
router.get('/confirm/:token', newsletterController.confirmSubscription);

// 購読解除
router.get('/unsubscribe/:token', newsletterController.unsubscribe);

// 購読者リストの取得（管理者専用）
router.get('/subscribers', 
  checkRole(['admin']), 
  newsletterController.getSubscribers
);

// ニュースレターの手動送信（管理者専用）
router.post('/send',
  checkRole(['admin']),
  [
    body('testEmail').optional().isEmail().withMessage('有効なテストメールアドレスを入力してください'),
    body('newsIds').optional().isArray(),
    body('categories').optional().isArray()
  ],
  newsletterController.sendNewsletter
);

module.exports = router; 