/**
 * UNION CMS管理画面アプリケーション
 * CMS管理画面全体の制御を行う
 */
import { SITE_CONFIG, CONTENT_CONFIG } from './shared/config.js';
import { ContentAPI, CategoryAPI, MediaAPI, NewsletterAPI, AuthAPI } from './shared/api.js';
import { showNotification, getAuthToken, formatDate } from './shared/utils.js';
import { createModal } from './shared/components.js';

// アプリケーション状態
const appState = {
  currentSection: null,
  isAuthenticated: false,
  user: null,
  isDarkMode: true
};

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {
  initCmsApp();
});

/**
 * CMS管理画面の初期化
 */
async function initCmsApp() {
  try {
    // 認証状態の確認
    if (!checkAuth()) return;
    
    // 共通UIの初期化
    initCommonUI();
    
    // 現在のセクションを判断
    appState.currentSection = getCurrentSection();
    
    // セクション別の初期化
    switch (appState.currentSection) {
      case 'dashboard':
        await initDashboard();
        break;
      case 'content':
        await initContentManager();
        break;
      case 'media':
        await initMediaManager();
        break;
      case 'categories':
        await initCategoryManager();
        break;
      case 'newsletter':
        await initNewsletterManager();
        break;
      case 'users':
        await initUserManager();
        break;
      case 'settings':
        await initSettings();
        break;
      default:
        // 未知のセクション
        showNotification('不明なセクションです。', 'error');
        break;
    }
    
  } catch (error) {
    console.error('CMS初期化に失敗しました:', error);
    showNotification('管理画面の読み込み中にエラーが発生しました。', 'error');
  }
}

/**
 * 認証状態の確認
 * @return {boolean} 認証済みかどうか
 */
function checkAuth() {
  const token = getAuthToken();
  
  if (!token) {
    // 未認証の場合はログインページにリダイレクト
    window.location.href = '/login.html';
    return false;
  }
  
  appState.isAuthenticated = true;
  
  // ユーザー情報の取得
  fetchUserInfo();
  
  return true;
}

/**
 * ユーザー情報の取得
 */
async function fetchUserInfo() {
  try {
    const userData = await AuthAPI.getMe();
    appState.user = userData.user;
    
    // ユーザー情報表示の更新
    updateUserInfoDisplay();
  } catch (error) {
    console.error('ユーザー情報の取得に失敗しました:', error);
    // エラー時は開発モード用のダミーデータを表示
    appState.user = {
      username: '管理者',
      role: 'admin',
      id: 'dev-mode'
    };
    updateUserInfoDisplay();
  }
}

/**
 * ユーザー情報表示の更新
 */
function updateUserInfoDisplay() {
  const userInfoEl = document.getElementById('userInfo');
  if (userInfoEl && appState.user) {
    const roleName = getRoleName(appState.user.role);
    userInfoEl.textContent = `ログイン中: ${appState.user.username} (${roleName})`;
  }
}

/**
 * ロール名の取得
 * @param {string} role - ロールコード
 * @return {string} 表示用ロール名
 */
function getRoleName(role) {
  const roles = {
    'admin': '管理者',
    'editor': '編集者',
    'author': '著者',
    'contributor': '寄稿者'
  };
  
  return roles[role] || role;
}

/**
 * 現在のセクション名を取得
 * @return {string} セクション名
 */
function getCurrentSection() {
  // URLのパスからセクション名を抽出
  const path = window.location.pathname;
  const pageName = path.split('/').pop().replace('.html', '');
  
  if (pageName.includes('dashboard')) return 'dashboard';
  if (pageName.includes('content')) return 'content';
  if (pageName.includes('media')) return 'media';
  if (pageName.includes('categories')) return 'categories';
  if (pageName.includes('newsletter')) return 'newsletter';
  if (pageName.includes('users')) return 'users';
  if (pageName.includes('settings')) return 'settings';
  
  return 'unknown';
}

/**
 * 共通UIの初期化
 */
