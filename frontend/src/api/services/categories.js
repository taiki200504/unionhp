import client from '../client';

const categoryService = {
  // カテゴリー一覧取得
  getCategories: async (params = {}) => {
    const response = await client.get('/categories', { params });
    return response.data;
  },

  // カテゴリー詳細取得
  getCategoryById: async (id) => {
    const response = await client.get(`/categories/${id}`);
    return response.data;
  },

  // カテゴリー作成
  createCategory: async (data) => {
    const response = await client.post('/categories', data);
    return response.data;
  },

  // カテゴリー更新
  updateCategory: async (id, data) => {
    const response = await client.patch(`/categories/${id}`, data);
    return response.data;
  },

  // カテゴリー削除
  deleteCategory: async (id) => {
    await client.delete(`/categories/${id}`);
  },

  // 親カテゴリー取得
  getParentCategories: async () => {
    const response = await client.get('/categories', {
      params: { parent: null }
    });
    return response.data;
  },

  // 子カテゴリー取得
  getChildCategories: async (parentId) => {
    const response = await client.get('/categories', {
      params: { parent: parentId }
    });
    return response.data;
  }
};

export default categoryService; 