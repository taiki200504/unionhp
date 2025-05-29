import client from '../client';

const postService = {
  // 投稿一覧取得
  getPosts: async (params = {}) => {
    const response = await client.get('/posts', { params });
    return response.data;
  },

  // 投稿詳細取得
  getPostById: async (id) => {
    const response = await client.get(`/posts/${id}`);
    return response.data;
  },

  // 投稿作成
  createPost: async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key]) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });

    const response = await client.post('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // 投稿更新
  updatePost: async (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key]) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });

    const response = await client.patch(`/posts/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // 投稿削除
  deletePost: async (id) => {
    await client.delete(`/posts/${id}`);
  },

  // 注目投稿取得
  getFeaturedPosts: async () => {
    const response = await client.get('/posts', {
      params: { featured: true }
    });
    return response.data;
  },

  // カテゴリー別投稿取得
  getPostsByCategory: async (categoryId) => {
    const response = await client.get('/posts', {
      params: { category: categoryId }
    });
    return response.data;
  },

  // グループ別投稿取得
  getPostsByGroup: async (groupId) => {
    const response = await client.get('/posts', {
      params: { group: groupId }
    });
    return response.data;
  },

  // 下書き投稿取得
  getDraftPosts: async () => {
    const response = await client.get('/posts', {
      params: { status: 'draft' }
    });
    return response.data;
  },

  // 公開済み投稿取得
  getPublishedPosts: async () => {
    const response = await client.get('/posts', {
      params: { status: 'published' }
    });
    return response.data;
  }
};

export default postService; 