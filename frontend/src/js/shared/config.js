/**
 * UNION HPとCMS共通設定ファイル
 * CMSとメインサイトで共有する設定値を管理します
 */

// API基本設定
const API_CONFIG = {
  BASE_URL: 'http://localhost:3000',
  API_PATH: '/api',
  CMS_PATH: '/api/cms',
  MEDIA_PATH: '/media',
  AUTH_PATH: '/api/auth',
  
  // API完全URL
  get API_URL() { return this.BASE_URL + this.API_PATH; },
  get CMS_URL() { return this.BASE_URL + this.CMS_PATH; },
  get MEDIA_URL() { return this.BASE_URL + this.MEDIA_PATH; },
  get AUTH_URL() { return this.BASE_URL + this.AUTH_PATH; }
};

// サイト情報設定
const SITE_CONFIG = {
  SITE_NAME: '学生団体連合UNION',
  SITE_DESCRIPTION: '学生の声を社会に響かせる',
  SITE_URL: 'https://union-student.org',
  CONTACT_EMAIL: 'info@union-student.org',
  COPYRIGHT: '© 2025 学生団体連合UNION',
  
  // SNS設定
  SOCIAL_LINKS: {
    TWITTER: 'https://twitter.com/union_student',
    INSTAGRAM: 'https://instagram.com/union_student',
    FACEBOOK: 'https://facebook.com/unionstudent',
    YOUTUBE: 'https://youtube.com/c/unionstudent'
  }
};

// コンテンツ設定
const CONTENT_CONFIG = {
  // 投稿タイプ
  POST_TYPES: {
    NEWS: 'news',
    PROJECT: 'project',
    EVENT: 'event',
    REPORT: 'report'
  },
  
  // ステータス定義
  STATUS: {
    PUBLISHED: 'published',
    DRAFT: 'draft',
    ARCHIVED: 'archived'
  },
  
  // ユーザーロール
  USER_ROLES: {
    ADMIN: 'admin',
    EDITOR: 'editor',
    AUTHOR: 'author',
    CONTRIBUTOR: 'contributor'
  },
  
  // 表示設定
  DISPLAY: {
    ITEMS_PER_PAGE: 10,
    RECENT_ITEMS: 5,
    FEATURED_ITEMS: 3
  }
};

// エクスポート
export { API_CONFIG, SITE_CONFIG, CONTENT_CONFIG }; 