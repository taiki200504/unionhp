const Category = require('../models/Category');
const News = require('../models/News');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

/**
 * すべてのカテゴリーを取得
 * @route GET /api/categories
 * @access Public
 */
exports.getAllCategories = async (req, res) => {
  try {
    // クエリパラメータを取得
    const { parent, sort = 'order' } = req.query;
    
    // クエリを構築
    const query = {};
    
    // 親カテゴリーでフィルター
    if (parent) {
      if (parent === 'null') {
        query.parent = null;
      } else {
        query.parent = parent;
      }
    }
    
    // ソート条件を決定
    let sortOption = {};
    if (sort === 'name') {
      sortOption = { name: 1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else {
      sortOption = { order: 1 };
    }
    
    // カテゴリーを取得
    const categories = await Category.find(query)
      .sort(sortOption)
      .populate('parent', 'name slug');
    
    // 各カテゴリーに関連するニュース記事数を追加
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await News.countDocuments({ 
          category: category._id, 
          status: 'published' 
        });
        
        return {
          id: category._id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          color: category.color,
          icon: category.icon,
          parent: category.parent,
          order: category.order,
          news_count: count,
          created_at: category.createdAt,
          updated_at: category.updatedAt
        };
      })
    );
    
    res.status(200).json({
      status: 'success',
      results: categoriesWithCounts.length,
      categories: categoriesWithCounts
    });
  } catch (error) {
    console.error('カテゴリー取得エラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'カテゴリーの取得中にエラーが発生しました。'
    });
  }
};

/**
 * 特定のカテゴリーを取得
 * @route GET /api/categories/:id
 * @access Public
 */
exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // IDかスラッグかを判定
    const query = mongoose.isValidObjectId(id) 
      ? { _id: id } 
      : { slug: id };
    
    const category = await Category.findOne(query)
      .populate('parent', 'name slug');
    
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'カテゴリーが見つかりません。'
      });
    }
    
    // 関連するニュース記事数を取得
    const newsCount = await News.countDocuments({ 
      category: category._id, 
      status: 'published' 
    });
    
    // 子カテゴリーを取得
    const childCategories = await Category.find({ parent: category._id })
      .select('name slug');
    
    res.status(200).json({
      status: 'success',
      category: {
        id: category._id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        color: category.color,
        icon: category.icon,
        parent: category.parent,
        order: category.order,
        news_count: newsCount,
        child_categories: childCategories,
        created_at: category.createdAt,
        updated_at: category.updatedAt
      }
    });
  } catch (error) {
    console.error('カテゴリー取得エラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'カテゴリーの取得中にエラーが発生しました。'
    });
  }
};

/**
 * 新しいカテゴリーを作成
 * @route POST /api/categories
 * @access Private/Admin
 */
exports.createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // スラッグが存在するか確認
    if (req.body.slug) {
      const existingCategory = await Category.findOne({ slug: req.body.slug });
      if (existingCategory) {
        return res.status(400).json({
          status: 'error',
          message: 'このスラッグは既に使用されています。'
        });
      }
    }
    
    // カテゴリーを作成
    const newCategory = await Category.create(req.body);
    
    res.status(201).json({
      status: 'success',
      category: {
        id: newCategory._id,
        name: newCategory.name,
        slug: newCategory.slug,
        description: newCategory.description,
        color: newCategory.color,
        icon: newCategory.icon,
        parent: newCategory.parent,
        order: newCategory.order,
        created_at: newCategory.createdAt,
        updated_at: newCategory.updatedAt
      }
    });
  } catch (error) {
    console.error('カテゴリー作成エラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'カテゴリーの作成中にエラーが発生しました。'
    });
  }
};

/**
 * カテゴリーを更新
 * @route PATCH /api/categories/:id
 * @access Private/Admin
 */
exports.updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { id } = req.params;
    
    // カテゴリーの存在確認
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'カテゴリーが見つかりません。'
      });
    }
    
    // スラッグの更新時、重複チェック
    if (req.body.slug && req.body.slug !== category.slug) {
      const existingCategory = await Category.findOne({ 
        slug: req.body.slug,
        _id: { $ne: id }
      });
      
      if (existingCategory) {
        return res.status(400).json({
          status: 'error',
          message: 'このスラッグは既に使用されています。'
        });
      }
    }
    
    // カテゴリーを更新
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      category: {
        id: updatedCategory._id,
        name: updatedCategory.name,
        slug: updatedCategory.slug,
        description: updatedCategory.description,
        color: updatedCategory.color,
        icon: updatedCategory.icon,
        parent: updatedCategory.parent,
        order: updatedCategory.order,
        created_at: updatedCategory.createdAt,
        updated_at: updatedCategory.updatedAt
      }
    });
  } catch (error) {
    console.error('カテゴリー更新エラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'カテゴリーの更新中にエラーが発生しました。'
    });
  }
};

/**
 * カテゴリーを削除
 * @route DELETE /api/categories/:id
 * @access Private/Admin
 */
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // カテゴリーの存在確認
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'カテゴリーが見つかりません。'
      });
    }
    
    // このカテゴリーに関連付けられたニュース記事があるか確認
    const relatedNews = await News.countDocuments({ category: id });
    if (relatedNews > 0) {
      return res.status(400).json({
        status: 'error',
        message: `このカテゴリーには${relatedNews}件のニュース記事が関連付けられています。削除する前に記事のカテゴリーを変更してください。`
      });
    }
    
    // 子カテゴリーがあるか確認
    const childCategories = await Category.countDocuments({ parent: id });
    if (childCategories > 0) {
      return res.status(400).json({
        status: 'error',
        message: `このカテゴリーには${childCategories}件の子カテゴリーがあります。削除する前に子カテゴリーを削除または移動してください。`
      });
    }
    
    // カテゴリーを削除
    await Category.findByIdAndDelete(id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('カテゴリー削除エラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'カテゴリーの削除中にエラーが発生しました。'
    });
  }
}; 