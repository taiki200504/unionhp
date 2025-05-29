const News = require('../models/News');
const Category = require('../models/Category');
const User = require('../models/User');
const Subscriber = require('../models/Subscriber');
const ActivityLog = require('../models/ActivityLog');
const Setting = require('../models/Setting');
const fs = require('fs').promises;
const path = require('path');
const { validationResult } = require('express-validator');

/**
 * ダッシュボード統計情報を取得
 * @route GET /api/cms/dashboard
 * @access Private (Admin/Editor)
 */
exports.getDashboardStats = async (req, res) => {
  try {
    // 基本的なコンテンツ数の統計
    const stats = {
      news: {
        total: await News.countDocuments(),
        published: await News.countDocuments({ status: 'published' }),
        draft: await News.countDocuments({ status: 'draft' }),
        archived: await News.countDocuments({ status: 'archived' }),
        featured: await News.countDocuments({ isFeatured: true })
      },
      categories: {
        total: await Category.countDocuments(),
        parentCategories: await Category.countDocuments({ parent: null }),
        childCategories: await Category.countDocuments({ parent: { $ne: null } })
      },
      users: {
        total: await User.countDocuments(),
        admin: await User.countDocuments({ role: 'admin' }),
        editor: await User.countDocuments({ role: 'editor' }),
        user: await User.countDocuments({ role: 'user' })
      },
      subscribers: {
        total: await Subscriber.countDocuments(),
        active: await Subscriber.countDocuments({ status: 'active' }),
        pending: await Subscriber.countDocuments({ status: 'pending' }),
        unsubscribed: await Subscriber.countDocuments({ status: 'unsubscribed' })
      }
    };
    
    // 最近の記事（上位5件）
    const recentNews = await News.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt viewCount')
      .populate('author', 'name')
      .populate('category', 'name');
    
    // 人気記事（閲覧数上位5件）
    const popularNews = await News.find({ status: 'published' })
      .sort({ viewCount: -1 })
      .limit(5)
      .select('title viewCount publishedAt')
      .populate('category', 'name');
    
    // 最近の活動ログ
    const recentActivity = await ActivityLog.find()
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('user', 'name role');
    
    res.status(200).json({
      status: 'success',
      stats,
      recentNews: recentNews.map(item => ({
        id: item._id,
        title: item.title,
        status: item.status,
        created_at: item.createdAt,
        views: item.viewCount,
        author: item.author ? item.author.name : 'Unknown',
        category: item.category ? item.category.name : 'Uncategorized'
      })),
      popularNews: popularNews.map(item => ({
        id: item._id,
        title: item.title,
        views: item.viewCount,
        published_at: item.publishedAt,
        category: item.category ? item.category.name : 'Uncategorized'
      })),
      recentActivity: recentActivity.map(log => ({
        id: log._id,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        user: log.user ? {
          id: log.user._id,
          name: log.user.name,
          role: log.user.role
        } : null,
        timestamp: log.timestamp,
        details: log.details
      }))
    });
  } catch (error) {
    console.error('ダッシュボード統計取得エラー:', error);
    res.status(500).json({
      message: '統計情報の取得中にエラーが発生しました。',
      error
    });
  }
};

/**
 * すべてのコンテンツタイプの一覧を取得
 * @route GET /api/cms/content
 * @access Private (Admin/Editor)
 */
exports.getAllContent = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    // 検索クエリの構築
    const newsQuery = {};
    
    if (search) {
      newsQuery.$text = { $search: search };
    }
    
    // ページネーション
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // ニュース記事を取得
    const news = await News.find(newsQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('title status category createdAt updatedAt author viewCount')
      .populate('category', 'name')
      .populate('author', 'name');
    
    // 合計件数
    const total = await News.countDocuments(newsQuery);
    
    res.status(200).json({
      status: 'success',
      results: news.length,
      total,
      current_page: parseInt(page),
      total_pages: Math.ceil(total / parseInt(limit)),
      content: news.map(item => ({
        id: item._id,
        type: 'news',
        title: item.title,
        status: item.status,
        category: item.category ? item.category.name : 'Uncategorized',
        author: item.author ? item.author.name : 'Unknown',
        created_at: item.createdAt,
        updated_at: item.updatedAt,
        views: item.viewCount
      }))
    });
  } catch (error) {
    console.error('コンテンツ一覧取得エラー:', error);
    res.status(500).json({
      message: 'コンテンツ一覧の取得中にエラーが発生しました。',
      error
    });
  }
};

