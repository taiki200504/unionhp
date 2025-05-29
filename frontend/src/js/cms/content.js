// API基本設定
const API_BASE_URL = 'http://localhost:3000';
const API_CMS_URL = `${API_BASE_URL}/api/cms`;
let authToken = localStorage.getItem('authToken');

// 現在のフィルター状態
let currentState = {
    tab: 'all',      // all, published, draft, archived, featured
    category: '',    // カテゴリーID
    search: '',      // 検索キーワード
    sort: 'newest',  // newest, oldest, title, views
    dateFilter: '',  // today, week, month, year
    page: 1,         // 現在のページ
    limit: 10        // 1ページあたりの件数
};

// 認証ヘッダーの作成
const getAuthHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };
};

// DOMの読み込み完了時の処理
document.addEventListener('DOMContentLoaded', () => {
    initContentManager();
});

// コンテンツ管理画面の初期化
async function initContentManager() {
    try {
        // ユーザー情報の取得
        await fetchUserInfo();
        
        // カテゴリーの取得と設定
        await fetchCategories();
        
        // イベントリスナーの設定
        setupEventListeners();
        
        // 初期データの取得
        await fetchContent();
    } catch (error) {
        console.error('初期化エラー:', error);
        showNotification('初期化に失敗しました', 'error');
    }
}

// イベントリスナーの設定
function setupEventListeners() {
    // タブ切り替え
    document.querySelectorAll('.content-tabs button').forEach(tab => {
        tab.addEventListener('click', (e) => {
            // アクティブクラスの切り替え
            document.querySelectorAll('.content-tabs button').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            
            // 状態の更新
            currentState.tab = e.target.dataset.tab;
            currentState.page = 1;
            
            // コンテンツの再取得
            fetchContent();
        });
    });
    
    // 検索フォーム
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                currentState.search = searchInput.value.trim();
                currentState.page = 1;
                fetchContent();
            }, 500);
        });
    }
    
    // カテゴリーフィルター
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => {
            currentState.category = categoryFilter.value;
            currentState.page = 1;
            fetchContent();
        });
    }
    
    // 日付フィルター
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', () => {
            currentState.dateFilter = dateFilter.value;
            currentState.page = 1;
            fetchContent();
        });
    }
    
    // ソートオプション
    const sortOption = document.getElementById('sortOption');
    if (sortOption) {
        sortOption.addEventListener('change', () => {
            currentState.sort = sortOption.value;
            fetchContent();
        });
    }
    
    // ページネーションボタン
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentState.page > 1) {
            currentState.page--;
            fetchContent();
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        currentState.page++;
        fetchContent();
    });
    
    // ログアウトボタン
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

