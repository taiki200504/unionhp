import client from '../client';

const cmsService = {
  // ページ一覧取得
  getPages: async (params = {}) => {
    const response = await client.get('/cms', { params });
    return response.data;
  },

  // ページ詳細取得
  getPageById: async (id) => {
    const response = await client.get(`/cms/${id}`);
    return response.data;
  },

  // ページ作成
  createPage: async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key]) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });

    const response = await client.post('/cms', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // ページ更新
  updatePage: async (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'image' && data[key]) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });

    const response = await client.patch(`/cms/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // ページ削除
  deletePage: async (id) => {
    await client.delete(`/cms/${id}`);
  },

  // ページの公開状態変更
  togglePublish: async (id) => {
    const response = await client.patch(`/cms/${id}/publish`);
    return response.data;
  },

  // ダッシュボード統計データ取得
  getDashboardStats: async () => {
    const response = await client.get('/cms/dashboard');
    return response.data;
  },

  // コンテンツ一覧取得
  getAllContent: async () => {
    const response = await client.get('/cms/content');
    return response.data;
  },

  // 特定のコンテンツタイプのリスト取得
  getContentByType: async (type) => {
    const response = await client.get(`/cms/content/${type}`);
    return response.data;
  },

  // 下書き記事取得
  getDrafts: async () => {
    const response = await client.get('/cms/drafts');
    return response.data;
  },

  // 公開済み記事取得
  getPublished: async () => {
    const response = await client.get('/cms/published');
    return response.data;
  },

  // アーカイブ済み記事取得
  getArchived: async () => {
    const response = await client.get('/cms/archived');
    return response.data;
  },

  // 特集記事取得
  getFeatured: async () => {
    const response = await client.get('/cms/featured');
    return response.data;
  },

  // 特集記事の切り替え
  toggleFeatured: async (id) => {
    const response = await client.post(`/cms/featured/${id}`);
    return response.data;
  },

  // メディア一覧取得
  getMedia: async () => {
    const response = await client.get('/cms/media');
    return response.data;
  },

  // メディア削除
  deleteMedia: async (filename) => {
    await client.delete(`/cms/media/${filename}`);
  },

  // メディア整理
  organizeMedia: async (data) => {
    const response = await client.post('/cms/media/organize', data);
    return response.data;
  },

  // ユーザー活動ログ取得
  getActivityLog: async () => {
    const response = await client.get('/cms/activity-log');
    return response.data;
  },

  // サイト設定取得
  getSettings: async () => {
    const response = await client.get('/cms/settings');
    return response.data;
  },

  // サイト設定更新
  updateSettings: async (data) => {
    const response = await client.patch('/cms/settings', data);
    return response.data;
  }
};

export default cmsService; 