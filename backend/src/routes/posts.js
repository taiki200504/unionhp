const express = require('express');
const { check } = require('express-validator');
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/auth');
const auditLog = require('../middleware/auditLog');
const { protect, restrictTo } = require('../middleware/auth');
const { apiLimiter, adminLimiter } = require('../middleware/rateLimiter');
const { uploadImageSingle, handleUploadError } = require('../middleware/upload');
const { buildSearchQuery, buildSortOptions, buildPagination, formatSearchResults } = require('../utils/search');
const { logger } = require('../utils/logger');
const Post = require('../models/Post');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: 投稿API
 */

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: 投稿一覧取得
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: 投稿一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *   post:
 *     summary: 投稿新規作成
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: 作成成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
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
 * /api/posts/{id}:
 *   get:
 *     summary: 投稿詳細取得
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 投稿詳細
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *   patch:
 *     summary: 投稿更新
 *     tags: [Posts]
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
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
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
 *                   example: "投稿が見つかりません。"
 *                 error:
 *                   type: string
 *                   example: null
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60f7c2b8e1b1c8a1b8e1b1d0"
 *         title:
 *           type: string
 *           example: "UNIONイベント開催"
 *         content:
 *           type: string
 *           example: "UNION主催のイベントを開催します..."
 *         category_slug:
 *           type: string
 *           example: "event"
 *         group_slug:
 *           type: string
 *           example: "academic"
 *         author_name:
 *           type: string
 *           example: "学生団体A"
 *         featured_image:
 *           type: string
 *           example: "https://example.com/post.jpg"
 *         details:
 *           type: object
 *         contact:
 *           type: object
 *         is_featured:
 *           type: boolean
 *           example: false
 *         published_at:
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

// 投稿バリデーション
const postValidation = [
  check('title', 'タイトルは必須で、100文字以下である必要があります').not().isEmpty().isLength({ max: 100 }),
  check('content', '内容は必須です').not().isEmpty(),
  check('category', '有効なカテゴリーを選択してください').isIn(['event', 'recruit', 'report', 'collab', 'intern', 'announcement']),
  check('group', '有効なグループを選択してください').isIn(['academic', 'environment', 'volunteer', 'culture', 'startup', 'art', 'international', 'other']),
  check('status', '有効なステータスを選択してください').optional().isIn(['draft', 'published', 'rejected'])
];

// 検索可能なフィールド
const searchFields = ['title', 'content', 'author', 'category'];

// 投稿一覧取得（検索・ページネーション付き）
router.get('/', apiLimiter, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { skip, limit: paginationLimit } = buildPagination(page, limit);
    
    const query = buildSearchQuery(req.query, searchFields);
    const sortOptions = buildSortOptions(req.query);
    
    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(paginationLimit)
        .populate('author', 'name email')
        .populate('category', 'name slug'),
      Post.countDocuments(query)
    ]);

    const results = formatSearchResults(posts, total, page, limit);
    logger.info('Posts list retrieved successfully');
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
});

// 投稿詳細取得
router.get('/:id', apiLimiter, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name email')
      .populate('category', 'name slug');
      
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    logger.info(`Post ${req.params.id} retrieved successfully`);
    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
});

// 投稿作成（認証済みユーザー）
router.post('/',
  apiLimiter,
  protect,
  uploadImageSingle,
  handleUploadError,
  async (req, res, next) => {
    try {
      const postData = {
        ...req.body,
        author: req.user._id,
        image: req.file ? req.file.path : undefined
      };
      
      const post = await Post.create(postData);
      logger.info(`Post created successfully: ${post._id}`);
      res.status(201).json(post);
    } catch (error) {
      next(error);
    }
  }
);

// 投稿更新（投稿者または管理者）
router.patch('/:id',
  apiLimiter,
  protect,
  uploadImageSingle,
  handleUploadError,
  async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      // 投稿者または管理者のみ更新可能
      if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to update this post' });
      }
      
      const postData = {
        ...req.body,
        image: req.file ? req.file.path : undefined
      };
      
      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        postData,
        { new: true, runValidators: true }
      );
      
      logger.info(`Post ${req.params.id} updated successfully`);
      res.status(200).json(updatedPost);
    } catch (error) {
      next(error);
    }
  }
);

// 投稿削除（投稿者または管理者）
router.delete('/:id',
  apiLimiter,
  protect,
  async (req, res, next) => {
    try {
      const post = await Post.findById(req.params.id);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      // 投稿者または管理者のみ削除可能
      if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Not authorized to delete this post' });
      }
      
      await Post.findByIdAndDelete(req.params.id);
      
      logger.info(`Post ${req.params.id} deleted successfully`);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 