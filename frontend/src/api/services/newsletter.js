import client from '../client';

const newsletterService = {
  // ニュースレター一覧取得
  getNewsletters: async (params = {}) => {
    const response = await client.get('/newsletter', { params });
    return response.data;
  },

  // ニュースレター詳細取得
  getNewsletterById: async (id) => {
    const response = await client.get(`/newsletter/${id}`);
    return response.data;
  },

  // ニュースレター作成
  createNewsletter: async (data) => {
    const response = await client.post('/newsletter', data);
    return response.data;
  },

  // ニュースレター更新
  updateNewsletter: async (id, data) => {
    const response = await client.patch(`/newsletter/${id}`, data);
    return response.data;
  },

  // ニュースレター削除
  deleteNewsletter: async (id) => {
    await client.delete(`/newsletter/${id}`);
  },

  // ニュースレター配信
  sendNewsletter: async (id) => {
    const response = await client.post(`/newsletter/${id}/send`);
    return response.data;
  },

  // 購読登録
  subscribe: async (data) => {
    const response = await client.post('/newsletter/subscribe', data);
    return response.data;
  },

  // 購読確認
  confirmSubscription: async (token) => {
    const response = await client.get(`/newsletter/confirm/${token}`);
    return response.data;
  },

  // 購読解除
  unsubscribe: async (token) => {
    const response = await client.get(`/newsletter/unsubscribe/${token}`);
    return response.data;
  },

  // 購読者リスト取得（管理者専用）
  getSubscribers: async () => {
    const response = await client.get('/newsletter/subscribers');
    return response.data;
  },

  // 下書きニュースレター取得
  getDraftNewsletters: async () => {
    const response = await client.get('/newsletter', {
      params: { status: 'draft' }
    });
    return response.data;
  },

  // 配信済みニュースレター取得
  getSentNewsletters: async () => {
    const response = await client.get('/newsletter', {
      params: { status: 'sent' }
    });
    return response.data;
  }
};

export default newsletterService; 