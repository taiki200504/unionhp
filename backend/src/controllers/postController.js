const { validationResult } = require('express-validator');
const Post = require('../models/Post');

// 全ての投稿を取得
exports.getAllPosts = async (req, res) => {
  try {
    const { category, group, search, sort, page = 1, limit = 10 } = req.query;
    
    // クエリの構築
    const query = { status: 'published' };
    
    // カテゴリーフィルター
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // グループフィルター
    if (group) {
      query.group = group;
    }
    
    // 検索クエリ
    if (search) {
      query.$text = { $search: search };
    }
    
    // ページネーション
    const skip = (page - 1) * limit;
    
    // ソートオプション
    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { publishedAt: 1 };
        break;
      case 'popular':
        sortOption = { viewCount: -1, publishedAt: -1 };
        break;
      case 'newest':
      default:
        sortOption = { publishedAt: -1 };
    }
    
    // 投稿の取得
    const posts = await Post.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name organizationName organizationType');
    
    // 合計件数の取得
    const total = await Post.countDocuments(query);
    
    // 結果を返す
    res.status(200).json({
      status: 'success',
      results: posts.length,
      total,
      current_page: parseInt(page),
      total_pages: Math.ceil(total / limit),
      posts: posts.map(post => ({
        id: post._id,
        title: post.title,
        content: post.content,
        category_slug: post.category,
        group_slug: post.group,
        author_name: post.authorName,
        featured_image: post.featuredImage,
        details: post.details || {},
        contact: post.contact || {},
        is_featured: post.isFeatured,
        published_at: post.publishedAt,
        created_at: post.createdAt,
        updated_at: post.updatedAt
      }))
    });
  } catch (error) {
    console.error('投稿取得エラー:', error);
    res.status(500).json({
      status: 'error',
      message: '投稿の取得中にエラーが発生しました。',
      error
    });
  }
};

// 特定の投稿を取得
exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name organizationName organizationType');
    
    if (!post) {
      return res.status(404).json({
        message: '投稿が見つかりません。',
        error: null
      });
    }
    
    // 閲覧数を増加
    post.viewCount += 1;
    await post.save();
    
    res.status(200).json({
      status: 'success',
      post: {
        id: post._id,
        title: post.title,
        content: post.content,
        category_slug: post.category,
        group_slug: post.group,
        author_name: post.authorName,
        author: {
          id: post.author._id,
          name: post.author.name,
          organizationName: post.author.organizationName,
          organizationType: post.author.organizationType
        },
        featured_image: post.featuredImage,
        details: post.details || {},
        contact: post.contact || {},
        is_featured: post.isFeatured,
        published_at: post.publishedAt,
        view_count: post.viewCount,
        created_at: post.createdAt,
        updated_at: post.updatedAt
      }
    });
  } catch (error) {
    console.error('投稿取得エラー:', error);
    res.status(500).json({
      status: 'error',
      message: '投稿の取得中にエラーが発生しました。',
      error
    });
  }
};

// 新しい投稿を作成
exports.createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'バリデーションエラー', error: errors.array() });
    }
    
    const newPost = await Post.create({
      ...req.body,
      author: req.user._id,
      authorName: req.user.organizationName || req.user.name
    });
    
    res.status(201).json({
      status: 'success',
      post: {
        id: newPost._id,
        title: newPost.title,
        status: newPost.status
      }
    });
  } catch (error) {
    console.error('投稿作成エラー:', error);
    res.status(500).json({
      status: 'error',
      message: '投稿の作成中にエラーが発生しました。',
      error
    });
  }
};

// 投稿を更新
exports.updatePost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'バリデーションエラー', error: errors.array() });
    }
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        message: '投稿が見つかりません。',
        error: null
      });
    }
    
    // 作成者または管理者/編集者のみ更新可能
    if (post.author.toString() !== req.user._id.toString() && 
        !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'この投稿を更新する権限がありません。'
      });
    }
    
    // 更新する
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      post: {
        id: updatedPost._id,
        title: updatedPost.title,
        status: updatedPost.status
      }
    });
  } catch (error) {
    console.error('投稿更新エラー:', error);
    res.status(500).json({
      status: 'error',
      message: '投稿の更新中にエラーが発生しました。',
      error
    });
  }
};

// 投稿を削除
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        message: '投稿が見つかりません。',
        error: null
      });
    }
    
    // 作成者または管理者のみ削除可能
    if (post.author.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'この投稿を削除する権限がありません。'
      });
    }
    
    await Post.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('投稿削除エラー:', error);
    res.status(500).json({
      status: 'error',
      message: '投稿の削除中にエラーが発生しました。',
      error
    });
  }
};

// 関連投稿を取得
exports.getRelatedPosts = async (req, res) => {
  try {
    const { category, group, exclude, limit = 3 } = req.query;
    
    if (!category || !group) {
      return res.status(400).json({
        status: 'error',
        message: 'カテゴリーとグループは必須です。'
      });
    }
    
    // クエリの構築
    const query = { 
      status: 'published',
      $or: [
        { category },
        { group }
      ]
    };
    
    // 除外する投稿ID
    if (exclude) {
      query._id = { $ne: exclude };
    }
    
    // 関連投稿の取得
    const posts = await Post.find(query)
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      status: 'success',
      results: posts.length,
      posts: posts.map(post => ({
        id: post._id,
        title: post.title,
        category_slug: post.category,
        group_slug: post.group,
        author_name: post.authorName,
        featured_image: post.featuredImage,
        published_at: post.publishedAt
      }))
    });
  } catch (error) {
    console.error('関連投稿取得エラー:', error);
    res.status(500).json({
      status: 'error',
      message: '関連投稿の取得中にエラーが発生しました。',
      error
    });
  }
}; 