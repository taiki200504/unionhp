const { validationResult } = require('express-validator');
const News = require('../models/News');
const fs = require('fs').promises;
const path = require('path');

// 全てのニュース記事を取得
exports.getAllNews = async (req, res) => {
  try {
    const { year, category, search, tag, page = 1, limit = 9, featured } = req.query;
    
    // クエリの構築
    const query = { status: 'published' };
    
    // 年フィルター
    if (year) {
      query.year = parseInt(year);
    }
    
    // カテゴリーフィルター
    if (category) {
      query.category = category;
    }
    
    // 検索クエリ
    if (search) {
      query.$text = { $search: search };
    }
    
    // タグフィルター
    if (tag) {
      query.tags = tag;
    }
    
    // 注目記事フィルター
    if (featured === 'true') {
      query.isFeatured = true;
    }
    
    // ページネーション
    const skip = (page - 1) * limit;
    
    // ニュース記事の取得
    const news = await News.find(query)
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name organizationName')
      .populate('category', 'name slug');
    
    // 合計件数の取得
    const total = await News.countDocuments(query);
    
    // 結果を返す
    res.status(200).json({
      status: 'success',
      results: news.length,
      total,
      current_page: parseInt(page),
      total_pages: Math.ceil(total / limit),
      news: news.map(item => ({
        id: item._id,
        title: item.title,
        content: item.content,
        category: {
          id: item.category._id,
          name: item.category.name,
          slug: item.category.slug
        },
        author_name: item.authorName,
        featured_image: item.featuredImage,
        is_featured: item.isFeatured,
        tags: item.tags,
        year: item.year,
        published_at: item.publishedAt,
        view_count: item.viewCount,
        created_at: item.createdAt,
        updated_at: item.updatedAt,
        attachments: item.attachments || [],
        images: item.images || []
      }))
    });
  } catch (error) {
    console.error('ニュース記事取得エラー:', error);
    res.status(500).json({
      message: 'ニュース記事の取得中にエラーが発生しました。',
      error
    });
  }
};

// 特定のニュース記事を取得
exports.getNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('author', 'name organizationName')
      .populate('category', 'name slug');
    
    if (!news) {
      return res.status(404).json({
        message: 'ニュース記事が見つかりません。',
        error: null
      });
    }
    
    // 閲覧数を増加
    news.viewCount += 1;
    await news.save();
    
    res.status(200).json({
      status: 'success',
      news: {
        id: news._id,
        title: news.title,
        content: news.content,
        category: {
          id: news.category._id,
          name: news.category.name,
          slug: news.category.slug
        },
        author_name: news.authorName,
        author: {
          id: news.author._id,
          name: news.author.name,
          organizationName: news.author.organizationName
        },
        featured_image: news.featuredImage,
        is_featured: news.isFeatured,
        tags: news.tags,
        year: news.year,
        published_at: news.publishedAt,
        view_count: news.viewCount,
        created_at: news.createdAt,
        updated_at: news.updatedAt,
        attachments: news.attachments || [],
        images: news.images || []
      }
    });
  } catch (error) {
    console.error('ニュース記事取得エラー:', error);
    res.status(500).json({
      message: 'ニュース記事の取得中にエラーが発生しました。',
      error
    });
  }
};

