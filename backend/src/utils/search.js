const { AppError } = require('../middleware/errorHandler');

// 検索クエリの構築
const buildSearchQuery = (searchParams, searchFields) => {
  const query = {};

  // テキスト検索
  if (searchParams.q) {
    query.$text = { $search: searchParams.q };
  }

  // フィールド別の検索条件
  searchFields.forEach(field => {
    if (searchParams[field]) {
      query[field] = new RegExp(searchParams[field], 'i');
    }
  });

  // 日付範囲検索
  if (searchParams.startDate || searchParams.endDate) {
    query.createdAt = {};
    if (searchParams.startDate) {
      query.createdAt.$gte = new Date(searchParams.startDate);
    }
    if (searchParams.endDate) {
      query.createdAt.$lte = new Date(searchParams.endDate);
    }
  }

  return query;
};

// ソート条件の構築
const buildSortOptions = (sortParams) => {
  const sortOptions = {};

  if (sortParams.sortBy) {
    const order = sortParams.order === 'desc' ? -1 : 1;
    sortOptions[sortParams.sortBy] = order;
  } else {
    // デフォルトのソート
    sortOptions.createdAt = -1;
  }

  return sortOptions;
};

// ページネーション情報の構築
const buildPagination = (page, limit) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};

// 検索結果の整形
const formatSearchResults = (results, total, page, limit) => {
  return {
    data: results,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  buildSearchQuery,
  buildSortOptions,
  buildPagination,
  formatSearchResults
}; 