// コンテンツの取得
async function fetchContent() {
    try {
        // 読み込み中表示
        document.getElementById('contentTable').innerHTML = `
            <tr>
                <td colspan="6" class="py-4 text-center text-gray-400">読み込み中...</td>
            </tr>
        `;
        
        // APIエンドポイントの決定
        let endpoint = '';
        switch (currentState.tab) {
            case 'published':
                endpoint = `${API_CMS_URL}/published`;
                break;
            case 'draft':
                endpoint = `${API_CMS_URL}/drafts`;
                break;
            case 'archived':
                endpoint = `${API_CMS_URL}/archived`;
                break;
            case 'featured':
                endpoint = `${API_CMS_URL}/featured`;
                break;
            default:
                endpoint = `${API_CMS_URL}/content/news`;
        }
        
        // クエリパラメータの構築
        const params = new URLSearchParams();
        params.append('page', currentState.page);
        params.append('limit', currentState.limit);
        
        if (currentState.search) {
            params.append('search', currentState.search);
        }
        
        if (currentState.sort) {
            params.append('sort', currentState.sort);
        }
        
        if (currentState.category) {
            params.append('category', currentState.category);
        }
        
        if (currentState.tab === 'all' && currentState.dateFilter) {
            // 日付フィルター
            const now = new Date();
            let fromDate;
            
            switch (currentState.dateFilter) {
                case 'today':
                    fromDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    fromDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    fromDate = new Date(now.setDate(now.getDate() - 30));
                    break;
                case 'year':
                    fromDate = new Date(now.setFullYear(now.getFullYear() - 1));
                    break;
            }
            
            if (fromDate) {
                params.append('fromDate', fromDate.toISOString());
            }
        }
        
        // APIリクエスト
        const response = await fetch(`${endpoint}?${params.toString()}`, {
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
        renderContentTable(data);
        renderPagination(data);
        
    } catch (error) {
        console.error('コンテンツの取得に失敗しました:', error);
        document.getElementById('contentTable').innerHTML = `
            <tr>
                <td colspan="6" class="py-4 text-center text-red-400">データの取得に失敗しました。後でもう一度お試しください。</td>
            </tr>
        `;
    }
}

// コンテンツテーブルの描画
function renderContentTable(data) {
    const contentTable = document.getElementById('contentTable');
    let content = [];
    
    // レスポンスデータの構造に応じて適切なデータを抽出
    if (data.content) {
        content = data.content;
    } else if (data.published) {
        content = data.published;
    } else if (data.drafts) {
        content = data.drafts;
    } else if (data.archived) {
        content = data.archived;
    } else if (data.featured) {
        content = data.featured;
    }
    
    if (content.length === 0) {
        contentTable.innerHTML = `
            <tr>
                <td colspan="6" class="py-4 text-center text-gray-400">コンテンツがありません</td>
            </tr>
        `;
        return;
    }
    
    contentTable.innerHTML = content.map((item, index) => `
        <tr class="border-b border-gray-200 hover:bg-gray-50 table-row">
            <td class="py-3 px-4">
                <div class="flex items-center">
                    <div class="flex-shrink-0 w-12 h-12 mr-3">
                        ${item.thumbnail ? `
                            <img src="${item.thumbnail}" class="w-12 h-12 rounded-lg object-cover shadow-sm" alt="${item.title}">
                        ` : `
                            <div class="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        `}
                    </div>
                    <div>
                        <a href="edit-news.html?id=${item.id}" class="font-medium text-blue-600 hover:text-blue-800 hover:underline block text-base">
                            ${item.title}
                        </a>
                        <span class="text-xs text-gray-500">${formatDate(item.updated_at || item.updatedAt || item.created_at || item.createdAt)}</span>
                    </div>
                </div>
            </td>
            <td class="py-3 px-4">
                <span class="inline-flex items-center">
                    <span class="status-dot" style="background-color: ${getStatusDotColor(item.status)}"></span>
                    <span class="px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBackgroundClass(item.status)}">
                        ${getStatusText(item.status)}
                    </span>
                </span>
            </td>
            <td class="py-3 px-4">
                ${item.category ? 
                    `<span class="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs shadow-sm">
                        ${typeof item.category === 'string' ? item.category : item.category.name}
                    </span>` 
                    : '<span class="text-gray-400 text-sm">-</span>'}
            </td>
            <td class="py-3 px-4">
                <div class="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>${item.views || 0}</span>
                </div>
            </td>
            <td class="py-3 px-4 text-gray-500 text-sm">${formatDate(item.created_at || item.createdAt)}</td>
            <td class="py-3 px-4">
                <div class="flex gap-2">
                    <a href="edit-news.html?id=${item.id}" class="p-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 shadow-sm transition-colors" title="編集">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </a>
                    ${item.status !== 'published' ? `
                        <button onclick="publishContent('${item.id}')" class="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 shadow-sm transition-colors" title="公開">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </button>
                    ` : `
                        <button onclick="unpublishContent('${item.id}')" class="p-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 shadow-sm transition-colors" title="非公開">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                        </button>
                    `}
                    <button onclick="toggleFeatured('${item.id}', ${item.is_featured || item.isFeatured || false})" class="p-1.5 ${(item.is_featured || item.isFeatured) ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-md hover:${(item.is_featured || item.isFeatured) ? 'bg-purple-600' : 'bg-gray-300'} shadow-sm transition-colors" title="${(item.is_featured || item.isFeatured) ? '特集から削除' : '特集に追加'}" ${item.status !== 'published' ? 'disabled' : ''}>
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    </button>
                    <button onclick="deleteContent('${item.id}')" class="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 shadow-sm transition-colors" title="削除">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // 表示中のアイテム数を更新
    document.getElementById('currentItems').textContent = content.length;
    document.getElementById('totalItems').textContent = data.total || 0;
}

// ページネーションの描画
function renderPagination(data) {
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    const pageNumbers = document.getElementById('pageNumbers');
    
    const currentPage = data.current_page || 1;
    const totalPages = data.total_pages || 1;
    
    // 前へ・次へボタンの制御
    prevButton.disabled = currentPage <= 1;
    nextButton.disabled = currentPage >= totalPages;
    
    // ページ番号の描画
    pageNumbers.innerHTML = '';
    
    // 表示するページ番号の範囲を決定
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    // 最初のページへのリンク
    if (startPage > 1) {
        const btn = document.createElement('button');
        btn.className = 'px-3 py-1 bg-white rounded-md border border-gray-300 hover:bg-gray-50 shadow-sm';
        btn.textContent = '1';
        btn.onclick = () => changePage(1);
        pageNumbers.appendChild(btn);
        
        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-3 py-1 text-gray-400';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
    }
    
    // ページ番号ボタン
    for (let i = startPage; i <= endPage; i++) {
        const btn = document.createElement('button');
        btn.className = `px-3 py-1 rounded-md border ${i === currentPage 
            ? 'bg-blue-600 text-white border-blue-700 shadow-sm' 
            : 'bg-white border-gray-300 hover:bg-gray-50 shadow-sm'}`;
        btn.textContent = i;
        btn.onclick = () => changePage(i);
        pageNumbers.appendChild(btn);
    }
    
    // 最後のページへのリンク
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'px-3 py-1 text-gray-400';
            ellipsis.textContent = '...';
            pageNumbers.appendChild(ellipsis);
        }
        
        const btn = document.createElement('button');
        btn.className = 'px-3 py-1 bg-white rounded-md border border-gray-300 hover:bg-gray-50 shadow-sm';
        btn.textContent = totalPages;
        btn.onclick = () => changePage(totalPages);
        pageNumbers.appendChild(btn);
    }
}

// ページ変更処理
function changePage(page) {
    currentState.page = page;
    fetchContent();
    
    // ページトップにスクロール
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 特集記事の切り替え
async function toggleFeatured(id, isFeatured) {
    try {
        const action = isFeatured ? 'unfeatured' : 'featured';
        const response = await fetch(`${API_CMS_URL}/content/${id}/${action}`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        showNotification(`記事を${isFeatured ? '特集から削除' : '特集に追加'}しました`);
        fetchContent();
    } catch (error) {
        console.error('特集切り替えに失敗しました:', error);
        showNotification('特集の切り替えに失敗しました', 'error');
    }
}

// 記事の公開
async function publishContent(id) {
    try {
        const response = await fetch(`${API_CMS_URL}/content/${id}/publish`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        showNotification('記事を公開しました');
        fetchContent();
    } catch (error) {
        console.error('記事の公開に失敗しました:', error);
        showNotification('記事の公開に失敗しました', 'error');
    }
}

// 記事の非公開
async function unpublishContent(id) {
    try {
        const response = await fetch(`${API_CMS_URL}/content/${id}/unpublish`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        showNotification('記事を非公開にしました');
        fetchContent();
    } catch (error) {
        console.error('記事の非公開に失敗しました:', error);
        showNotification('記事の非公開に失敗しました', 'error');
    }
}

// 記事の削除
function deleteContent(id) {
    const modal = document.getElementById('actionModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const modalCancel = document.getElementById('modalCancel');
    const modalConfirm = document.getElementById('modalConfirm');
    
    // モーダルの設定
    modalTitle.textContent = '記事の削除';
    modalContent.innerHTML = `
        <p class="mb-2">この記事を削除してもよろしいですか？</p>
        <p class="text-red-600 text-sm">この操作は取り消せません。</p>
    `;
    
    // ボタンの設定
    modalCancel.textContent = 'キャンセル';
    modalConfirm.textContent = '削除';
    modalConfirm.className = 'px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white';
    
    // 削除処理
    modalConfirm.onclick = async () => {
        try {
            const response = await fetch(`${API_CMS_URL}/content/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            modal.classList.add('hidden');
            showNotification('記事を削除しました');
            fetchContent();
        } catch (error) {
            console.error('記事の削除に失敗しました:', error);
            showNotification('記事の削除に失敗しました', 'error');
        }
    };
    
    // キャンセル処理
    modalCancel.onclick = () => {
        modal.classList.add('hidden');
    };
    
    // モーダルの表示
    modal.classList.remove('hidden');
}

// カテゴリーの取得
async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/categories`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const categories = data.categories || [];
        
        // カテゴリーセレクトボックスに反映
        const categorySelect = document.getElementById('categoryFilter');
        if (categorySelect && categories.length > 0) {
            let optionsHTML = '<option value="">すべてのカテゴリー</option>';
            
            categories.forEach(category => {
                optionsHTML += `<option value="${category.id}">${category.name}</option>`;
            });
            
            categorySelect.innerHTML = optionsHTML;
        }
    } catch (error) {
        console.error('カテゴリーの取得に失敗しました:', error);
    }
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

// ステータスの表示名を取得
function getStatusText(status) {
    switch (status) {
        case 'published': return '公開中';
        case 'draft': return '下書き';
        case 'archived': return 'アーカイブ';
        default: return status;
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