// 新しいニュース記事を作成
exports.createNews = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'バリデーションエラー', error: errors.array() });
    }
    
    // 年の設定（指定がない場合は現在の年）
    if (!req.body.year) {
      req.body.year = new Date().getFullYear();
    }
    
    // ファイルがアップロードされている場合
    const newsData = {
      ...req.body,
      author: req.user._id,
      authorName: req.user.name
    };
    
    // アイキャッチ画像の処理
    if (req.file) {
      const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}`;
      newsData.featuredImage = fileUrl;
    }
    
    // 添付ファイルがある場合は追加
    if (req.body.attachments) {
      try {
        newsData.attachments = JSON.parse(req.body.attachments);
      } catch (e) {
        console.error('添付ファイルJSONパースエラー:', e);
      }
    }
    
    // 記事内画像がある場合は追加
    if (req.body.images) {
      try {
        newsData.images = JSON.parse(req.body.images);
      } catch (e) {
        console.error('画像JSONパースエラー:', e);
      }
    }
    
    const newNews = await News.create(newsData);
    
    res.status(201).json({
      status: 'success',
      news: {
        id: newNews._id,
        title: newNews.title,
        status: newNews.status,
        featured_image: newNews.featuredImage,
        attachments: newNews.attachments || [],
        images: newNews.images || []
      }
    });
  } catch (error) {
    console.error('ニュース記事作成エラー:', error);
    res.status(500).json({
      message: 'ニュース記事の作成中にエラーが発生しました。',
      error
    });
  }
};

// ニュース記事を更新
exports.updateNews = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'バリデーションエラー', error: errors.array() });
    }
    
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        message: 'ニュース記事が見つかりません。',
        error: null
      });
    }
    
    // 作成者または管理者/編集者のみ更新可能
    if (news.author.toString() !== req.user._id.toString() && 
        !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'このニュース記事を更新する権限がありません。'
      });
    }
    
    const updateData = { ...req.body };
    
    // アイキャッチ画像の処理
    if (req.file) {
      const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path.replace(/\\/g, '/')}`;
      updateData.featuredImage = fileUrl;
      
      // 古い画像が存在する場合は削除
      if (news.featuredImage) {
        try {
          const oldImagePath = news.featuredImage.split('/').slice(-2).join('/');
          if (fs.existsSync(oldImagePath)) {
            await fs.unlink(oldImagePath);
          }
        } catch (err) {
          console.error('古い画像の削除に失敗:', err);
        }
      }
    }
    
    // 添付ファイルがある場合は更新
    if (req.body.attachments) {
      try {
        updateData.attachments = JSON.parse(req.body.attachments);
      } catch (e) {
        console.error('添付ファイルJSONパースエラー:', e);
      }
    }
    
    // 記事内画像がある場合は更新
    if (req.body.images) {
      try {
        updateData.images = JSON.parse(req.body.images);
      } catch (e) {
        console.error('画像JSONパースエラー:', e);
      }
    }
    
    // 更新する
    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      status: 'success',
      news: {
        id: updatedNews._id,
        title: updatedNews.title,
        status: updatedNews.status,
        featured_image: updatedNews.featuredImage,
        attachments: updatedNews.attachments || [],
        images: updatedNews.images || []
      }
    });
  } catch (error) {
    console.error('ニュース記事更新エラー:', error);
    res.status(500).json({
      message: 'ニュース記事の更新中にエラーが発生しました。',
      error
    });
  }
};

// ニュース記事を削除
exports.deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    
    if (!news) {
      return res.status(404).json({
        message: 'ニュース記事が見つかりません。',
        error: null
      });
    }
    
    // 作成者または管理者のみ削除可能
    if (news.author.toString() !== req.user._id.toString() && 
        req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'このニュース記事を削除する権限がありません。'
      });
    }
    
    // 関連ファイルの削除処理
    try {
      // アイキャッチ画像の削除
      if (news.featuredImage) {
        const imagePath = news.featuredImage.split('/').slice(-2).join('/');
        const fullPath = path.join(process.cwd(), imagePath);
        if (fs.existsSync(fullPath)) {
          await fs.unlink(fullPath);
        }
      }
      
      // 添付ファイルの削除
      if (news.attachments && news.attachments.length > 0) {
        for (const attachment of news.attachments) {
          if (attachment.path) {
            const filePath = path.join(process.cwd(), attachment.path);
            if (fs.existsSync(filePath)) {
              await fs.unlink(filePath);
            }
          }
        }
      }
      
      // 記事内画像の削除
      if (news.images && news.images.length > 0) {
        for (const image of news.images) {
          if (image.path) {
            const imagePath = path.join(process.cwd(), image.path);
            if (fs.existsSync(imagePath)) {
              await fs.unlink(imagePath);
            }
          }
        }
      }
    } catch (err) {
      console.error('ファイル削除エラー:', err);
      // ファイル削除に失敗しても、記事自体の削除は続行
    }
    
    // 記事を削除
    await News.findByIdAndDelete(req.params.id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('ニュース記事削除エラー:', error);
    res.status(500).json({
      message: 'ニュース記事の削除中にエラーが発生しました。',
      error
    });
  }
};

