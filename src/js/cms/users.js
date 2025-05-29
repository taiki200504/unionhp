document.addEventListener('DOMContentLoaded', function() {
    // DOM要素
    const userTable = document.getElementById('userTable');
    const searchInput = document.getElementById('searchInput');
    const roleFilter = document.getElementById('roleFilter');
    const statusFilter = document.getElementById('statusFilter');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageNumbers = document.getElementById('pageNumbers');
    const currentItemsSpan = document.getElementById('currentItems');
    const totalItemsSpan = document.getElementById('totalItems');
    const userModal = document.getElementById('userModal');
    const modalTitle = document.getElementById('modalTitle');
    const userForm = document.getElementById('userForm');
    const addUserBtn = document.getElementById('addUserBtn');
    const cancelUserBtn = document.getElementById('cancelUserBtn');
    const saveUserBtn = document.getElementById('saveUserBtn');
    const deleteModal = document.getElementById('deleteModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    // ユーザー情報表示
    const userInfoElem = document.getElementById('userInfo');
    userInfoElem.textContent = 'ログイン中: 管理者';
    
    // 状態管理
    let currentPage = 1;
    let itemsPerPage = 10;
    let totalItems = 0;
    let filteredUsers = [];
    let userData = [];
    let currentUserId = null;
    
    // 初期データ取得
    fetchUsers();
    
    // 検索機能
    searchInput.addEventListener('input', debounce(function() {
        currentPage = 1;
        filterAndDisplayUsers();
    }, 300));
    
    // フィルター変更時
    roleFilter.addEventListener('change', function() {
        currentPage = 1;
        filterAndDisplayUsers();
    });
    
    statusFilter.addEventListener('change', function() {
        currentPage = 1;
        filterAndDisplayUsers();
    });
    
    // ページネーション
    prevPageBtn.addEventListener('click', function() {
        if (currentPage > 1) {
            currentPage--;
            displayUsers();
        }
    });
    
    nextPageBtn.addEventListener('click', function() {
        const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayUsers();
        }
    });
    
    // ユーザー追加ボタン
    addUserBtn.addEventListener('click', function() {
        openUserModal();
    });
    
    // ユーザーモーダルキャンセル
    cancelUserBtn.addEventListener('click', function() {
        userModal.classList.add('hidden');
    });
    
    // ユーザーフォーム送信
    userForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveUser();
    });
    
    // 削除モーダルのキャンセル
    cancelDeleteBtn.addEventListener('click', function() {
        deleteModal.classList.add('hidden');
    });
    
    // ログアウト
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('ログアウトしますか？')) {
            // APIでログアウト
            fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })
            .then(response => {
                if (response.ok) {
                    window.location.href = '../login.html';
                } else {
                    throw new Error('ログアウトに失敗しました');
                }
            })
            .catch(error => {
                console.error('ログアウトエラー:', error);
                alert('ログアウトに失敗しました: ' + error.message);
                // エラー時もログイン画面に遷移
                window.location.href = '../login.html';
            });
        }
    });
    
    // ユーザーデータの取得
    async function fetchUsers() {
        try {
            // APIからデータを取得
            const response = await fetch('/api/users');
            
            if (!response.ok) {
                throw new Error(`APIエラー: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 開発初期段階ではデータが少ない場合、モックデータで補完
            if (data && data.length > 0) {
                userData = data.map(item => ({
                    id: item._id,
                    username: item.username,
                    email: item.email || `${item.username}@example.com`,
                    role: item.role || 'editor',
                    status: item.status || 'active',
                    lastLogin: item.lastLogin || new Date().toISOString()
                }));
            } else {
                console.warn('APIからデータが取得できないため、モックデータを使用します');
                userData = generateMockUsers();
            }
            
            filterAndDisplayUsers();
        } catch (error) {
            console.error('ユーザーデータの取得に失敗しました:', error);
            userTable.innerHTML = `
                <tr>
                    <td colspan="6" class="py-4 text-center text-red-500">
                        データの取得に失敗しました。再読み込みしてください。
                    </td>
                </tr>
            `;
            // エラー時はモックデータを使用
            userData = generateMockUsers();
            filterAndDisplayUsers();
        }
    }
    
    // ユーザーのフィルタリングと表示
    function filterAndDisplayUsers() {
        // フィルタリング
        filteredUsers = userData.filter(user => {
            // 検索フィルタリング
            const searchTerm = searchInput.value.toLowerCase();
            if (searchTerm && 
                !user.username.toLowerCase().includes(searchTerm) && 
                !user.email.toLowerCase().includes(searchTerm)) {
                return false;
            }
            
            // 役割フィルタリング
            if (roleFilter.value && user.role !== roleFilter.value) {
                return false;
            }
            
            // ステータスフィルタリング
            if (statusFilter.value && user.status !== statusFilter.value) {
                return false;
            }
            
            return true;
        });
        
        // 表示
        displayUsers();
    }
    
    // ユーザーを表示
    function displayUsers() {
        totalItems = filteredUsers.length;
        const start = (currentPage - 1) * itemsPerPage;
        const end = Math.min(start + itemsPerPage, totalItems);
        const pageItems = filteredUsers.slice(start, end);
        
        // 表示件数の更新
        currentItemsSpan.textContent = totalItems > 0 ? `${start + 1}-${end}` : '0';
        totalItemsSpan.textContent = totalItems;
        
        // ページネーションの更新
        updatePagination();
        
        // テーブルの更新
        if (pageItems.length === 0) {
            userTable.innerHTML = `
                <tr>
                    <td colspan="6" class="py-4 text-center text-gray-400">
                        表示するユーザーがありません
                    </td>
                </tr>
            `;
            return;
        }
        
        userTable.innerHTML = '';
        pageItems.forEach(user => {
            const statusClass = getStatusClass(user.status);
            const statusLabel = getStatusLabel(user.status);
            
            const row = document.createElement('tr');
            row.className = 'table-row hover:bg-gray-50 border-b border-gray-200';
            row.innerHTML = `
                <td class="py-3 px-4">
                    <div class="font-medium">${user.username}</div>
                </td>
                <td class="py-3 px-4">
                    <div class="text-gray-600">${user.email}</div>
                </td>
                <td class="py-3 px-4">
                    <div class="capitalize">${getRoleLabel(user.role)}</div>
                </td>
                <td class="py-3 px-4">
                    <span class="badge ${statusClass}">${statusLabel}</span>
                </td>
                <td class="py-3 px-4">
                    <div class="text-gray-600">${formatDate(user.lastLogin)}</div>
                </td>
                <td class="py-3 px-4">
                    <div class="flex gap-2">
                        <button class="text-blue-600 hover:text-blue-800 edit-btn" data-id="${user.id}" title="編集">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button class="text-red-600 hover:text-red-800 delete-btn" data-id="${user.id}" title="削除">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </td>
            `;
            userTable.appendChild(row);
        });
        
        // 編集ボタンのイベント設定
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');
                openUserModal(userId);
            });
        });
        
        // 削除ボタンのイベント設定
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');
                openDeleteModal(userId);
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
                displayUsers();
            });
            pageNumbers.appendChild(button);
        }
    }
    
    // ユーザーモーダルを開く
    function openUserModal(userId = null) {
        currentUserId = userId;
        
        // フォームをクリア
        userForm.reset();
        
        if (userId) {
            // 編集モード
            const user = userData.find(u => u.id === userId);
            if (!user) return;
            
            modalTitle.textContent = 'ユーザーの編集';
            document.getElementById('username').value = user.username;
            document.getElementById('username').disabled = true; // ユーザー名は変更不可
            document.getElementById('email').value = user.email;
            document.getElementById('password').value = '';
            document.getElementById('password').placeholder = '変更する場合のみ入力';
            document.getElementById('password').required = false;
            document.getElementById('role').value = user.role;
            document.getElementById('status').value = user.status;
        } else {
            // 新規作成モード
            modalTitle.textContent = 'ユーザーの追加';
            document.getElementById('username').disabled = false;
            document.getElementById('password').placeholder = 'パスワード';
            document.getElementById('password').required = true;
        }
        
        userModal.classList.remove('hidden');
    }
    
    // 削除確認モーダルを開く
    function openDeleteModal(userId) {
        if (!userId) return;
        
        currentUserId = userId;
        deleteModal.classList.remove('hidden');
        
        // 削除確定ボタンのイベント
        confirmDeleteBtn.onclick = function() {
            deleteUser(userId);
            deleteModal.classList.add('hidden');
        };
    }
    
    // ユーザーの保存
    async function saveUser() {
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        const status = document.getElementById('status').value;
        
        if (!username || !email || (!currentUserId && !password)) {
            alert('必須項目を入力してください');
            return;
        }
        
        try {
            let response;
            const userData = {
                username,
                email,
                role,
                status
            };
            
            // パスワードが入力されている場合のみ追加
            if (password) {
                userData.password = password;
            }
            
            if (currentUserId) {
                // 更新
                response = await fetch(`/api/users/${currentUserId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
            } else {
                // 新規作成
                response = await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
            }
            
            if (!response.ok) {
                throw new Error(`APIエラー: ${response.status}`);
            }
            
            // モーダルを閉じて再読み込み
            userModal.classList.add('hidden');
            fetchUsers();
            
        } catch (error) {
            console.error('ユーザーの保存に失敗しました:', error);
            alert('ユーザーの保存に失敗しました: ' + error.message);
        }
    }
    
    // ユーザーの削除
    async function deleteUser(userId) {
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`APIエラー: ${response.status}`);
            }
            
            // 一覧を更新
            fetchUsers();
            
        } catch (error) {
            console.error('ユーザーの削除に失敗しました:', error);
            alert('ユーザーの削除に失敗しました: ' + error.message);
        }
    }
    
    // 役割に応じたラベルを取得
    function getRoleLabel(role) {
        switch (role) {
            case 'admin': return '管理者';
            case 'editor': return '編集者';
            case 'author': return '投稿者';
            case 'viewer': return '閲覧者';
            default: return role;
        }
    }
    
    // 状態に応じたクラスを取得
    function getStatusClass(status) {
        switch (status) {
            case 'active': return 'badge-success';
            case 'inactive': return 'badge-danger';
            case 'pending': return 'badge-warning';
            default: return '';
        }
    }
    
    // 状態に応じたラベルを取得
    function getStatusLabel(status) {
        switch (status) {
            case 'active': return 'アクティブ';
            case 'inactive': return '非アクティブ';
            case 'pending': return '保留中';
            default: return status;
        }
    }
    
    // 日付フォーマット
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
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
    
    // 開発用のモックユーザー生成
    function generateMockUsers() {
        const roles = ['admin', 'editor', 'author', 'viewer'];
        const statuses = ['active', 'inactive', 'pending'];
        
        const users = [
            {
                id: '1',
                username: 'admin',
                email: 'admin@union.org',
                role: 'admin',
                status: 'active',
                lastLogin: new Date().toISOString()
            }
        ];
        
        // 追加のモックユーザーを生成
        for (let i = 2; i <= 15; i++) {
            const role = roles[Math.floor(Math.random() * roles.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            
            const lastLoginDate = new Date();
            lastLoginDate.setDate(lastLoginDate.getDate() - Math.floor(Math.random() * 30));
            
            users.push({
                id: i.toString(),
                username: `user${i}`,
                email: `user${i}@example.com`,
                role: role,
                status: status,
                lastLogin: lastLoginDate.toISOString()
            });
        }
        
        return users;
    }
}); 