function initCommonUI() {
  // サイドバーのアクティブ状態設定
  const currentSection = getCurrentSection();
  const navItems = document.querySelectorAll('aside nav a');
  
  navItems.forEach(item => {
    if (item.getAttribute('href').includes(currentSection)) {
      item.classList.add('sidebar-active');
    } else {
      item.classList.remove('sidebar-active');
    }
  });
  
  // ログアウトボタン
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // ダークモード切替（未実装）
  const darkModeToggle = document.getElementById('darkModeToggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', toggleDarkMode);
  }
}

/**
 * ログアウト処理
 */
async function handleLogout() {
  try {
    await AuthAPI.logout();
    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
  } catch (error) {
    console.error('ログアウトに失敗しました:', error);
    // エラーが発生してもログアウト処理を続行
    localStorage.removeItem('authToken');
    window.location.href = '/login.html';
  }
}

/**
 * ダークモード切替
 */
function toggleDarkMode() {
  appState.isDarkMode = !appState.isDarkMode;
  
  if (appState.isDarkMode) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // 設定の保存
  localStorage.setItem('darkMode', appState.isDarkMode ? 'enabled' : 'disabled');
}

/**
 * ダッシュボードの初期化
 */
async function initDashboard() {
  try {
    // ダッシュボードデータの取得
    // 実際のAPI実装時にはAPIから取得する
    const dashboardData = await fetchDashboardData();
    
    // 統計データの表示
    updateDashboardStats(dashboardData.stats);
    
    // 最近の記事の表示
    updateRecentArticles(dashboardData.recentArticles);
    
    // 人気記事の表示
    updatePopularArticles(dashboardData.popularArticles);
    
    // アクティビティログの表示
    updateActivityLog(dashboardData.activityLog);
    
    // リフレッシュボタンの設定
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => initDashboard());
    }
    
    // 最終更新時間の表示
    const lastUpdateEl = document.getElementById('lastUpdate');
    if (lastUpdateEl) {
      const now = new Date();
      lastUpdateEl.textContent = `最終更新: ${now.toLocaleString()}`;
    }
    
  } catch (error) {
    console.error('ダッシュボードデータの取得に失敗しました:', error);
    showNotification('ダッシュボードの読み込みに失敗しました。', 'error');
  }
}

/**
 * ダッシュボードデータの取得（モックデータ）
 * @return {Promise<Object>} ダッシュボードデータ
 */
async function fetchDashboardData() {
  // 実際のAPI実装時にはAPIから取得する
  // 現在はモックデータを返す
  return {
    stats: {
      contents: {
        total: 125,
        published: 87,
        draft: 38
      },
      categories: {
        total: 12,
        parentCategories: 5,
        childCategories: 7
      },
      users: {
        total: 8,
        admin: 2,
        editor: 6
      },
      subscribers: {
        total: 457,
        active: 412,
        pending: 45
      }
    },
    recentArticles: [
      {
        id: '1',
        title: '2025年度 新規メンバー募集のお知らせ',
        status: 'published',
        publishedAt: new Date(),
        views: 123
      },
      {
        id: '2',
        title: 'プログラミングワークショップ開催レポート',
        status: 'published',
        publishedAt: new Date(Date.now() - 86400000),
        views: 89
      },
      {
        id: '3',
        title: '大学祭出展企画のお知らせ',
        status: 'draft',
        publishedAt: null,
        views: 0
      }
    ],
    popularArticles: [
      {
        id: '4',
        title: 'UNION設立5周年記念イベント開催',
        category: 'イベント',
        publishedAt: new Date(Date.now() - 5 * 86400000),
        views: 562
      },
      {
        id: '5',
        title: '学生団体連合UNIONとは',
        category: '団体紹介',
        publishedAt: new Date(Date.now() - 30 * 86400000),
        views: 421
      },
      {
        id: '6',
        title: '就活支援プログラムの参加者募集',
        category: '募集',
        publishedAt: new Date(Date.now() - 3 * 86400000),
        views: 385
      }
    ],
    activityLog: [
      {
        user: { name: '管理者', role: 'admin' },
        action: 'create',
        resource: 'article',
        details: '記事「2025年度 新規メンバー募集のお知らせ」を作成しました',
        timestamp: new Date()
      },
      {
        user: { name: '編集者A', role: 'editor' },
        action: 'update',
        resource: 'article',
        details: '記事「プログラミングワークショップ開催レポート」を更新しました',
        timestamp: new Date(Date.now() - 30 * 60000)
      },
      {
        user: { name: '管理者', role: 'admin' },
        action: 'delete',
        resource: 'category',
        details: 'カテゴリー「テスト」を削除しました',
        timestamp: new Date(Date.now() - 2 * 3600000)
      }
    ]
  };
}

