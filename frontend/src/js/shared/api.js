/**
 * UNION HPとCMS共通APIサービス
 * フロントエンドで使用するAPIリクエスト関数を定義
 */
import { API_CONFIG } from './config.js';
import { fetchAPI, getAuthHeaders } from './utils.js';

/**
 * コンテンツ関連のAPI
 */
export const ContentAPI = {
  /**
   * 記事一覧の取得
   * @param {Object} params - 検索条件
   * @return {Promise} 記事一覧
   */
  async getArticles(params = {}) {
    const queryParams = new URLSearchParams();
    
    // パラメータを設定
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchAPI(`${API_CONFIG.API_PATH}/contents${query}`);
  },
  
  /**
   * 記事の詳細取得
   * @param {string} id - 記事ID
   * @return {Promise} 記事詳細
   */
  async getArticle(id) {
    return fetchAPI(`${API_CONFIG.API_PATH}/contents/${id}`);
  },
  
  /**
   * 記事の作成
   * @param {Object} article - 記事データ
   * @return {Promise} 作成結果
   */
  async createArticle(article) {
    return fetchAPI(`${API_CONFIG.API_PATH}/contents`, {
      method: 'POST',
      body: JSON.stringify(article)
    });
  },
  
  /**
   * 記事の更新
   * @param {string} id - 記事ID
   * @param {Object} article - 更新データ
   * @return {Promise} 更新結果
   */
  async updateArticle(id, article) {
    return fetchAPI(`${API_CONFIG.API_PATH}/contents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(article)
    });
  },
  
  /**
   * 記事の削除
   * @param {string} id - 記事ID
   * @return {Promise} 削除結果
   */
  async deleteArticle(id) {
    return fetchAPI(`${API_CONFIG.API_PATH}/contents/${id}`, {
      method: 'DELETE'
    });
  }
};

/**
 * カテゴリー関連のAPI
 */
export const CategoryAPI = {
  /**
   * カテゴリー一覧の取得
   * @param {Object} params - 検索条件
   * @return {Promise} カテゴリー一覧
   */
  async getCategories(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchAPI(`${API_CONFIG.API_PATH}/categories${query}`);
  },
  
  /**
   * カテゴリーの取得
   * @param {string} id - カテゴリーID
   * @return {Promise} カテゴリー詳細
   */
  async getCategory(id) {
    return fetchAPI(`${API_CONFIG.API_PATH}/categories/${id}`);
  },
  
  /**
   * カテゴリーの作成
   * @param {Object} category - カテゴリーデータ
   * @return {Promise} 作成結果
   */
  async createCategory(category) {
    return fetchAPI(`${API_CONFIG.API_PATH}/categories`, {
      method: 'POST',
      body: JSON.stringify(category)
    });
  },
  
  /**
   * カテゴリーの更新
   * @param {string} id - カテゴリーID
   * @param {Object} category - 更新データ
   * @return {Promise} 更新結果
   */
  async updateCategory(id, category) {
    return fetchAPI(`${API_CONFIG.API_PATH}/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(category)
    });
  },
  
  /**
   * カテゴリーの削除
   * @param {string} id - カテゴリーID
   * @return {Promise} 削除結果
   */
  async deleteCategory(id) {
    return fetchAPI(`${API_CONFIG.API_PATH}/categories/${id}`, {
      method: 'DELETE'
    });
  }
};

/**
 * メディア関連のAPI
 */
