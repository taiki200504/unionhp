/**
 * UNION HPとCMS共通ユーティリティ関数
 * 両方のフロントエンドで再利用可能な関数を定義
 */
import { API_CONFIG, CONTENT_CONFIG } from './config.js';

/**
 * 日付フォーマット関数
 * @param {string|Date} dateString - フォーマットする日付
 * @param {boolean} includeTime - 時間を含めるかどうか
 * @return {string} フォーマット済みの日付文字列
 */
export function formatDate(dateString, includeTime = true) {
  if (!dateString) return '不明';
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  if (!includeTime) {
    return `${year}/${month}/${day}`;
  }
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

/**
 * テキストの切り詰め
 * @param {string} text - 切り詰めるテキスト
 * @param {number} maxLength - 最大文字数
 * @return {string} 切り詰められたテキスト
 */
export function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * スラッグの生成
 * @param {string} text - スラッグにするテキスト
 * @return {string} スラッグ文字列
 */
export function generateSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // 特殊文字を削除
    .replace(/\s+/g, '-')     // スペースをハイフンに置換
    .replace(/-+/g, '-');     // 複数のハイフンを単一のハイフンに置換
}

/**
 * ローカルストレージからトークンを取得
 * @return {string|null} 認証トークン
 */
export function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * 認証ヘッダーの作成
 * @return {Object} HTTP認証ヘッダー
 */
export function getAuthHeaders() {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
}

/**
 * APIリクエスト関数
 * @param {string} endpoint - APIエンドポイント
 * @param {Object} options - fetchオプション
 * @return {Promise} APIレスポンスのPromise
 */
export async function fetchAPI(endpoint, options = {}) {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${API_CONFIG.BASE_URL}${endpoint}`;
    
  const defaultOptions = {
    headers: getAuthHeaders()
  };
  
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...(options.headers || {})
    }
  };
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // 認証エラーの場合、ログイン画面にリダイレクト
    if (response.status === 401) {
      window.location.href = '/login.html';
      throw new Error('認証エラーが発生しました');
    }
    
    // エラーハンドリング
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    // レスポンスの種類を確認
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text();
  } catch (error) {
    console.error('API通信エラー:', error);
    throw error;
  }
}

/**
 * ユーザーロールのテキスト表示
 * @param {string} role - ユーザーロール
 * @return {string} 表示用ロール名
 */
export function getRoleText(role) {
  const roles = {
    'admin': '管理者',
    'editor': '編集者',
    'author': '著者',
    'contributor': '寄稿者'
  };
  
  return roles[role] || role;
}

/**
 * ステータス表示用クラス
 * @param {string} status - コンテンツステータス
 * @return {string} CSSクラス
 */
export function getStatusClass(status) {
  switch (status) {
    case CONTENT_CONFIG.STATUS.PUBLISHED:
      return 'bg-green-900 text-green-300';
    case CONTENT_CONFIG.STATUS.DRAFT:
      return 'bg-gray-900 text-gray-300';
    case CONTENT_CONFIG.STATUS.ARCHIVED:
      return 'bg-red-900 text-red-300';
    default:
      return 'bg-gray-900 text-gray-300';
  }
}

/**
 * ステータスのテキスト表示
 * @param {string} status - コンテンツステータス
 * @return {string} 表示用ステータステキスト
 */
export function getStatusText(status) {
  switch (status) {
    case CONTENT_CONFIG.STATUS.PUBLISHED:
      return '公開済';
    case CONTENT_CONFIG.STATUS.DRAFT:
      return '下書き';
    case CONTENT_CONFIG.STATUS.ARCHIVED:
      return 'アーカイブ';
    default:
      return status;
  }
}

/**
 * ファイルサイズのフォーマット
 * @param {number} bytes - バイト数
 * @return {string} フォーマット済みサイズ
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
}

/**
 * ファイル拡張子からタイプを取得
 * @param {string} filename - ファイル名
 * @return {string} ファイルタイプ
 */
export function getFileType(filename) {
  const extension = filename.split('.').pop().toLowerCase();
  
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'];
  const documentTypes = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'webm'];
  const audioTypes = ['mp3', 'wav', 'ogg', 'aac'];
  
  if (imageTypes.includes(extension)) return 'image';
  if (documentTypes.includes(extension)) return 'document';
  if (videoTypes.includes(extension)) return 'video';
  if (audioTypes.includes(extension)) return 'audio';
  
  return 'other';
}

/**
 * 通知表示
 * @param {string} message - 表示するメッセージ
 * @param {string} type - 通知タイプ (success, error, warning, info)
 * @param {number} duration - 表示時間（ミリ秒）
 */
export function showNotification(message, type = 'success', duration = 3000) {
  // 既存の通知があれば削除
  const existingNotifications = document.querySelectorAll('.notification-toast');
  existingNotifications.forEach(notification => {
    notification.remove();
  });
  
  // 通知スタイル
  const styles = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-yellow-600',
    info: 'bg-blue-600'
  };
  
  // 通知要素作成
  const notification = document.createElement('div');
  notification.className = `notification-toast fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 ${styles[type] || styles.info} text-white`;
  notification.textContent = message;
  
  // DOM追加
  document.body.appendChild(notification);
  
  // 一定時間後に削除
  setTimeout(() => {
    notification.classList.add('opacity-0', 'transition-opacity');
    setTimeout(() => notification.remove(), 300);
  }, duration);
} 