/**
 * ダッシュボード統計データの更新
 * @param {Object} stats - 統計データ
 */
function updateDashboardStats(stats) {
  // コンテンツ統計
  document.getElementById('totalContents')?.textContent = stats.contents.total;
  document.getElementById('publishedContents')?.textContent = stats.contents.published;
  document.getElementById('draftContents')?.textContent = stats.contents.draft;
  
  // カテゴリー統計
  document.getElementById('totalCategories')?.textContent = stats.categories.total;
  document.getElementById('parentCategories')?.textContent = stats.categories.parentCategories;
  document.getElementById('childCategories')?.textContent = stats.categories.childCategories;
  
  // ユーザー統計
  document.getElementById('totalUsers')?.textContent = stats.users.total;
  document.getElementById('adminUsers')?.textContent = stats.users.admin;
  document.getElementById('editorUsers')?.textContent = stats.users.editor;
  
  // 購読者統計
  document.getElementById('totalSubscribers')?.textContent = stats.subscribers.total;
  document.getElementById('activeSubscribers')?.textContent = stats.subscribers.active;
  document.getElementById('pendingSubscribers')?.textContent = stats.subscribers.pending;
}

/**
 * 最近の記事一覧の更新
 * @param {Array} articles - 記事データ配列
 */
function updateRecentArticles(articles) {
  const tableBody = document.getElementById('recentArticlesTable');
  if (!tableBody) return;
  
  if (!articles || articles.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="3" class="py-4 text-center text-gray-400">記事がありません</td></tr>';
    return;
  }
  
  tableBody.innerHTML = articles.map(article => `
    <tr class="border-b border-gray-700 hover:bg-gray-800">
      <td class="py-2 px-4">
        <a href="edit-content.html?id=${article.id}" class="hover:text-blue-400 truncate block max-w-xs">
          ${article.title}
        </a>
      </td>
      <td class="py-2 px-4">
        <span class="px-2 py-1 rounded text-xs ${getStatusClass(article.status)}">
          ${getStatusText(article.status)}
        </span>
      </td>
      <td class="py-2 px-4">${article.views}</td>
    </tr>
  `).join('');
}

/**
 * 人気記事一覧の更新
 * @param {Array} articles - 記事データ配列
 */
function updatePopularArticles(articles) {
  const tableBody = document.getElementById('popularArticlesTable');
  if (!tableBody) return;
  
  if (!articles || articles.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="3" class="py-4 text-center text-gray-400">記事がありません</td></tr>';
    return;
  }
  
  tableBody.innerHTML = articles.map(article => `
    <tr class="border-b border-gray-700 hover:bg-gray-800">
      <td class="py-2 px-4">
        <a href="edit-content.html?id=${article.id}" class="hover:text-blue-400 truncate block max-w-xs">
          ${article.title}
        </a>
      </td>
      <td class="py-2 px-4">${article.category || 'なし'}</td>
      <td class="py-2 px-4">${article.views}</td>
    </tr>
  `).join('');
}

/**
 * アクティビティログの更新
 * @param {Array} logs - ログデータ配列
 */