/**
 * 特定のコンテンツタイプの一覧を取得
 * @route GET /api/cms/content/:type
 * @access Private (Admin/Editor)
 */
exports.getContentByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 10, search, sort = 'newest', status } = req.query;
    
    if (type !== 'news' && type !== 'categories') {
      return res.status(400).json({
        message: '無効なコンテンツタイプです'
      });
    }
    
    // ページネーション
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // ソートオプションの設定
    let sortOption = {};
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'title') {
      sortOption = { title: 1 };
    } else if (sort === 'views') {
      sortOption = { viewCount: -1 };
    } else {
      // デフォルトは最新順
      sortOption = { createdAt: -1 };
    }
    
    let result;
    
    if (type === 'news') {
      // ニュース記事の検索条件を構築
      const newsQuery = {};
      
      if (search) {
        newsQuery.$text = { $search: search };
      }
      
      if (status && ['draft', 'published', 'archived'].includes(status)) {
        newsQuery.status = status;
      }
      
      // ニュース記事を取得
      const news = await News.find(newsQuery)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('category', 'name')
        .populate('author', 'name');
      
      // 合計件数
      const total = await News.countDocuments(newsQuery);
      
      result = {
        results: news.length,
        total,
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        content: news.map(item => ({
          id: item._id,
          title: item.title,
          content: item.content.substring(0, 100) + (item.content.length > 100 ? '...' : ''),
          status: item.status,
          category: item.category ? {
            id: item.category._id,
            name: item.category.name
          } : null,
          author: item.author ? {
            id: item.author._id,
            name: item.author.name
          } : null,
          featured_image: item.featuredImage,
          is_featured: item.isFeatured,
          created_at: item.createdAt,
          updated_at: item.updatedAt,
          published_at: item.publishedAt,
          views: item.viewCount
        }))
      };
    } else if (type === 'categories') {
      // カテゴリーの検索条件を構築
      const categoryQuery = {};
      
      if (search) {
        categoryQuery.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      
      // カテゴリーを取得
      const categories = await Category.find(categoryQuery)
        .sort(sortOption)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('parent', 'name');
      
      // 合計件数
      const total = await Category.countDocuments(categoryQuery);
      
      // 各カテゴリーに関連するニュース数を取得
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const newsCount = await News.countDocuments({
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
            parent: category.parent ? {
              id: category.parent._id,
              name: category.parent.name
            } : null,
            order: category.order,
            news_count: newsCount,
            created_at: category.createdAt,
            updated_at: category.updatedAt
          };
        })
      );
      
      result = {
        results: categories.length,
        total,
        current_page: parseInt(page),
        total_pages: Math.ceil(total / parseInt(limit)),
        content: categoriesWithCounts
      };
    }
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  } catch (error) {
    console.error(`${req.params.type}一覧取得エラー:`, error);
    res.status(500).json({
      message: 'コンテンツ一覧の取得中にエラーが発生しました。',
      error
    });
  }
};

/**
 * ドラフト記事の取得
 * @route GET /api/cms/drafts
 * @access Private (Admin/Editor)
 */
