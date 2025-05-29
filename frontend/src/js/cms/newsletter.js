// API基本設定
const API_BASE_URL = 'http://localhost:3000';
const API_NEWSLETTER_URL = `${API_BASE_URL}/api/newsletter`;
let authToken = localStorage.getItem('authToken');

// 現在の状態
let currentState = {
    tab: 'subscribers',    // subscribers, history, templates
    search: '',            // 検索キーワード
    statusFilter: 'all',   // all, active, pending, unsubscribed
    dateFilter: 'all',     // all, today, week, month, year
    page: 1,               // 現在のページ
    limit: 10,             // 1ページあたりの件数
    selectedId: null       // 選択中の購読者ID
};

// 認証ヘッダーの作成
const getAuthHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };
};

// 購読者データの取得
async function fetchSubscribers() {
    try {
        // 読み込み中表示
        document.getElementById('subscribersTable').innerHTML = `
            <tr>
                <td colspan="5" class="py-4 text-center text-gray-400">読み込み中...</td>
            </tr>
        `;
        
        // クエリパラメータの構築
        const params = new URLSearchParams();
        params.append('page', currentState.page);
        params.append('limit', currentState.limit);
        
        if (currentState.search) {
            params.append('search', currentState.search);
        }
        
        if (currentState.statusFilter !== 'all') {
            params.append('status', currentState.statusFilter);
        }
        
        if (currentState.dateFilter !== 'all') {
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
        const response = await fetch(`${API_NEWSLETTER_URL}/subscribers?${params.toString()}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        renderSubscribersTable(data);
        renderPagination(data);
        
    } catch (error) {
        console.error('購読者データの取得に失敗しました:', error);
        document.getElementById('subscribersTable').innerHTML = `
            <tr>
                <td colspan="5" class="py-4 text-center text-red-400">データの取得に失敗しました。後でもう一度お試しください。</td>
            </tr>
        `;
    }
}

// 配信履歴の取得
async function fetchHistory() {
    try {
        document.getElementById('historyTable').innerHTML = `
            <tr>
                <td colspan="6" class="py-4 text-center text-gray-400">読み込み中...</td>
            </tr>
        `;
        
        const response = await fetch(`${API_NEWSLETTER_URL}/history`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        renderHistoryTable(data);
        
    } catch (error) {
        console.error('配信履歴の取得に失敗しました:', error);
        document.getElementById('historyTable').innerHTML = `
            <tr>
                <td colspan="6" class="py-4 text-center text-red-400">データの取得に失敗しました。</td>
            </tr>
        `;
    }
}

// テンプレートの取得
async function fetchTemplates() {
    try {
        document.getElementById('templatesGrid').innerHTML = `
            <div class="bg-[#23232a] p-4 rounded-lg animate-pulse">
                <div class="h-6 bg-gray-700 rounded w-1/2 mb-2"></div>
                <div class="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div class="bg-gray-800 h-32 rounded mb-4"></div>
                <div class="flex justify-end">
                    <div class="h-8 bg-gray-700 rounded w-16"></div>
                </div>
            </div>
        `;
        
        const response = await fetch(`${API_NEWSLETTER_URL}/templates`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        renderTemplatesGrid(data);
        
    } catch (error) {
        console.error('テンプレートの取得に失敗しました:', error);
        document.getElementById('templatesGrid').innerHTML = `
            <div class="col-span-full py-8 text-center text-red-400">
                テンプレートの取得に失敗しました。
            </div>
        `;
    }
}

// 購読者テーブルの描画
function renderSubscribersTable(data) {
    const subscribersTable = document.getElementById('subscribersTable');
    const subscribers = data.subscribers || [];
    
    if (subscribers.length === 0) {
        subscribersTable.innerHTML = `
            <tr>
                <td colspan="5" class="py-4 text-center text-gray-400">購読者がいません</td>
            </tr>
        `;
        return;
    }
    
    subscribersTable.innerHTML = subscribers.map(subscriber => {
        const statusClass = getStatusClass(subscriber.status);
        const statusText = getStatusText(subscriber.status);
        const openRate = subscriber.openRate !== undefined ? `${subscriber.openRate}%` : '-';
        
        return `
            <tr class="border-b border-gray-700 hover:bg-gray-800">
                <td class="py-3 px-4">${subscriber.email}</td>
                <td class="py-3 px-4">
                    <span class="px-2 py-1 rounded text-xs ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="py-3 px-4">${formatDate(subscriber.subscribeDate)}</td>
                <td class="py-3 px-4">${openRate}</td>
                <td class="py-3 px-4">
                    <div class="flex gap-2">
                        <button class="view-subscriber-btn p-1 bg-blue-600 rounded hover:bg-blue-700" title="詳細" data-id="${subscriber._id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                        <button class="delete-subscriber-btn p-1 bg-red-600 rounded hover:bg-red-700" title="削除" data-id="${subscriber._id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // イベントリスナーの設定
    document.querySelectorAll('.view-subscriber-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const subscriberId = btn.getAttribute('data-id');
            viewSubscriberDetails(subscriberId);
        });
    });
    
    document.querySelectorAll('.delete-subscriber-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const subscriberId = btn.getAttribute('data-id');
            deleteSubscriber(subscriberId);
        });
    });
    
    // 表示中のアイテム数を更新
    document.getElementById('currentItems').textContent = subscribers.length;
    document.getElementById('totalItems').textContent = data.total || 0;
}