function updateActivityLog(logs) {
  const tableBody = document.getElementById('activityLogTable');
  if (!tableBody) return;
  
  if (!logs || logs.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-400">アクティビティがありません</td></tr>';
    return;
  }
  
  tableBody.innerHTML = logs.map(log => `
    <tr class="border-b border-gray-700 hover:bg-gray-800">
      <td class="py-2 px-4">
        ${log.user ? `${log.user.name} <span class="text-xs text-gray-400">(${getRoleName(log.user.role)})</span>` : 'システム'}
      </td>
      <td class="py-2 px-4">${getActionText(log.action)}</td>
      <td class="py-2 px-4">${getResourceText(log.resource)}</td>
      <td class="py-2 px-4 truncate max-w-xs">${log.details}</td>
      <td class="py-2 px-4 text-gray-400 text-sm">${formatDate(log.timestamp)}</td>
    </tr>
  `).join('');
}

/**
 * アクション表示名の取得
 * @param {string} action - アクションコード
 * @return {string} 表示用アクション名
 */
function getActionText(action) {
  const actions = {
    'create': '作成',
    'update': '更新',
    'delete': '削除',
    'publish': '公開',
    'unpublish': '非公開化',
    'archive': 'アーカイブ',
    'restore': '復元',
    'login': 'ログイン',
    'logout': 'ログアウト'
  };
  
  return actions[action] || action;
}

/**
 * リソース表示名の取得
 * @param {string} resource - リソースコード
 * @return {string} 表示用リソース名
 */
function getResourceText(resource) {
  const resources = {
    'article': '記事',
    'category': 'カテゴリー',
    'user': 'ユーザー',
    'media': 'メディア',
    'subscriber': '購読者',
    'newsletter': 'ニュースレター',
    'template': 'テンプレート',
    'system': 'システム'
  };
  
  return resources[resource] || resource;
}

/**
 * ステータス表示用クラスの取得
 * @param {string} status - ステータスコード
 * @return {string} CSSクラス
 */
function getStatusClass(status) {
  switch (status) {
    case 'published': return 'bg-green-900 text-green-300';
    case 'draft': return 'bg-gray-900 text-gray-300';
    case 'archived': return 'bg-red-900 text-red-300';
    default: return 'bg-gray-900 text-gray-300';
  }
}

/**
 * ステータス表示テキストの取得
 * @param {string} status - ステータスコード
 * @return {string} 表示用テキスト
 */
function getStatusText(status) {
  switch (status) {
    case 'published': return '公開済';
    case 'draft': return '下書き';
    case 'archived': return 'アーカイブ';
    default: return status;
  }
}

/**
 * コンテンツ管理画面の初期化
 */
async function initContentManager() {
  // コンテンツ管理画面の初期化処理（CMS管理機能の主要部分）
  // 既存のcontent.jsファイルとの統合を考慮
  
  // 新規作成ボタンのイベント設定
  const newContentBtn = document.getElementById('newContentBtn');
  if (newContentBtn) {
    newContentBtn.addEventListener('click', openNewContentModal);
  }
  
  // フィルター設定
  setupContentFilters();
  
  // コンテンツの読み込み
  await loadContentList();
}

/**
 * 新規コンテンツ作成モーダルを開く
 */
