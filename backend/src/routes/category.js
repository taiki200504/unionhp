const express = require('express');
const router = express.Router();
const { verifyToken } = require('../utils/auth');
const Category = require('../models/category');

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

// カテゴリー一覧の取得
router.get('/', async (req, res) => {
  try {
    const { name } = req.query;
    const query = name ? { name: new RegExp(name, 'i') } : {};
    const categories = await Category.find(query).sort({ name: 1 });
    res.json({ data: categories });
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// 特定のカテゴリーの取得
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'カテゴリーが見つかりません' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// カテゴリーの作成
router.post('/', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'カテゴリー名は必須です' });
    }
    const category = new Category({
      name,
      description
    });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'このカテゴリー名は既に使用されています' });
    }
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// カテゴリーの更新
router.patch('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'カテゴリーが見つかりません' });
    }
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    await category.save();
    res.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'このカテゴリー名は既に使用されています' });
    }
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// カテゴリーの削除
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'カテゴリーが見つかりません' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

module.exports = router; 