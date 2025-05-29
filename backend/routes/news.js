const express = require('express');
const router = express.Router();
const News = require('../models/news');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

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
 *     summary: ニュース一覧取得
 *     tags: [News]
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: string
 *         description: 年でフィルタ
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: カテゴリでフィルタ
 *     responses:
 *       200:
 *         description: ニュース一覧
 *   post:
 *     summary: ニュース新規作成
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
 */

/**
 * @swagger
 * /api/news/{id}:
 *   get:
 *     summary: ニュース詳細取得
 *     tags: [News]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ニュース詳細
 *   put:
 *     summary: ニュース更新
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
 *   delete:
 *     summary: ニュース削除
 *     tags: [News]
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
 */

// ニュース一覧の取得
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const news = await News.find()
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await News.countDocuments();

    res.json({
      news,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalNews: total
    });
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました', error: error.message });
  }
});

// ニュース詳細の取得
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'ニュースが見つかりません' });
    }
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました', error: error.message });
  }
});

// ニュースの作成（管理者のみ）
router.post('/',
  auth.requireAdmin,
  [
    body('title').isString().isLength({ min: 1, max: 200 }).withMessage('タイトルは1〜200文字で入力してください'),
    body('content').isString().isLength({ min: 1 }).withMessage('内容は必須です'),
    body('author').isString().isLength({ min: 1, max: 100 }).withMessage('著者は必須です'),
    body('image').optional().isString(),
    body('category').optional().isString(),
    body('tags').optional().isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'バリデーションエラー', errors: errors.array() });
    }
    try {
      const news = new News({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author,
        image: req.body.image,
        category: req.body.category,
        tags: req.body.tags,
        publishedAt: new Date()
      });
      await news.save();
      res.status(201).json(news);
    } catch (error) {
      res.status(400).json({ message: '無効なデータです', error: error.message });
    }
  }
);

// ニュースの更新（管理者のみ）
router.put('/:id',
  auth.requireAdmin,
  [
    body('title').optional().isString().isLength({ min: 1, max: 200 }).withMessage('タイトルは1〜200文字で入力してください'),
    body('content').optional().isString().isLength({ min: 1 }).withMessage('内容は必須です'),
    body('author').optional().isString().isLength({ min: 1, max: 100 }).withMessage('著者は必須です'),
    body('image').optional().isString(),
    body('category').optional().isString(),
    body('tags').optional().isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'バリデーションエラー', errors: errors.array() });
    }
    try {
      const news = await News.findByIdAndUpdate(
        req.params.id,
        {
          title: req.body.title,
          content: req.body.content,
          author: req.body.author,
          image: req.body.image,
          category: req.body.category,
          tags: req.body.tags,
          updatedAt: new Date()
        },
        { new: true }
      );
      if (!news) {
        return res.status(404).json({ message: 'ニュースが見つかりません' });
      }
      res.json(news);
    } catch (error) {
      res.status(400).json({ message: '無効なデータです', error: error.message });
    }
  }
);

// ニュースの削除（管理者のみ）
router.delete('/:id', auth.requireAdmin, async (req, res) => {
  try {
    const news = await News.findByIdAndDelete(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'ニュースが見つかりません' });
    }
    res.json({ message: 'ニュースを削除しました' });
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました', error: error.message });
  }
});

module.exports = router; 