// 配信履歴テーブルの描画
function renderHistoryTable(data) {
    const historyTable = document.getElementById('historyTable');
    const history = data.history || [];
    
    if (history.length === 0) {
        historyTable.innerHTML = `
            <tr>
                <td colspan="6" class="py-4 text-center text-gray-400">配信履歴がありません</td>
            </tr>
        `;
        return;
    }
    
    historyTable.innerHTML = history.map(item => {
        return `
            <tr class="border-b border-gray-700 hover:bg-gray-800">
                <td class="py-3 px-4">${item.subject}</td>
                <td class="py-3 px-4">${formatDate(item.sentDate)}</td>
                <td class="py-3 px-4">${item.sentCount}</td>
                <td class="py-3 px-4">${item.openRate}%</td>
                <td class="py-3 px-4">${item.clickRate}%</td>
                <td class="py-3 px-4">
                    <div class="flex gap-2">
                        <button class="view-history-btn p-1 bg-blue-600 rounded hover:bg-blue-700" title="詳細" data-id="${item._id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// テンプレートグリッドの描画
function renderTemplatesGrid(data) {
    const templatesGrid = document.getElementById('templatesGrid');
    const templates = data.templates || [];
    
    // デフォルトテンプレート
    let gridHTML = `
        <div class="bg-[#23232a] p-4 rounded-lg">
            <h3 class="font-bold mb-2">基本テンプレート</h3>
            <p class="text-gray-400 text-sm mb-4">シンプルな1カラムレイアウト</p>
            <div class="bg-gray-800 h-32 rounded mb-4 flex items-center justify-center">
                <span class="text-gray-500 text-sm">プレビュー</span>
            </div>
            <div class="flex justify-end">
                <button class="use-template-btn px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded" data-id="basic">使用</button>
            </div>
        </div>
    `;
    
    // カスタムテンプレート
    if (templates.length > 0) {
        gridHTML += templates.map(template => {
            return `
                <div class="bg-[#23232a] p-4 rounded-lg">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold">${template.name}</h3>
                        <button class="delete-template-btn p-1 bg-red-600 rounded hover:bg-red-700" title="削除" data-id="${template._id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p class="text-gray-400 text-sm mb-4">${template.description || '説明なし'}</p>
                    <div class="bg-gray-800 h-32 rounded mb-4 flex items-center justify-center">
                        <span class="text-gray-500 text-sm">プレビュー</span>
                    </div>
                    <div class="flex justify-end">
                        <button class="use-template-btn px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded" data-id="${template._id}">使用</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    templatesGrid.innerHTML = gridHTML;
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
        btn.className = 'px-3 py-1 rounded border border-gray-700';
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
        btn.className = `px-3 py-1 rounded border ${i === currentPage ? 'bg-blue-600 border-blue-700' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`;
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
        btn.className = 'px-3 py-1 rounded border border-gray-700';
        btn.textContent = totalPages;
        btn.onclick = () => changePage(totalPages);
        pageNumbers.appendChild(btn);
    }
    
    // ボタンイベントの設定
    prevButton.onclick = () => changePage(currentPage - 1);
    nextButton.onclick = () => changePage(currentPage + 1);
}

// ページ変更
function changePage(page) {
    currentState.page = page;
    fetchSubscribers();
}

// ステータスに応じた色を取得
function getStatusClass(status) {
    switch (status) {
        case 'active': return 'bg-green-900 text-green-300';
        case 'pending': return 'bg-yellow-900 text-yellow-300';
        case 'unsubscribed': return 'bg-red-900 text-red-300';
        default: return 'bg-gray-900 text-gray-300';
    }
}

// ステータステキストの取得
function getStatusText(status) {
    switch (status) {
        case 'active': return 'アクティブ';
        case 'pending': return '確認待ち';
        case 'unsubscribed': return '解除';
        default: return status;
    }
}

// 日付のフォーマット
function formatDate(dateString) {
    if (!dateString) return '不明';
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// 購読者の詳細表示
async function viewSubscriberDetails(subscriberId) {
    try {
        const response = await fetch(`${API_NEWSLETTER_URL}/subscribers/${subscriberId}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const subscriber = await response.json();
        
        // 詳細モーダルに情報を表示
        const detailContent = document.getElementById('subscriberDetailContent');
        detailContent.innerHTML = `
            <div>
                <h4 class="text-gray-400 mb-1">メールアドレス</h4>
                <p class="text-lg">${subscriber.email}</p>
            </div>
            <div>
                <h4 class="text-gray-400 mb-1">ステータス</h4>
                <p><span class="px-2 py-1 rounded text-xs ${getStatusClass(subscriber.status)}">${getStatusText(subscriber.status)}</span></p>
            </div>
            <div>
                <h4 class="text-gray-400 mb-1">購読日</h4>
                <p>${formatDate(subscriber.subscribeDate)}</p>
            </div>
            <div>
                <h4 class="text-gray-400 mb-1">開封数 / 送信数</h4>
                <p>${subscriber.openCount || 0} / ${subscriber.sentCount || 0}</p>
            </div>
            <div>
                <h4 class="text-gray-400 mb-1">クリック数</h4>
                <p>${subscriber.clickCount || 0}</p>
            </div>
            <div class="pt-4 flex justify-between">
                <button id="changeStatusBtn" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded" data-id="${subscriber._id}" data-status="${subscriber.status}">
                    ${subscriber.status === 'active' ? '無効化' : 'アクティブ化'}
                </button>
                <button id="deleteSubscriberBtn" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded" data-id="${subscriber._id}">
                    削除
                </button>
            </div>
        `;
        
        // ステータス変更ボタンのイベント設定
        document.getElementById('changeStatusBtn').addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const currentStatus = e.target.getAttribute('data-status');
            const newStatus = currentStatus === 'active' ? 'unsubscribed' : 'active';
            changeSubscriberStatus(id, newStatus);
        });
        
        // 削除ボタンのイベント設定
        document.getElementById('deleteSubscriberBtn').addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            document.getElementById('subscriberDetailModal').classList.add('hidden');
            deleteSubscriber(id);
        });
        
        // モーダルを表示
        document.getElementById('subscriberDetailModal').classList.remove('hidden');
        
    } catch (error) {
        console.error('購読者詳細の取得に失敗しました:', error);
        showNotification('購読者情報の取得に失敗しました', 'error');
    }
}

// 購読者のステータス変更
async function changeSubscriberStatus(subscriberId, newStatus) {
    try {
        const response = await fetch(`${API_NEWSLETTER_URL}/subscribers/${subscriberId}/status`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        // モーダルを閉じる
        document.getElementById('subscriberDetailModal').classList.add('hidden');
        
        // 成功通知
        showNotification(`購読者のステータスを ${getStatusText(newStatus)} に変更しました`);
        
        // 購読者一覧の再読み込み
        fetchSubscribers();
        
    } catch (error) {
        console.error('ステータス変更に失敗しました:', error);
        showNotification('ステータス変更に失敗しました', 'error');
    }
}

// 購読者の削除
async function deleteSubscriber(subscriberId) {
    if (!confirm('この購読者を削除しますか？この操作は元に戻せません。')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_NEWSLETTER_URL}/subscribers/${subscriberId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        // 成功通知
        showNotification('購読者を削除しました');
        
        // 購読者一覧の再読み込み
        fetchSubscribers();
        
    } catch (error) {
        console.error('購読者の削除に失敗しました:', error);
        showNotification('購読者の削除に失敗しました', 'error');
    }
}

// ユーザー情報の取得と表示
async function fetchUserInfo() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = 'login.html';
                return;
            }
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        document.getElementById('userInfo').textContent = `ログイン中: ${data.name} (${getRoleText(data.role)})`;
    } catch (error) {
        console.error('ユーザー情報の取得に失敗しました:', error);
        // デモ用の仮表示
        document.getElementById('userInfo').textContent = 'ログイン中: 管理者（開発モード）';
    }
}

// ロール名の変換
function getRoleText(role) {
    switch (role) {
        case 'admin': return '管理者';
        case 'editor': return '編集者';
        case 'user': return '一般ユーザー';
        default: return role;
    }
}

// ログアウト処理
async function logout() {
    try {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    } catch (error) {
        console.error('ログアウトに失敗しました:', error);
        localStorage.removeItem('authToken');
        window.location.href = 'login.html';
    }
}

// 通知の表示
function showNotification(message, type = 'success') {
    const notificationDiv = document.createElement('div');
    notificationDiv.className = `fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`;
    notificationDiv.textContent = message;
    document.body.appendChild(notificationDiv);
    
    setTimeout(() => {
        notificationDiv.remove();
    }, 3000);
}

// イベントリスナーの設定
document.addEventListener('DOMContentLoaded', () => {
    // タブ切り替え
    const tabButtons = document.querySelectorAll('.newsletter-tabs button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.getAttribute('data-tab');
            
            // タブの切り替え
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // コンテンツの切り替え
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(`${tab}Content`).classList.remove('hidden');
            
            // 状態の更新
            currentState.tab = tab;
            
            // タブに応じたデータ取得
            if (tab === 'subscribers') {
                fetchSubscribers();
            } else if (tab === 'history') {
                fetchHistory();
            } else if (tab === 'templates') {
                fetchTemplates();
            }
        });
    });
    
    // 検索処理
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentState.search = searchInput.value.trim();
            currentState.page = 1;
            fetchSubscribers();
        }, 500);
    });
    
    // ステータスフィルター
    document.getElementById('statusFilter').addEventListener('change', (e) => {
        currentState.statusFilter = e.target.value;
        currentState.page = 1;
        fetchSubscribers();
    });
    
    // 日付フィルター
    document.getElementById('dateFilter').addEventListener('change', (e) => {
        currentState.dateFilter = e.target.value;
        currentState.page = 1;
        fetchSubscribers();
    });
    
    // 新規配信ボタン
    document.getElementById('createNewsletterBtn').addEventListener('click', () => {
        document.getElementById('newsletterModal').classList.remove('hidden');
    });
    
    // インポートボタン
    document.getElementById('importSubscribersBtn').addEventListener('click', () => {
        document.getElementById('importModal').classList.remove('hidden');
    });
    
    // エクスポートボタン
    document.getElementById('exportSubscribersBtn').addEventListener('click', exportSubscribers);
    
    // ファイル選択ボタン（インポート）
    document.getElementById('browseCsvBtn').addEventListener('click', () => {
        document.getElementById('csvFileInput').click();
    });
    
    // インポートキャンセル
    document.getElementById('cancelImportBtn').addEventListener('click', () => {
        document.getElementById('importModal').classList.add('hidden');
    });
    
    // 後で配信するチェックボックス
    document.getElementById('scheduleLater').addEventListener('change', (e) => {
        const scheduleOptions = document.getElementById('scheduleOptions');
        if (e.target.checked) {
            scheduleOptions.classList.remove('hidden');
        } else {
            scheduleOptions.classList.add('hidden');
        }
    });
    
    // 配信キャンセル
    document.getElementById('cancelNewsletterBtn').addEventListener('click', () => {
        document.getElementById('newsletterModal').classList.add('hidden');
    });
    
    // 購読者詳細モーダルを閉じる
    document.getElementById('closeSubscriberDetailBtn').addEventListener('click', () => {
        document.getElementById('subscriberDetailModal').classList.add('hidden');
    });
    
    // ログアウトボタン
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // 初期化処理
    fetchUserInfo();
    fetchSubscribers(); // 最初のタブのデータを取得
});

// エクスポート処理
function exportSubscribers() {
    window.location.href = `${API_NEWSLETTER_URL}/subscribers/export?token=${authToken}`;
} 