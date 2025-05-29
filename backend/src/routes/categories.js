const express = require('express');
const { body } = require('express-validator');
const categoryController = require('../controllers/categoryController');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const auditLog = require('../middleware/auditLog');
const { protect, restrictTo } = require('../middleware/auth');
const { apiLimiter, adminLimiter } = require('../middleware/rateLimiter');
const { buildSearchQuery, buildSortOptions, buildPagination, formatSearchResults } = require('../utils/search');
const { logger } = require('../utils/logger');
const Category = require('../models/Category');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: カテゴリAPI
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: カテゴリ一覧取得
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: カテゴリ一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 *   post:
 *     summary: カテゴリ新規作成
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: 作成成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
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
 *                         example: "カテゴリー名は必須です"
 *                       param:
 *                         type: string
 *                         example: "name"
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
 * /api/categories/{id}:
 *   get:
 *     summary: カテゴリ詳細取得
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: カテゴリ詳細
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *   patch:
 *     summary: カテゴリ更新
 *     tags: [Categories]
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
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
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
 *                         example: "カテゴリー名は必須です"
 *                       param:
 *                         type: string
 *                         example: "name"
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
 *                   example: "カテゴリが見つかりません。"
 *                 error:
 *                   type: string
 *                   example: null
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60f7c2b8e1b1c8a1b8e1b1c9"
 *         name:
 *           type: string
 *           example: "お知らせ"
 *         slug:
 *           type: string
 *           example: "news"
 *         description:
 *           type: string
 *           example: "UNIONからのお知らせカテゴリ"
 *         color:
 *           type: string
 *           example: "#FF0000"
 *         icon:
 *           type: string
 *           example: "fa-bullhorn"
 *         parent:
 *           type: string
 *           example: null
 *         order:
 *           type: integer
 *           example: 1
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
const searchFields = ['name', 'description'];

// カテゴリ一覧取得（検索・ページネーション付き）
router.get('/', apiLimiter, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { skip, limit: paginationLimit } = buildPagination(page, limit);
    
    const query = buildSearchQuery(req.query, searchFields);
    const sortOptions = buildSortOptions(req.query);
    
    const [categories, total] = await Promise.all([
      Category.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(paginationLimit),
      Category.countDocuments(query)
    ]);

    const results = formatSearchResults(categories, total, page, limit);
    logger.info('Categories list retrieved successfully');
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
});

// カテゴリ詳細取得
router.get('/:id', apiLimiter, async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    logger.info(`Category ${req.params.id} retrieved successfully`);
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
});

// カテゴリ作成（管理者のみ）
router.post('/',
  adminLimiter,
  protect,
  restrictTo('admin'),
  async (req, res, next) => {
    try {
      const category = await Category.create(req.body);
      logger.info(`Category created successfully: ${category._id}`);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }
);

// カテゴリ更新（管理者のみ）
router.patch('/:id',
  adminLimiter,
  protect,
  restrictTo('admin'),
  async (req, res, next) => {
    try {
      const category = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      logger.info(`Category ${req.params.id} updated successfully`);
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  }
);

// カテゴリ削除（管理者のみ）
router.delete('/:id',
  adminLimiter,
  protect,
  restrictTo('admin'),
  async (req, res, next) => {
    try {
      const category = await Category.findByIdAndDelete(req.params.id);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      logger.info(`Category ${req.params.id} deleted successfully`);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router; 