exports.getDrafts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // ページネーション
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // ドラフト記事を取得
    const drafts = await News.find({ status: 'draft' })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('category', 'name')
      .populate('author', 'name');
    
    // 合計件数
    const total = await News.countDocuments({ status: 'draft' });
    
    res.status(200).json({
      status: 'success',
      results: drafts.length,
      total,
      current_page: parseInt(page),
      total_pages: Math.ceil(total / parseInt(limit)),
      drafts: drafts.map(item => ({
        id: item._id,
        title: item.title,
        content: item.content.substring(0, 100) + (item.content.length > 100 ? '...' : ''),
        category: item.category ? {
          id: item.category._id,
          name: item.category.name
        } : null,
        author: item.author ? {
          id: item.author._id,
          name: item.author.name
        } : null,
        featured_image: item.featuredImage,
        created_at: item.createdAt,
        updated_at: item.updatedAt
      }))
    });
  } catch (error) {
    console.error('ドラフト記事取得エラー:', error);
    res.status(500).json({
      message: 'ドラフト記事の取得中にエラーが発生しました。',
      error
    });
  }
};

/**
 * 公開済み記事の取得
 * @route GET /api/cms/published
 * @access Private (Admin/Editor)
 */
exports.getPublished = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // ページネーション
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 公開済み記事を取得
    const published = await News.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('category', 'name')
      .populate('author', 'name');
    
    // 合計件数
    const total = await News.countDocuments({ status: 'published' });
    
    res.status(200).json({
      status: 'success',
      results: published.length,
      total,
      current_page: parseInt(page),
      total_pages: Math.ceil(total / parseInt(limit)),
      published: published.map(item => ({
        id: item._id,
        title: item.title,
        category: item.category ? {
          id: item.category._id,
          name: item.category.name
        } : null,
        author: item.author ? {
          id: item.author._id,
          name: item.author.name
        } : null,
        featured_image: item.featuredImage,
        is_featured: item.isFeatured,
        published_at: item.publishedAt,
        views: item.viewCount
      }))
    });
  } catch (error) {
    console.error('公開済み記事取得エラー:', error);
    res.status(500).json({
      message: '公開済み記事の取得中にエラーが発生しました。',
      error
    });
  }
};

/**
 * アーカイブ済み記事の取得
 * @route GET /api/cms/archived
 * @access Private (Admin/Editor)
 */
exports.getArchived = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // ページネーション
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // アーカイブ済み記事を取得
    const archived = await News.find({ status: 'archived' })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('category', 'name')
      .populate('author', 'name');
    
    // 合計件数
    const total = await News.countDocuments({ status: 'archived' });
    
    res.status(200).json({
      status: 'success',
      results: archived.length,
      total,
      current_page: parseInt(page),
      total_pages: Math.ceil(total / parseInt(limit)),
      archived: archived.map(item => ({
        id: item._id,
        title: item.title,
        category: item.category ? {
          id: item.category._id,
          name: item.category.name
        } : null,
        author: item.author ? {
          id: item.author._id,
          name: item.author.name
        } : null,
        featured_image: item.featuredImage,
        created_at: item.createdAt,
        updated_at: item.updatedAt
      }))
    });
  } catch (error) {
    console.error('アーカイブ済み記事取得エラー:', error);
    res.status(500).json({
      message: 'アーカイブ済み記事の取得中にエラーが発生しました。',
      error
    });
  }
};

/**
 * 特集記事の取得
 * @route GET /api/cms/featured
 * @access Private (Admin/Editor)
 */
exports.getFeatured = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // ページネーション
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // 特集記事を取得
    const featured = await News.find({ 
      isFeatured: true,
      status: 'published' 
    })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('category', 'name')
      .populate('author', 'name');
    
    // 合計件数
    const total = await News.countDocuments({ 
      isFeatured: true,
      status: 'published'
    });
    
    res.status(200).json({
      status: 'success',
      results: featured.length,
      total,
      current_page: parseInt(page),
      total_pages: Math.ceil(total / parseInt(limit)),
      featured: featured.map(item => ({
        id: item._id,
        title: item.title,
        category: item.category ? {
          id: item.category._id,
          name: item.category.name
        } : null,
        author: item.author ? {
          id: item.author._id,
          name: item.author.name
        } : null,
        featured_image: item.featuredImage,
        published_at: item.publishedAt,
        views: item.viewCount
      }))
    });
  } catch (error) {
    console.error('特集記事取得エラー:', error);
    res.status(500).json({
      message: '特集記事の取得中にエラーが発生しました。',
      error
    });
  }
};

