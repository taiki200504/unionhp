import client from '../client';

const newsService = {
  // ニュース一覧取得
  getNews: async (params = {}) => {
    const response = await client.get('/news', { params });
    return response.data;
  },

  // ニュース詳細取得
  getNewsById: async (id) => {
    const response = await client.get(`/news/${id}`);
    return response.data;
  },

  // ニュース作成
  createNews: async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key]) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });

    const response = await client.post('/news', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // ニュース更新
  updateNews: async (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key]) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });

    const response = await client.patch(`/news/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // ニュース削除
  deleteNews: async (id) => {
    await client.delete(`/news/${id}`);
  },

  // 注目ニュース取得
  getFeaturedNews: async () => {
    const response = await client.get('/news', {
      params: { featured: true }
    });
    return response.data;
  },

  // カテゴリー別ニュース取得
  getNewsByCategory: async (categoryId) => {
    const response = await client.get('/news', {
      params: { category: categoryId }
    });
    return response.data;
  },

  // 年別ニュース取得
  getNewsByYear: async (year) => {
    const response = await client.get('/news', {
      params: { year }
    });
    return response.data;
  }
};

export default newsService; 