export const MediaAPI = {
  /**
   * メディア一覧の取得
   * @param {Object} params - 検索条件
   * @return {Promise} メディア一覧
   */
  async getMedia(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchAPI(`${API_CONFIG.API_PATH}/media${query}`);
  },
  
  /**
   * メディアの詳細取得
   * @param {string} id - メディアID
   * @return {Promise} メディア詳細
   */
  async getMediaItem(id) {
    return fetchAPI(`${API_CONFIG.API_PATH}/media/${id}`);
  },
  
  /**
   * メディアのアップロード
   * @param {FormData} formData - フォームデータ
   * @return {Promise} アップロード結果
   */
  async uploadMedia(formData) {
    // フォームデータの場合はContent-Typeを自動設定させる
    const token = localStorage.getItem('authToken');
    
    return fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.API_PATH}/media`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: formData
    }).then(response => {
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return response.json();
    });
  },
  
  /**
   * メディアの削除
   * @param {string} id - メディアID
   * @return {Promise} 削除結果
   */
  async deleteMedia(id) {
    return fetchAPI(`${API_CONFIG.API_PATH}/media/${id}`, {
      method: 'DELETE'
    });
  }
};

/**
 * ニュースレター関連のAPI
 */
export const NewsletterAPI = {
  /**
   * 購読者一覧の取得
   * @param {Object} params - 検索条件
   * @return {Promise} 購読者一覧
   */
  async getSubscribers(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchAPI(`${API_CONFIG.API_PATH}/newsletter/subscribers${query}`);
  },
  
  /**
   * 購読者の詳細取得
   * @param {string} id - 購読者ID
   * @return {Promise} 購読者詳細
   */
  async getSubscriber(id) {
    return fetchAPI(`${API_CONFIG.API_PATH}/newsletter/subscribers/${id}`);
  },
  
  /**
   * 購読者の追加
   * @param {Object} subscriber - 購読者データ
   * @return {Promise} 追加結果
   */
  async addSubscriber(subscriber) {
    return fetchAPI(`${API_CONFIG.API_PATH}/newsletter/subscribers`, {
      method: 'POST',
      body: JSON.stringify(subscriber)
    });
  },
  
  /**
   * 購読者のステータス変更
   * @param {string} id - 購読者ID
   * @param {string} status - 新しいステータス
   * @return {Promise} 変更結果
   */
  async changeSubscriberStatus(id, status) {
    return fetchAPI(`${API_CONFIG.API_PATH}/newsletter/subscribers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },
  
  /**
   * 購読者の削除
   * @param {string} id - 購読者ID
   * @return {Promise} 削除結果
   */
  async deleteSubscriber(id) {
    return fetchAPI(`${API_CONFIG.API_PATH}/newsletter/subscribers/${id}`, {
      method: 'DELETE'
    });
  },
  
  /**
   * ニュースレターの配信
   * @param {Object} newsletter - ニュースレターデータ
   * @return {Promise} 配信結果
   */
  async sendNewsletter(newsletter) {
    return fetchAPI(`${API_CONFIG.API_PATH}/newsletter/send`, {
      method: 'POST',
      body: JSON.stringify(newsletter)
    });
  },
  
  /**
   * 配信履歴の取得
   * @param {Object} params - 検索条件
   * @return {Promise} 配信履歴
   */
  async getHistory(params = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return fetchAPI(`${API_CONFIG.API_PATH}/newsletter/history${query}`);
  }
};

/**
 * 認証関連のAPI
 */
export const AuthAPI = {
  /**
   * ログイン
   * @param {string} username - ユーザー名
   * @param {string} password - パスワード
   * @return {Promise} ログイン結果
   */
  async login(username, password) {
    return fetchAPI(`${API_CONFIG.AUTH_PATH}/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },
  
  /**
   * ログアウト
   * @return {Promise} ログアウト結果
   */
  async logout() {
    return fetchAPI(`${API_CONFIG.AUTH_PATH}/logout`, {
      method: 'POST'
    });
  },
  
  /**
   * 自分のユーザー情報取得
   * @return {Promise} ユーザー情報
   */
  async getMe() {
    return fetchAPI(`${API_CONFIG.AUTH_PATH}/me`);
  },
  
  /**
   * ユーザー登録 (管理者のみ)
   * @param {Object} user - ユーザーデータ
   * @return {Promise} 登録結果
   */
  async register(user) {
    return fetchAPI(`${API_CONFIG.AUTH_PATH}/register`, {
      method: 'POST',
      body: JSON.stringify(user)
    });
  }
}; 