/**
 * 記事の特集ステータスを切り替え
 * @route POST /api/cms/featured/:id
 * @access Private (Admin/Editor)
 */
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 記事の存在確認
    const news = await News.findById(id);
    
    if (!news) {
      return res.status(404).json({
        message: '記事が見つかりません。',
        error: null
      });
    }
    
    // 特集ステータスを反転
    news.isFeatured = !news.isFeatured;
    await news.save();
    
    // アクティビティログの記録
    if (req.user) {
      await ActivityLog.create({
        user: req.user._id,
        action: news.isFeatured ? 'featured' : 'unfeatured',
        resource: 'news',
        resourceId: news._id,
        details: `記事「${news.title}」を${news.isFeatured ? '特集に追加' : '特集から削除'}しました`
      });
    }
    
    res.status(200).json({
      status: 'success',
      isFeatured: news.isFeatured,
      message: news.isFeatured ? '記事を特集に追加しました' : '記事を特集から削除しました'
    });
  } catch (error) {
    console.error('特集ステータス切替エラー:', error);
    res.status(500).json({
      message: '特集ステータスの変更中にエラーが発生しました。',
      error
    });
  }
};

/**
 * メディア一覧の取得
 * @route GET /api/cms/media
 * @access Private (Admin/Editor)
 */
exports.getMedia = async (req, res) => {
  try {
    const { directory = 'all', page = 1, limit = 20, type } = req.query;
    
    // 検索対象のディレクトリを設定
    let searchDirs = ['uploads/news', 'uploads/posts', 'uploads/profiles'];
    
    if (directory !== 'all') {
      if (['news', 'posts', 'profiles'].includes(directory)) {
        searchDirs = [`uploads/${directory}`];
      } else {
        return res.status(400).json({
          message: '無効なディレクトリです'
        });
      }
    }
    
    // すべてのファイルの情報を取得
    let allFiles = [];
    
    for (const dir of searchDirs) {
      try {
        const files = await fs.readdir(dir);
        
        for (const filename of files) {
          const filePath = path.join(dir, filename);
          const stats = await fs.stat(filePath);
          
          if (stats.isFile()) {
            const fileExt = path.extname(filename).toLowerCase();
            let fileType = 'other';
            
            // ファイルタイプの判定
            if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(fileExt)) {
              fileType = 'image';
            } else if (['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'].includes(fileExt)) {
              fileType = 'document';
            } else if (['.mp4', '.webm', '.mov', '.avi'].includes(fileExt)) {
              fileType = 'video';
            }
            
            // タイプフィルターがある場合は絞り込み
            if (!type || type === fileType) {
              const relativePath = filePath.replace(/\\/g, '/');
              
              allFiles.push({
                filename,
                path: relativePath,
                url: `${req.protocol}://${req.get('host')}/${relativePath}`,
                type: fileType,
                size: stats.size,
                created: stats.birthtimeMs,
                modified: stats.mtimeMs
              });
            }
          }
        }
      } catch (error) {
        console.error(`ディレクトリ ${dir} の読み取りエラー:`, error);
        // エラーが発生しても処理を続行
      }
    }
    
    // 更新日時の降順でソート
    allFiles.sort((a, b) => b.modified - a.modified);
    
    // ページネーション
    const total = allFiles.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedFiles = allFiles.slice(startIndex, endIndex);
    
    res.status(200).json({
      status: 'success',
      results: paginatedFiles.length,
      total,
      current_page: parseInt(page),
      total_pages: Math.ceil(total / parseInt(limit)),
      files: paginatedFiles
    });
  } catch (error) {
    console.error('メディア一覧取得エラー:', error);
    res.status(500).json({
      message: 'メディア一覧の取得中にエラーが発生しました。',
      error
    });
  }
};

