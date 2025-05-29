const News = require('../models/News');
const Category = require('../models/Category');

/**
 * 高度な検索機能
 * @route GET /api/search
 * @access Public
 */
exports.search = async (req, res) => {
  try {
    const { 
      query, 
      category, 
      tag, 
      year, 
      dateFrom, 
      dateTo, 
      sort = 'newest', 
      page = 1, 
      limit = 10 
    } = req.query;

    // 検索条件の構築
    const searchQuery = { status: 'published' };
    
    // キーワード検索
    if (query) {
      searchQuery.$text = { $search: query };
    }
    
    // カテゴリー検索（IDまたはスラッグ）
    if (category) {
      // カテゴリーがIDかスラッグかを判定
      if (/^[0-9a-fA-F]{24}$/.test(category)) {
        // MongoDB ObjectIdの形式の場合
        searchQuery.category = category;
      } else {
        // スラッグの場合、カテゴリーを検索
        try {
          const foundCategory = await Category.findOne({ slug: category });
          if (foundCategory) {
            searchQuery.category = foundCategory._id;
          }
        } catch (err) {
          console.error('カテゴリー検索エラー:', err);
        }
      }
    }
    
    // タグ検索
    if (tag) {
      searchQuery.tags = tag;
    }
    
    // 年による検索
    if (year) {
      searchQuery.year = parseInt(year);
    }
    
    // 日付範囲による検索
    if (dateFrom || dateTo) {
      searchQuery.publishedAt = {};
      
      if (dateFrom) {
        searchQuery.publishedAt.$gte = new Date(dateFrom);
      }
      
      if (dateTo) {
        // 日付の終わりまでを含める
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        searchQuery.publishedAt.$lte = endDate;
      }
    }
    
    // ソートオプションの設定
    let sortOption = {};
    switch (sort) {
      case 'oldest':
        sortOption = { publishedAt: 1 };
        break;
      case 'title':
        sortOption = { title: 1 };
        break;
      case 'views':
        sortOption = { viewCount: -1 };
        break;
      case 'newest':
      default:
        sortOption = { publishedAt: -1 };
        break;
    }
    
    // スコアが関連するクエリの場合、スコアによるソートを優先
    if (query && sort === 'relevance') {
      sortOption = { score: { $meta: 'textScore' } };
    }
    
    // ページネーション
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // クエリの実行
    let newsQuery = News.find(searchQuery);
    
    // テキスト検索スコアを追加（クエリがある場合）
    if (query) {
      newsQuery = newsQuery.select({ score: { $meta: 'textScore' } });
    }
    
    // ソート、ページネーション、関連データ取得を適用
    newsQuery = newsQuery
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('category', 'name slug color')
      .populate('author', 'name organizationName');
    
    // 結果を取得
    const results = await newsQuery;
    
    // 合計件数を取得
    const total = await News.countDocuments(searchQuery);
    
    // レスポンスを構築
    res.status(200).json({
      status: 'success',
      results: results.length,
      total,
      current_page: parseInt(page),
      total_pages: Math.ceil(total / limit),
      news: results.map(item => ({
        id: item._id,
        title: item.title,
        content: item.content.substring(0, 200) + (item.content.length > 200 ? '...' : ''),
        category: {
          id: item.category._id,
          name: item.category.name,
          slug: item.category.slug,
          color: item.category.color
        },
        author_name: item.authorName,
        author: item.author ? {
          id: item.author._id,
          name: item.author.name,
          organizationName: item.author.organizationName
        } : null,
        featured_image: item.featuredImage,
        tags: item.tags,
        year: item.year,
        published_at: item.publishedAt,
        view_count: item.viewCount
      }))
    });
  } catch (error) {
    console.error('検索エラー:', error);
    res.status(500).json({
      status: 'error',
      message: '検索処理中にエラーが発生しました。'
    });
  }
};

/**
 * タグクラウドデータを取得
 * @route GET /api/search/tags
 * @access Public
 */
exports.getTagCloud = async (req, res) => {
  try {
    // タグの集計（出現回数でソート）
    const tags = await News.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 }  // 上位50タグまで
    ]);
    
    res.status(200).json({
      status: 'success',
      tags: tags.map(tag => ({
        name: tag._id,
        count: tag.count
      }))
    });
  } catch (error) {
    console.error('タグクラウド取得エラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'タグデータの取得中にエラーが発生しました。'
    });
  }
};

/**
 * アーカイブデータ（年月別の記事数）を取得
 * @route GET /api/search/archives
 * @access Public
 */
exports.getArchives = async (req, res) => {
  try {
    // 年月別の記事数を集計
    const archives = await News.aggregate([
      { $match: { status: 'published', publishedAt: { $exists: true } } },
      {
        $group: {
          _id: {
            year: { $year: '$publishedAt' },
            month: { $month: '$publishedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);
    
    // レスポンスを整形
    res.status(200).json({
      status: 'success',
      archives: archives.map(item => ({
        year: item._id.year,
        month: item._id.month,
        count: item.count
      }))
    });
  } catch (error) {
    console.error('アーカイブ取得エラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'アーカイブデータの取得中にエラーが発生しました。'
    });
  }
}; 