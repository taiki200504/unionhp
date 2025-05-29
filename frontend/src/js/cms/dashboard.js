// API基本設定
const API_BASE_URL = 'http://localhost:3000';
const API_CMS_URL = `${API_BASE_URL}/api/cms`;
let authToken = localStorage.getItem('authToken');

// 認証ヘッダーの作成
const getAuthHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };
};

// DOMの読み込み完了時の処理
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

// ダッシュボードの初期化
async function initDashboard() {
    try {
        // ユーザー情報の取得
        await fetchUserInfo();
        
        // ダッシュボードデータの取得
        await fetchDashboardData();
        
        // イベントリスナーの設定
        setupEventListeners();
    } catch (error) {
        console.error('初期化エラー:', error);
        showNotification('初期化に失敗しました', 'error');
    }
}

// イベントリスナーの設定
function setupEventListeners() {
    // 更新ボタン
    document.getElementById('refreshBtn').addEventListener('click', fetchDashboardData);
    
    // ログアウトボタン
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// ダッシュボードデータの取得
async function fetchDashboardData() {
    try {
        showLoadingState();

        const response = await fetch(`${API_CMS_URL}/dashboard`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) {
                // 認証エラーの場合、ログイン画面にリダイレクト
                window.location.href = 'login.html';
                return;
            }
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        updateDashboard(data);
        
        // 最終更新時間を更新
        const now = new Date();
        document.getElementById('lastUpdate').textContent = `最終更新: ${now.toLocaleString('ja-JP')}`;
    } catch (error) {
        console.error('ダッシュボードデータの取得に失敗しました:', error);
        showNotification('データの取得に失敗しました', 'error');
        
        // デモ用のダミーデータを読み込む（開発環境でのみ使用）
        if (process.env.NODE_ENV === 'development') {
            loadDummyData();
        }
    }
}

// ローディング状態の表示
function showLoadingState() {
    document.getElementById('recentNewsTable').innerHTML = '<tr><td colspan="3" class="py-4 text-center text-gray-400">読み込み中...</td></tr>';
    document.getElementById('popularNewsTable').innerHTML = '<tr><td colspan="3" class="py-4 text-center text-gray-400">読み込み中...</td></tr>';
    document.getElementById('activityLogTable').innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-400">読み込み中...</td></tr>';
}

// ダッシュボードの更新
function updateDashboard(data) {
    // 統計データの更新
    const stats = data.stats || {
        news: { total: 0, published: 0, draft: 0 },
        categories: { total: 0, parentCategories: 0, childCategories: 0 },
        users: { total: 0, admin: 0, editor: 0 },
        subscribers: { total: 0, active: 0, pending: 0 }
    };
    
    // ニュース統計
    document.getElementById('totalNews').textContent = stats.news.total;
    document.getElementById('publishedNews').textContent = stats.news.published;
    document.getElementById('draftNews').textContent = stats.news.draft;
    
    // カテゴリー統計
    document.getElementById('totalCategories').textContent = stats.categories.total;
    document.getElementById('parentCategories').textContent = stats.categories.parentCategories;
    document.getElementById('childCategories').textContent = stats.categories.childCategories;
    
    // ユーザー統計
    document.getElementById('totalUsers').textContent = stats.users.total;
    document.getElementById('adminUsers').textContent = stats.users.admin;
    document.getElementById('editorUsers').textContent = stats.users.editor;
    
    // 購読者統計
    document.getElementById('totalSubscribers').textContent = stats.subscribers.total;
    document.getElementById('activeSubscribers').textContent = stats.subscribers.active;
    document.getElementById('pendingSubscribers').textContent = stats.subscribers.pending;
    
    // 最近の記事テーブル
    const recentNewsTable = document.getElementById('recentNewsTable');
    if (data.recentNews && data.recentNews.length > 0) {
        recentNewsTable.innerHTML = data.recentNews.map(news => `
            <tr class="border-b border-gray-200 hover:bg-gray-50 table-row">
                <td class="py-3 px-4">
                    <div class="flex items-start">
                        <div class="flex-shrink-0 w-10 h-10 mr-3 rounded-md overflow-hidden shadow-sm">
                            ${news.thumbnail ? `
                                <img src="${news.thumbnail}" class="w-full h-full object-cover" alt="${news.title}">
                            ` : `
                                <div class="bg-gray-100 w-full h-full flex items-center justify-center text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            `}
                        </div>
                        <div class="flex-1 min-w-0">
                            <a href="edit-news.html?id=${news.id}" class="font-medium text-blue-600 hover:text-blue-800 hover:underline truncate block">
                                ${news.title}
                            </a>
                            <span class="text-xs text-gray-500">${formatDate(news.createdAt || news.created_at)}</span>
                        </div>
                    </div>
                </td>
                <td class="py-3 px-4">
                    <span class="inline-flex items-center">
                        <span class="status-dot" style="background-color: ${getStatusDotColor(news.status)}"></span>
                        <span class="px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBackgroundClass(news.status)}">
                            ${getStatusText(news.status)}
                        </span>
                    </span>
                </td>
                <td class="py-3 px-4">
                    <div class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>${news.views || 0}</span>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        recentNewsTable.innerHTML = '<tr><td colspan="3" class="py-4 text-center text-gray-400">記事がありません</td></tr>';
    }
    
    // 人気記事テーブル
    const popularNewsTable = document.getElementById('popularNewsTable');
    if (data.popularNews && data.popularNews.length > 0) {
        popularNewsTable.innerHTML = data.popularNews.map(news => `
            <tr class="border-b border-gray-200 hover:bg-gray-50 table-row">
                <td class="py-3 px-4">
                    <div class="flex items-start">
                        <div class="flex-shrink-0 w-10 h-10 mr-3 rounded-md overflow-hidden shadow-sm">
                            ${news.thumbnail ? `
                                <img src="${news.thumbnail}" class="w-full h-full object-cover" alt="${news.title}">
                            ` : `
                                <div class="bg-gray-100 w-full h-full flex items-center justify-center text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            `}
                        </div>
                        <a href="edit-news.html?id=${news.id}" class="font-medium text-blue-600 hover:text-blue-800 hover:underline truncate block">
                            ${news.title}
                        </a>
                    </div>
                </td>
                <td class="py-3 px-4">
                    ${news.category ? 
                        `<span class="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs shadow-sm">
                            ${typeof news.category === 'string' ? news.category : news.category.name}
                        </span>` 
                        : '<span class="text-gray-400 text-sm">-</span>'}
                </td>
                <td class="py-3 px-4">
                    <div class="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span class="font-medium">${news.views || 0}</span>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        popularNewsTable.innerHTML = '<tr><td colspan="3" class="py-4 text-center text-gray-400">記事がありません</td></tr>';
    }
    
    // アクティビティログ
    const activityLogTable = document.getElementById('activityLogTable');
    if (data.recentActivity && data.recentActivity.length > 0) {
        activityLogTable.innerHTML = data.recentActivity.map(log => `
            <tr class="border-b border-gray-200 hover:bg-gray-50 table-row">
                <td class="py-3 px-4">
                    <div class="flex items-center">
                        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-2 shadow-sm">
                            ${log.user && log.user.name ? log.user.name.substring(0, 1).toUpperCase() : 'S'}
                        </div>
                        <div>
                            <div class="font-medium">${log.user ? log.user.name : 'システム'}</div>
                            <div class="text-xs text-gray-500">${log.user ? getRoleText(log.user.role) : ''}</div>
                        </div>
                    </div>
                </td>
                <td class="py-3 px-4">
                    <span class="px-2.5 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}">
                        ${getActionText(log.action)}
                    </span>
                </td>
                <td class="py-3 px-4">
                    <span class="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs shadow-sm">
                        ${getResourceText(log.resource)}
                    </span>
                </td>
                <td class="py-3 px-4 text-gray-600 truncate max-w-xs">${log.details || '-'}</td>
                <td class="py-3 px-4 text-gray-500 text-sm">${formatDate(log.timestamp || log.createdAt || log.created_at)}</td>
            </tr>
        `).join('');
    } else {
        activityLogTable.innerHTML = '<tr><td colspan="5" class="py-4 text-center text-gray-400">アクティビティがありません</td></tr>';
    }
}

// ステータスに応じたドットの色を取得
function getStatusDotColor(status) {
    switch (status) {
        case 'published': return '#10b981'; // グリーン
        case 'draft': return '#6b7280';     // グレー
        case 'archived': return '#ef4444';  // レッド
        default: return '#6b7280';          // デフォルトはグレー
    }
}

// ステータスに応じた背景色クラスを取得
function getStatusBackgroundClass(status) {
    switch (status) {
        case 'published': return 'bg-green-100 text-green-800 border border-green-200';
        case 'draft': return 'bg-gray-100 text-gray-800 border border-gray-200';
        case 'archived': return 'bg-red-100 text-red-800 border border-red-200';
        default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
}

// アクションに応じた背景色を取得
function getActionColor(action) {
    switch (action) {
        case 'create': return 'bg-green-100 text-green-800 border border-green-200';
        case 'update': return 'bg-blue-100 text-blue-800 border border-blue-200';
        case 'delete': return 'bg-red-100 text-red-800 border border-red-200';
        case 'publish': return 'bg-green-100 text-green-800 border border-green-200';
        case 'unpublish': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
        case 'archive': return 'bg-red-100 text-red-800 border border-red-200';
        case 'unarchive': return 'bg-blue-100 text-blue-800 border border-blue-200';
        case 'featured': return 'bg-purple-100 text-purple-800 border border-purple-200';
        case 'unfeatured': return 'bg-gray-100 text-gray-800 border border-gray-200';
        case 'login': return 'bg-blue-100 text-blue-800 border border-blue-200';
        case 'logout': return 'bg-gray-100 text-gray-800 border border-gray-200';
        default: return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
}

// ステータスの表示名を取得
function getStatusText(status) {
    switch (status) {
        case 'published': return '公開中';
        case 'draft': return '下書き';
        case 'archived': return 'アーカイブ';
        default: return status;
    }
}

// アクションテキストを取得
function getActionText(action) {
    switch (action) {
        case 'create': return '作成';
        case 'update': return '更新';
        case 'delete': return '削除';
        case 'publish': return '公開';
        case 'unpublish': return '非公開';
        case 'archive': return 'アーカイブ';
        case 'unarchive': return 'アーカイブ解除';
        case 'featured': return '特集に追加';
        case 'unfeatured': return '特集から削除';
        case 'login': return 'ログイン';
        case 'logout': return 'ログアウト';
        default: return action;
    }
}

// リソーステキストを取得
function getResourceText(resource) {
    switch (resource) {
        case 'news': return 'ニュース';
        case 'category': return 'カテゴリー';
        case 'user': return 'ユーザー';
        case 'subscriber': return '購読者';
        case 'media': return 'メディア';
        case 'settings': return '設定';
        case 'newsletter': return 'ニュースレター';
        default: return resource;
    }
}

// ロールの表示名を取得
function getRoleText(role) {
    const roles = {
        'admin': '管理者',
        'editor': '編集者',
        'author': '著者',
        'contributor': '寄稿者'
    };
    
    return roles[role] || role;
}

// 日付フォーマット
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// ユーザー情報の取得
async function fetchUserInfo() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) {
                // 認証エラーの場合、ログイン画面にリダイレクト
                window.location.href = 'login.html';
                return;
            }
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // ユーザー情報の表示
        const userInfoEl = document.getElementById('userInfo');
        if (userInfoEl && data.user) {
            userInfoEl.textContent = `ログイン中: ${data.user.username} (${getRoleText(data.user.role)})`;
        }
    } catch (error) {
        console.error('ユーザー情報の取得に失敗しました:', error);
        
        // 開発環境では仮のユーザー情報を表示
        if (process.env.NODE_ENV === 'development') {
            document.getElementById('userInfo').textContent = 'ログイン中: 開発者（管理者）';
        }
    }
}

// ログアウト処理
async function logout() {
    try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
    } catch (error) {
        console.error('ログアウトエラー:', error);
    } finally {
        // トークンの削除とリダイレクト
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    }
}

// 通知表示
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
    } text-white`;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('opacity-0', 'transition-opacity');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// デモ用のダミーデータ（開発環境でのみ使用）
function loadDummyData() {
    const dummyData = {
        stats: {
            news: {
                total: 24,
                published: 18,
                draft: 6
            },
            categories: {
                total: 8,
                parentCategories: 3,
                childCategories: 5
            },
            users: {
                total: 5,
                admin: 1,
                editor: 4
            },
            subscribers: {
                total: 142,
                active: 128,
                pending: 14
            }
        },
        recentNews: [
            {
                id: '1',
                title: '新製品発表会のお知らせ',
                status: 'published',
                views: 124,
                createdAt: new Date(Date.now() - 3600000).toISOString()
            },
            {
                id: '2',
                title: '年末特別セールのご案内',
                status: 'published',
                views: 87,
                createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: '3',
                title: '採用情報更新しました',
                status: 'draft',
                views: 0,
                createdAt: new Date(Date.now() - 172800000).toISOString()
            }
        ],
        popularNews: [
            {
                id: '4',
                title: '創業10周年記念イベント',
                category: 'イベント',
                views: 542
            },
            {
                id: '5',
                title: '夏季限定商品発売のお知らせ',
                category: '新製品',
                views: 321
            },
            {
                id: '6',
                title: 'オフィス移転のお知らせ',
                category: 'お知らせ',
                views: 210
            }
        ],
        recentActivity: [
            {
                user: { name: '山田太郎', role: 'admin' },
                action: 'create',
                resource: 'news',
                details: '新製品発表会のお知らせ を作成しました',
                timestamp: new Date(Date.now() - 1800000).toISOString()
            },
            {
                user: { name: '鈴木花子', role: 'editor' },
                action: 'update',
                resource: 'category',
                details: 'カテゴリー「イベント」を更新しました',
                timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
                user: { name: '佐藤一郎', role: 'editor' },
                action: 'publish',
                resource: 'news',
                details: '年末特別セールのご案内 を公開しました',
                timestamp: new Date(Date.now() - 7200000).toISOString()
            }
        ]
    };
    
    updateDashboard(dummyData);
} 