/**
 * メディアファイルの削除
 * @route DELETE /api/cms/media/:filename
 * @access Private (Admin/Editor)
 */
exports.deleteMedia = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({
        message: 'ファイル名が指定されていません'
      });
    }
    
    // ファイル名に不正なパスが含まれていないか確認（セキュリティ対策）
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        message: '不正なファイル名です'
      });
    }
    
    // ファイルを探す
    const directories = ['uploads/news', 'uploads/posts', 'uploads/profiles'];
    let filePath = null;
    
    for (const dir of directories) {
      const testPath = path.join(dir, filename);
      try {
        await fs.access(testPath);
        filePath = testPath;
        break;
      } catch (error) {
        // ファイルが見つからない場合は次のディレクトリを確認
      }
    }
    
    if (!filePath) {
      return res.status(404).json({
        message: 'ファイルが見つかりません。',
        error: null
      });
    }
    
    // 記事に使用されていないか確認
    const usedInNews = await News.findOne({
      $or: [
        { featuredImage: { $regex: filename } },
        { 'attachments.filename': filename },
        { 'images.filename': filename }
      ]
    });
    
    if (usedInNews) {
      return res.status(400).json({
        message: 'このファイルは記事で使用されているため削除できません'
      });
    }
    
    // ファイル削除
    await fs.unlink(filePath);
    
    // アクティビティログの記録
    if (req.user) {
      await ActivityLog.create({
        user: req.user._id,
        action: 'delete',
        resource: 'media',
        resourceId: filename,
        details: `メディアファイル「${filename}」を削除しました`
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'ファイルを削除しました'
    });
  } catch (error) {
    console.error('メディア削除エラー:', error);
    res.status(500).json({
      message: 'ファイルの削除中にエラーが発生しました。',
      error
    });
  }
};

/**
 * メディアファイルの整理（名前変更・移動など）
 * @route POST /api/cms/media/organize
 * @access Private (Admin/Editor)
 */
exports.organizeMedia = async (req, res) => {
  try {
    const { filename, newDirectory } = req.body;
    
    if (!filename || !newDirectory) {
      return res.status(400).json({
        message: 'ファイル名と移動先ディレクトリが必要です'
      });
    }
    
    // 移動先ディレクトリの検証
    if (!['news', 'posts', 'profiles'].includes(newDirectory)) {
      return res.status(400).json({
        message: '無効な移動先ディレクトリです'
      });
    }
    
    // ファイル名に不正なパスが含まれていないか確認（セキュリティ対策）
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        message: '不正なファイル名です'
      });
    }
    
    // ファイルを探す
    const directories = ['uploads/news', 'uploads/posts', 'uploads/profiles'];
    let currentPath = null;
    let currentDir = null;
    
    for (const dir of directories) {
      const testPath = path.join(dir, filename);
      try {
        await fs.access(testPath);
        currentPath = testPath;
        currentDir = dir;
        break;
      } catch (error) {
        // ファイルが見つからない場合は次のディレクトリを確認
      }
    }
    
    if (!currentPath) {
      return res.status(404).json({
        message: 'ファイルが見つかりません。',
        error: null
      });
    }
    
    // 移動先のパスを作成
    const targetDir = `uploads/${newDirectory}`;
    const targetPath = path.join(targetDir, filename);
    
    // 既に同じディレクトリの場合
    if (currentDir === targetDir) {
      return res.status(400).json({
        message: '既に指定されたディレクトリに存在します'
      });
    }
    
    // 移動先ディレクトリが存在することを確認
    try {
      await fs.access(targetDir);
    } catch (error) {
      await fs.mkdir(targetDir, { recursive: true });
    }
    
    // ファイルを移動
    await fs.rename(currentPath, targetPath);
    
    // 関連するニュース記事のパスを更新
    const oldPathPattern = `${currentDir}/${filename}`;
    const newPathPattern = `${targetDir}/${filename}`;
    
    await News.updateMany(
      { featuredImage: { $regex: oldPathPattern } },
      { $set: { featuredImage: newPathPattern } }
    );
    
    // アクティビティログの記録
    if (req.user) {
      await ActivityLog.create({
        user: req.user._id,
        action: 'move',
        resource: 'media',
        resourceId: filename,
        details: `メディアファイル「${filename}」を ${currentDir} から ${targetDir} に移動しました`
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: 'ファイルを移動しました',
      file: {
        filename,
        path: targetPath.replace(/\\/g, '/'),
        url: `${req.protocol}://${req.get('host')}/${targetPath.replace(/\\/g, '/')}`
      }
    });
  } catch (error) {
    console.error('メディア整理エラー:', error);
    res.status(500).json({
      message: 'ファイルの整理中にエラーが発生しました。',
      error
    });
  }
};