function openNewContentModal() {
  const modal = createModal({
    title: '新規コンテンツ作成',
    size: 'lg',
    content: `
      <form id="newContentForm" class="space-y-4">
        <div>
          <label class="block mb-1">タイトル <span class="text-red-500">*</span></label>
          <input type="text" name="title" required class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2">
        </div>
        <div>
          <label class="block mb-1">内容 <span class="text-red-500">*</span></label>
          <textarea name="content" rows="10" required class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block mb-1">カテゴリー</label>
            <select name="category" class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2">
              <option value="">カテゴリーなし</option>
              <!-- カテゴリーはAPIから取得して動的に設定 -->
            </select>
          </div>
          <div>
            <label class="block mb-1">ステータス</label>
            <select name="status" class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2">
              <option value="draft">下書き</option>
              <option value="published">公開</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block mb-1">タグ（カンマ区切り）</label>
          <input type="text" name="tags" class="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2" placeholder="例: ニュース, イベント, 告知">
        </div>
        <div class="flex justify-end gap-3 mt-6">
          <button type="button" id="cancelContentBtn" class="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded">キャンセル</button>
          <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded">保存</button>
        </div>
      </form>
    `
  });
  
  // カテゴリーの取得と設定
  loadCategories().then(categories => {
    const categorySelect = modal.element.querySelector('select[name="category"]');
    if (categorySelect && categories && categories.length > 0) {
      const optionsHTML = categories.map(category => 
        `<option value="${category.id}">${category.name}</option>`
      ).join('');
      
      categorySelect.innerHTML = `<option value="">カテゴリーなし</option>${optionsHTML}`;
    }
  });
  
  // フォーム送信イベント
  const form = modal.element.querySelector('#newContentForm');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const contentData = {
        title: formData.get('title'),
        content: formData.get('content'),
        category: formData.get('category') || null,
        status: formData.get('status'),
        tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : []
      };
      
      try {
        // 記事の作成
        await ContentAPI.createArticle(contentData);
        showNotification('コンテンツを作成しました');
        modal.close();
        
        // 一覧を再読み込み
        loadContentList();
      } catch (error) {
        console.error('コンテンツの作成に失敗しました:', error);
        showNotification('コンテンツの作成に失敗しました', 'error');
      }
    });
  }
  
  // キャンセルボタン
  const cancelBtn = modal.element.querySelector('#cancelContentBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => modal.close());
  }
}

/**
 * コンテンツフィルターの設定
 */
function setupContentFilters() {
  // ステータスフィルター
  const statusFilter = document.getElementById('statusFilter');
  if (statusFilter) {
    statusFilter.addEventListener('change', () => loadContentList());
  }
  
  // カテゴリーフィルター
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    // カテゴリーの取得と設定
    loadCategories().then(categories => {
      if (categories && categories.length > 0) {
        const optionsHTML = categories.map(category => 
          `<option value="${category.id}">${category.name}</option>`
        ).join('');
        
        categoryFilter.innerHTML = `<option value="">すべてのカテゴリー</option>${optionsHTML}`;
      }
    });
    
    categoryFilter.addEventListener('change', () => loadContentList());
  }
  
  // 検索フォーム
  const searchForm = document.getElementById('contentSearchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      loadContentList();
    });
    
    // リアルタイム検索
    const searchInput = searchForm.querySelector('input[type="search"]');
    if (searchInput) {
      let debounceTimer;
      searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => loadContentList(), 500);
      });
    }
  }
}

/**
 * コンテンツ一覧の読み込み
 */
