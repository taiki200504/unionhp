document.addEventListener('DOMContentLoaded', function() {
    // DOM要素
    const contentTable = document.getElementById('contentTable');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const dateFilter = document.getElementById('dateFilter');
    const sortOption = document.getElementById('sortOption');
    const tabButtons = document.querySelectorAll('.content-tabs button');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageNumbers = document.getElementById('pageNumbers');
    const currentItemsSpan = document.getElementById('currentItems');
    const totalItemsSpan = document.getElementById('totalItems');
    const actionModal = document.getElementById('actionModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const modalCancel = document.getElementById('modalCancel');
    const modalConfirm = document.getElementById('modalConfirm');
    
    // ユーザー情報表示
    const userInfo = document.getElementById('userInfo');
    userInfo.textContent = 'ログイン中: 管理者';
    
    // 状態管理
    let currentTab = 'all';
    let currentPage = 1;
    let itemsPerPage = 10;
    let totalItems = 0;
    let filteredContent = [];
    let contentData = [];
    
    // 初期データ取得
    fetchContentData();
    fetchCategories();
    
    // タブ切り替え
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentTab = this.getAttribute('data-tab');
            currentPage = 1;
            filterAndDisplayContent();
        });
    });
    
    // 検索機能
    searchInput.addEventListener('input', debounce(function() {
        currentPage = 1;
        filterAndDisplayContent();
    }, 300));
    
    // フィルター変更時
    categoryFilter.addEventListener('change', function() {
        currentPage = 1;
        filterAndDisplayContent();
    });
    
    dateFilter.addEventListener('change', function() {
        currentPage = 1;
        filterAndDisplayContent();
    });
    
    // ソート変更時
    sortOption.addEventListener('change', function() {
        filterAndDisplayContent();
    });
    
    // ページネーション
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            displayContent();
        }
    });
    
    nextPageBtn.addEventListener('click', function() {
        const totalPages = Math.ceil(filteredContent.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayContent();
        }
    });
    
    // モーダル操作
    modalCancel.addEventListener('click', function() {
        actionModal.classList.add('hidden');
    });
    
    modalConfirm.addEventListener('click', function() {
        const action = modalConfirm.getAttribute('data-action');
        const contentId = modalConfirm.getAttribute('data-id');
        
        if (action === 'delete') {
            deleteContent(contentId);
        } else if (action === 'publish') {
            updateContentStatus(contentId, 'published');
        } else if (action === 'draft') {
            updateContentStatus(contentId, 'draft');
        } else if (action === 'archive') {
            updateContentStatus(contentId, 'archived');
        } else if (action === 'feature') {
            updateContentFeatured(contentId, true);
        } else if (action === 'unfeature') {
            updateContentFeatured(contentId, false);
        }
        
        actionModal.classList.add('hidden');
    });
    
    // ログアウト
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('ログアウトしますか？')) {
            window.location.href = 'login.html';
        }
    });
    
    // コンテンツデータの取得
    async function fetchContentData() {
        try {
            // 本番環境ではAPIからデータを取得
            // const response = await fetch('/api/cms/content');
            // contentData = await response.json();
            
            // 開発用のモックデータ
            contentData = generateMockData();
            filterAndDisplayContent();
        } catch (error) {
            console.error('コンテンツデータの取得に失敗しました:', error);
            contentTable.innerHTML = `
                <tr>
                    <td colspan="6" class="py-4 text-center text-red-500">
                        データの取得に失敗しました。再読み込みしてください。
                    </td>
                </tr>
            `;
        }
    }
    
    // カテゴリーの取得
    async function fetchCategories() {
        try {
            // 本番環境ではAPIからデータを取得
            // const response = await fetch('/api/cms/categories');
            // const categories = await response.json();
            
            // 開発用のモックデータ
            const categories = [
                { id: 1, name: 'ニュース' },
                { id: 2, name: 'イベント' },
                { id: 3, name: '活動報告' },
                { id: 4, name: 'プロジェクト' },
                { id: 5, name: 'コラム' }
            ];
            
            // カテゴリフィルターにオプションを追加
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categoryFilter.appendChild(option);
            });
        } catch (error) {
            console.error('カテゴリーの取得に失敗しました:', error);
        }
    }
    
    // コンテンツのフィルタリングと表示
    function filterAndDisplayContent() {
        // フィルタリング
        filteredContent = contentData.filter(item => {
            // タブによるフィルタリング
            if (currentTab === 'published' && item.status !== 'published') return false;
            if (currentTab === 'draft' && item.status !== 'draft') return false;
            if (currentTab === 'archived' && item.status !== 'archived') return false;
            if (currentTab === 'featured' && !item.featured) return false;
            
            // 検索フィルタリング
            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm && !item.title.toLowerCase().includes(searchTerm)) return false;
            
            // カテゴリーフィルタリング
            if (categoryFilter.value && item.category_id !== parseInt(categoryFilter.value)) return false;
            
            // 日付フィルタリング
            if (dateFilter.value) {
                const itemDate = new Date(item.created_at);
                const today = new Date();
                
                if (dateFilter.value === 'today') {
                    if (itemDate.toDateString() !== today.toDateString()) return false;
                } else if (dateFilter.value === 'week') {
                    const weekAgo = new Date(today);
                    weekAgo.setDate(today.getDate() - 7);
                    if (itemDate < weekAgo) return false;
                } else if (dateFilter.value === 'month') {
                    const monthAgo = new Date(today);
                    monthAgo.setMonth(today.getMonth() - 1);
                    if (itemDate < monthAgo) return false;
                } else if (dateFilter.value === 'year') {
                    const yearAgo = new Date(today);
                    yearAgo.setFullYear(today.getFullYear() - 1);
                    if (itemDate < yearAgo) return false;
                }
            }
            
            return true;
        });
        
        // ソート
        sortFilteredContent();
        
        // 表示
        displayContent();
    }
    
    // コンテンツをソート
    function sortFilteredContent() {
        const sortBy = sortOption.value;
        
        if (sortBy === 'newest') {
            filteredContent.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (sortBy === 'oldest') {
            filteredContent.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (sortBy === 'title') {
            filteredContent.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortBy === 'views') {
            filteredContent.sort((a, b) => b.views - a.views);
        }
    }
    
    // コンテンツを表示
    function displayContent() {
        totalItems = filteredContent.length;
        const start = (currentPage - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, totalItems);
        const pageItems = filteredContent.slice(start, end);
        
        // 表示件数の更新
        currentItemsSpan.textContent = totalItems > 0 ? `${start + 1}-${end}` : '0';
        totalItemsSpan.textContent = totalItems;
        
        // ページネーションの更新
        updatePagination();
        
        // プレビュー・編集URLの取得
        const baseUrl = location.origin;
        
        // テーブルの更新
        if (pageItems.length === 0) {
            contentTable.innerHTML = `
                <tr>
                    <td colspan="6" class="py-4 text-center text-gray-400">
                        表示するコンテンツがありません
                    </td>
                </tr>
            `;
            return;
        }
        
        contentTable.innerHTML = '';
        pageItems.forEach(item => {
            const statusClass = getStatusClass(item.status);
            const statusLabel = getStatusLabel(item.status);
            
            const previewUrl = getPreviewUrl(item);
            
            const row = document.createElement('tr');
            row.className = 'table-row hover:bg-gray-50 border-b border-gray-200';
            row.innerHTML = `
                <td class="py-3 px-4">
                    <div class="max-w-xs truncate font-medium">${item.title}</div>
                </td>
                <td class="py-3 px-4">
                    <div class="flex items-center">
                        <span class="status-dot ${statusClass}"></span>
                        <span>${statusLabel}</span>
                        ${item.featured ? '<span class="ml-2 px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">特集</span>' : ''}
                    </div>
                </td>
                <td class="py-3 px-4">${item.category_name}</td>
                <td class="py-3 px-4">${item.views.toLocaleString()}</td>
                <td class="py-3 px-4">${formatDate(item.created_at)}</td>
                <td class="py-3 px-4">
                    <div class="flex gap-2">
                        <a href="edit-content.html?id=${item.id}" class="text-blue-600 hover:text-blue-800" title="編集">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </a>
                        <a href="${previewUrl}" target="_blank" class="text-gray-600 hover:text-gray-800" title="プレビュー">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </a>
                        <button class="text-gray-600 hover:text-gray-800 status-btn" data-id="${item.id}" data-action="status" title="ステータス変更">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                            </svg>
                        </button>
                        <button class="text-red-600 hover:text-red-800 delete-btn" data-id="${item.id}" title="削除">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </td>
            `;
            contentTable.appendChild(row);
        });
        
        // ボタンイベントの設定
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const contentId = this.getAttribute('data-id');
                showDeleteModal(contentId);
            });
        });
        
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const contentId = this.getAttribute('data-id');
                showStatusModal(contentId);
            });
        });
    }
    
    // ページネーションの更新
    function updatePagination() {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        
        // ページネーションボタンの有効/無効
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
        
        // ページ番号の表示
        pageNumbers.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const button = document.createElement('button');
            button.textContent = i;
            button.className = `px-3 py-1 bg-white rounded-md border ${i === currentPage ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-300 hover:bg-gray-50'} shadow-sm`;
            button.addEventListener('click', function() {
                currentPage = i;
                displayContent();
            });
            pageNumbers.appendChild(button);
        }
    }
    
    // 削除確認モーダルを表示
    function showDeleteModal(contentId) {
        const content = contentData.find(item => item.id === parseInt(contentId));
        if (!content) return;
        
        modalTitle.textContent = 'コンテンツの削除';
        modalContent.innerHTML = `
            <p class="mb-3 text-gray-700">以下のコンテンツを削除してもよろしいですか？この操作は元に戻せません。</p>
            <div class="p-3 bg-gray-50 rounded-md border border-gray-200">
                <p class="font-medium">${content.title}</p>
            </div>
        `;
        
        modalConfirm.textContent = '削除する';
        modalConfirm.className = 'px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white';
        modalConfirm.setAttribute('data-action', 'delete');
        modalConfirm.setAttribute('data-id', contentId);
        
        actionModal.classList.remove('hidden');
    }
    
    // ステータス変更モーダルを表示
    function showStatusModal(contentId) {
        const content = contentData.find(item => item.id === parseInt(contentId));
        if (!content) return;
        
        modalTitle.textContent = 'ステータスの変更';
        modalContent.innerHTML = `
            <p class="mb-3 text-gray-700">「${content.title}」のステータスを変更します。</p>
            <div class="grid grid-cols-2 gap-2">
                <button class="status-option p-3 rounded-md border ${content.status === 'published' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'}" data-status="published">
                    <span class="status-dot bg-green-500"></span> 公開
                </button>
                <button class="status-option p-3 rounded-md border ${content.status === 'draft' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}" data-status="draft">
                    <span class="status-dot bg-blue-500"></span> 下書き
                </button>
                <button class="status-option p-3 rounded-md border ${content.status === 'archived' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 hover:bg-gray-50'}" data-status="archived">
                    <span class="status-dot bg-gray-500"></span> アーカイブ
                </button>
                <button class="feature-option p-3 rounded-md border ${content.featured ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:bg-gray-50'}" data-featured="${!content.featured}">
                    <span class="flex items-center">
                        <span class="status-dot ${content.featured ? 'bg-purple-500' : 'bg-gray-400'}"></span>
                        ${content.featured ? '特集から削除' : '特集に追加'}
                    </span>
                </button>
            </div>
        `;
        
        modalConfirm.textContent = '変更を保存';
        modalConfirm.className = 'px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white';
        modalConfirm.setAttribute('data-action', content.status);
        modalConfirm.setAttribute('data-id', contentId);
        
        // ステータスオプションのイベント
        document.querySelectorAll('.status-option').forEach(option => {
            option.addEventListener('click', function() {
                document.querySelectorAll('.status-option').forEach(opt => {
                    opt.classList.remove('border-green-500', 'border-blue-500', 'border-gray-500', 'bg-green-50', 'bg-blue-50', 'bg-gray-50');
                    opt.classList.add('border-gray-200');
                });
                
                this.classList.remove('border-gray-200');
                const status = this.getAttribute('data-status');
                
                if (status === 'published') {
                    this.classList.add('border-green-500', 'bg-green-50');
                } else if (status === 'draft') {
                    this.classList.add('border-blue-500', 'bg-blue-50');
                } else if (status === 'archived') {
                    this.classList.add('border-gray-500', 'bg-gray-50');
                }
                
                modalConfirm.setAttribute('data-action', status);
            });
        });
        
        // 特集オプションのイベント
        document.querySelector('.feature-option').addEventListener('click', function() {
            this.classList.toggle('border-gray-200');
            this.classList.toggle('border-purple-500');
            this.classList.toggle('bg-purple-50');
            
            const featured = this.getAttribute('data-featured') === 'true';
            modalConfirm.setAttribute('data-action', featured ? 'feature' : 'unfeature');
        });
        
        actionModal.classList.remove('hidden');
    }
    
    // コンテンツの削除
    async function deleteContent(contentId) {
        try {
            // 本番環境ではAPIを呼び出す
            // await fetch(`/api/cms/content/${contentId}`, { method: 'DELETE' });
            
            // 開発用の処理
            const index = contentData.findIndex(item => item.id === parseInt(contentId));
            if (index !== -1) {
                contentData.splice(index, 1);
                filterAndDisplayContent();
            }
        } catch (error) {
            console.error('コンテンツの削除に失敗しました:', error);
            alert('コンテンツの削除に失敗しました');
        }
    }
    
    // コンテンツのステータス更新
    async function updateContentStatus(contentId, status) {
        try {
            // 本番環境ではAPIを呼び出す
            // await fetch(`/api/cms/content/${contentId}/status`, { 
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ status })
            // });
            
            // 開発用の処理
            const content = contentData.find(item => item.id === parseInt(contentId));
            if (content) {
                content.status = status;
                filterAndDisplayContent();
            }
        } catch (error) {
            console.error('ステータスの更新に失敗しました:', error);
            alert('ステータスの更新に失敗しました');
        }
    }
    
    // コンテンツの特集フラグ更新
    async function updateContentFeatured(contentId, featured) {
        try {
            // 本番環境ではAPIを呼び出す
            // await fetch(`/api/cms/content/${contentId}/featured`, { 
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ featured })
            // });
            
            // 開発用の処理
            const content = contentData.find(item => item.id === parseInt(contentId));
            if (content) {
                content.featured = featured;
                filterAndDisplayContent();
            }
        } catch (error) {
            console.error('特集設定の更新に失敗しました:', error);
            alert('特集設定の更新に失敗しました');
        }
    }
    
    // プレビューURLの取得
    function getPreviewUrl(item) {
        // コンテンツタイプに応じてURLを返す
        // return `/preview/${item.type}/${item.id}?token=${generatePreviewToken(item.id)}`;
        
        // 開発用のURLマッピング
        if (item.type === 'news') {
            return `/news-detail.html?id=${item.id}`;
        } else if (item.type === 'board') {
            return `/board-detail.html?id=${item.id}`;
        } else {
            return `/${item.type}-detail.html?id=${item.id}`;
        }
    }
    
    // プレビュートークンの生成（実際の実装ではもっと安全な方法を使用すべき）
    function generatePreviewToken(contentId) {
        return btoa(`preview_${contentId}_${Date.now()}`);
    }
    
    // 状態に応じたクラスを取得
    function getStatusClass(status) {
        switch (status) {
            case 'published': return 'bg-green-500';
            case 'draft': return 'bg-blue-500';
            case 'archived': return 'bg-gray-500';
            default: return 'bg-gray-400';
        }
    }
    
    // 状態に応じたラベルを取得
    function getStatusLabel(status) {
        switch (status) {
            case 'published': return '公開中';
            case 'draft': return '下書き';
            case 'archived': return 'アーカイブ';
            default: return '不明';
        }
    }
    
    // 日付フォーマット
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }
    
    // デバウンス関数
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }
    
    // 開発用のモックデータ生成
    function generateMockData() {
        const types = ['news', 'board', 'event', 'project'];
        const statuses = ['published', 'draft', 'archived'];
        const categories = [
            { id: 1, name: 'ニュース' },
            { id: 2, name: 'イベント' },
            { id: 3, name: '活動報告' },
            { id: 4, name: 'プロジェクト' },
            { id: 5, name: 'コラム' }
        ];
        
        const data = [];
        
        for (let i = 1; i <= 35; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const category = categories[Math.floor(Math.random() * categories.length)];
            const featured = Math.random() < 0.2; // 20%の確率で特集
            
            const createdDate = new Date();
            createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 180)); // 過去180日以内
            
            data.push({
                id: i,
                title: `${category.name}コンテンツ ${i}: ${type === 'news' ? 'ニュース記事' : type === 'board' ? '掲示板投稿' : type === 'event' ? 'イベント情報' : 'プロジェクト報告'}`,
                type: type,
                status: status,
                category_id: category.id,
                category_name: category.name,
                views: Math.floor(Math.random() * 10000),
                created_at: createdDate.toISOString(),
                updated_at: new Date().toISOString(),
                featured: featured
            });
        }
        
        return data;
    }
}); 