/**
 * 活動ログを取得
 * @route GET /api/cms/activity-log
 * @access Private (Admin/Editor)
 */
exports.getActivityLog = async (req, res) => {
  try {
    const { page = 1, limit = 20, user, action, resource } = req.query;
    
    // クエリの構築
    const query = {};
    
    if (user) {
      query.user = user;
    }
    
    if (action) {
      query.action = action;
    }
    
    if (resource) {
      query.resource = resource;
    }
    
    // ページネーション
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // アクティビティログを取得
    const logs = await ActivityLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('user', 'name role');
    
    // 合計件数
    const total = await ActivityLog.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      results: logs.length,
      total,
      current_page: parseInt(page),
      total_pages: Math.ceil(total / parseInt(limit)),
      logs: logs.map(log => ({
        id: log._id,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        user: log.user ? {
          id: log.user._id,
          name: log.user.name,
          role: log.user.role
        } : null,
        timestamp: log.timestamp,
        details: log.details
      }))
    });
  } catch (error) {
    console.error('活動ログ取得エラー:', error);
    res.status(500).json({
      message: '活動ログの取得中にエラーが発生しました。',
      error
    });
  }
};

/**
 * サイト設定を取得
 * @route GET /api/cms/settings
 * @access Private (Admin/Editor)
 */
exports.getSettings = async (req, res) => {
  try {
    // すべての設定を取得
    const settings = await Setting.find();
    
    // 設定をキーと値のオブジェクトに変換
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.key] = setting.value;
    });
    
    res.status(200).json({
      status: 'success',
      settings: settingsObj
    });
  } catch (error) {
    console.error('設定取得エラー:', error);
    res.status(500).json({
      message: '設定の取得中にエラーが発生しました。',
      error
    });
  }
};

/**
 * サイト設定を更新
 * @route PATCH /api/cms/settings
 * @access Private (Admin only)
 */
exports.updateSettings = async (req, res) => {
  try {
    const updates = req.body;
    
    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: '更新する設定が指定されていません'
      });
    }
    
    // 各設定を更新または作成
    const updatePromises = Object.entries(updates).map(async ([key, value]) => {
      // 既存の設定を探す
      let setting = await Setting.findOne({ key });
      
      if (setting) {
        // 既存の設定を更新
        setting.value = value;
        return setting.save();
      } else {
        // 新しい設定を作成
        return Setting.create({ key, value });
      }
    });
    
    await Promise.all(updatePromises);
    
    // アクティビティログの記録
    if (req.user) {
      await ActivityLog.create({
        user: req.user._id,
        action: 'update',
        resource: 'settings',
        details: `サイト設定を更新しました: ${Object.keys(updates).join(', ')}`
      });
    }
    
    res.status(200).json({
      status: 'success',
      message: '設定を更新しました'
    });
  } catch (error) {
    console.error('設定更新エラー:', error);
    res.status(500).json({
      message: '設定の更新中にエラーが発生しました。',
      error
    });
  }
}; 