async function loadContentList() {
  const contentTableBody = document.getElementById('contentTableBody');
  if (!contentTableBody) return;
  
  // 読み込み中表示
  contentTableBody.innerHTML = `
    <tr>
      <td colspan="6" class="py-4 text-center text-gray-400">読み込み中...</td>
    </tr>
  `;
  
  try {
    // フィルター値の取得
    const status = document.getElementById('statusFilter')?.value;
    const category = document.getElementById('categoryFilter')?.value;
    const search = document.getElementById('contentSearchInput')?.value;
    
    // パラメータの構築
    const params = {
      status: status !== 'all' ? status : undefined,
      category: category || undefined,
      search: search || undefined,
      page: 1,
      limit: 10
    };
    
    // APIからデータ取得
    const response = await ContentAPI.getArticles(params);
    const articles = response.data || [];
    
    if (articles.length === 0) {
      contentTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="py-4 text-center text-gray-400">コンテンツがありません</td>
        </tr>
      `;
      return;
    }
    
    // テーブル描画
    contentTableBody.innerHTML = articles.map(article => `
      <tr class="border-b border-gray-700 hover:bg-gray-800">
        <td class="py-3 px-4">
          <a href="edit-content.html?id=${article.id}" class="hover:text-blue-400">
            ${article.title}
          </a>
          ${article.featured ? '<span class="ml-2 bg-orange-600 text-white text-xs px-1 rounded">特集</span>' : ''}
        </td>
        <td class="py-3 px-4">
          <span class="px-2 py-1 rounded text-xs ${getStatusClass(article.status)}">
            ${getStatusText(article.status)}
          </span>
        </td>
        <td class="py-3 px-4">${article.category?.name || '-'}</td>
        <td class="py-3 px-4">${formatDate(article.publishedAt)}</td>
        <td class="py-3 px-4">${article.author || '-'}</td>
        <td class="py-3 px-4">
          <div class="flex gap-2">
            <a href="edit-content.html?id=${article.id}" class="p-1 bg-blue-600 rounded hover:bg-blue-700" title="編集">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </a>
            <button class="delete-content-btn p-1 bg-red-600 rounded hover:bg-red-700" title="削除" data-id="${article.id}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
    
    // 削除ボタンのイベント設定
    document.querySelectorAll('.delete-content-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const articleId = btn.getAttribute('data-id');
        confirmDeleteContent(articleId);
      });
    });
    
    // ページネーションの更新（実装省略）
    
  } catch (error) {
    console.error('コンテンツ一覧の取得に失敗しました:', error);
    contentTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-4 text-center text-red-400">データの取得に失敗しました。</td>
      </tr>
    `;
  }
}

/**
 * カテゴリー一覧の取得
 * @return {Promise<Array>} カテゴリー配列
 */
async function loadCategories() {
  try {
    const response = await CategoryAPI.getCategories();
    return response.data || [];
  } catch (error) {
    console.error('カテゴリー一覧の取得に失敗しました:', error);
    return [];
  }
}

/**
 * コンテンツ削除の確認
 * @param {string} contentId - コンテンツID
 */
function confirmDeleteContent(contentId) {
  const modal = createModal({
    title: 'コンテンツの削除',
    content: `
      <div class="mb-4">
        <p>このコンテンツを削除してもよろしいですか？</p>
        <p class="text-red-400 mt-2">この操作は元に戻せません。</p>
      </div>
      <div class="flex justify-end gap-3">
        <button id="cancelDeleteBtn" class="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded">キャンセル</button>
        <button id="confirmDeleteBtn" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded">削除</button>
      </div>
    `
  });
  
  // キャンセルボタン
  const cancelBtn = modal.element.querySelector('#cancelDeleteBtn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => modal.close());
  }
  
  // 削除ボタン
  const deleteBtn = modal.element.querySelector('#confirmDeleteBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      try {
        await ContentAPI.deleteArticle(contentId);
        showNotification('コンテンツを削除しました');
        modal.close();
        
        // 一覧を再読み込み
        loadContentList();
      } catch (error) {
        console.error('コンテンツの削除に失敗しました:', error);
        showNotification('コンテンツの削除に失敗しました', 'error');
      }
    });
  }
}

/**
 * メディア管理画面の初期化
 */
async function initMediaManager() {
  // ほかのセクションの初期化処理（既存のJSファイルを活用）
  // 実装は省略
}

/**
 * カテゴリー管理画面の初期化
 */
async function initCategoryManager() {
  // ほかのセクションの初期化処理（既存のJSファイルを活用）
  // 実装は省略
}

/**
 * ニュースレター管理画面の初期化
 */
async function initNewsletterManager() {
  // ほかのセクションの初期化処理（既存のJSファイルを活用）
  // 実装は省略
}

/**
 * ユーザー管理画面の初期化
 */
async function initUserManager() {
  // ほかのセクションの初期化処理（既存のJSファイルを活用）
  // 実装は省略
}

/**
 * 設定画面の初期化
 */
async function initSettings() {
  // ほかのセクションの初期化処理（既存のJSファイルを活用）
  // 実装は省略
} 