// 年別のニュース記事を取得
exports.getYears = async (req, res) => {
  try {
    const years = await News.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$year' } },
      { $sort: { _id: -1 } }
    ]);
    
    res.status(200).json({
      status: 'success',
      years: years.map(y => y._id)
    });
  } catch (error) {
    console.error('年度取得エラー:', error);
    res.status(500).json({
      message: '年度情報の取得中にエラーが発生しました。',
      error
    });
  }
};

// タグ一覧を取得
exports.getTags = async (req, res) => {
  try {
    const tags = await News.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } }
    ]);
    
    res.status(200).json({
      status: 'success',
      tags: tags.map(tag => ({
        name: tag._id,
        count: tag.count
      }))
    });
  } catch (error) {
    console.error('タグ取得エラー:', error);
    res.status(500).json({
      message: 'タグ情報の取得中にエラーが発生しました。',
      error
    });
  }
};

// 添付ファイルを追加
exports.addAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({
        message: 'ファイルがアップロードされていません',
        error: null
      });
    }
    
    const news = await News.findById(id);
    
    if (!news) {
      return res.status(404).json({
        message: 'ニュース記事が見つかりません',
        error: null
      });
    }
    
    // 権限チェック
    if (news.author.toString() !== req.user._id.toString() && 
        !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'このニュース記事に添付ファイルを追加する権限がありません'
      });
    }
    
    // ファイル情報を作成
    const relativePath = req.file.path.replace(/\\/g, '/');
    const fileUrl = `${req.protocol}://${req.get('host')}/${relativePath}`;
    
    const attachment = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      path: relativePath,
      url: fileUrl,
      mimetype: req.file.mimetype,
      size: req.file.size
    };
    
    // 添付ファイル配列がない場合は初期化
    if (!news.attachments) {
      news.attachments = [];
    }
    
    // 添付ファイルを追加して保存
    news.attachments.push(attachment);
    await news.save();
    
    res.status(200).json({
      status: 'success',
      attachment
    });
  } catch (error) {
    console.error('添付ファイル追加エラー:', error);
    res.status(500).json({
      message: '添付ファイルの追加中にエラーが発生しました',
      error
    });
  }
};

// 添付ファイルを削除
exports.removeAttachment = async (req, res) => {
  try {
    const { id, filename } = req.params;
    
    const news = await News.findById(id);
    
    if (!news) {
      return res.status(404).json({
        message: 'ニュース記事が見つかりません',
        error: null
      });
    }
    
    // 権限チェック
    if (news.author.toString() !== req.user._id.toString() && 
        !['admin', 'editor'].includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'このニュース記事から添付ファイルを削除する権限がありません'
      });
    }
    
    // 添付ファイルの検索
    const attachmentIndex = news.attachments.findIndex(a => a.filename === filename);
    
    if (attachmentIndex === -1) {
      return res.status(404).json({
        message: '指定された添付ファイルが見つかりません',
        error: null
      });
    }
    
    // ファイルパスを取得
    const filePath = news.attachments[attachmentIndex].path;
    
    // ファイルをディスクから削除
    try {
      await fs.unlink(path.join(process.cwd(), filePath));
    } catch (err) {
      console.error('ファイル削除エラー:', err);
      // ファイル削除に失敗しても、データベースからの削除は続行
    }
    
    // 添付ファイルをデータベースから削除
    news.attachments.splice(attachmentIndex, 1);
    await news.save();
    
    res.status(200).json({
      status: 'success',
      message: '添付ファイルを削除しました'
    });
  } catch (error) {
    console.error('添付ファイル削除エラー:', error);
    res.status(500).json({
      message: '添付ファイルの削除中にエラーが発生しました',
      error
    });
  }
}; 