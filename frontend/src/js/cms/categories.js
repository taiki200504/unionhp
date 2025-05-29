// API基本設定
const API_BASE_URL = 'http://localhost:3000';
const API_CATEGORIES_URL = `${API_BASE_URL}/api/categories`;
let authToken = localStorage.getItem('authToken');

// 現在の状態
let currentState = {
    search: '',       // 検索キーワード
    categories: [],   // 全カテゴリーデータ
    selectedId: null  // 編集・削除対象のカテゴリーID
};

// 認証ヘッダーの作成
const getAuthHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };
};

// カテゴリー一覧の取得
async function fetchCategories() {
    try {
        // 読み込み中表示
        document.getElementById('categoryList').innerHTML = `
            <div class="category-card p-4 rounded-lg animate-pulse">
                <div class="bg-gray-700 h-6 w-3/4 rounded mb-2"></div>
                <div class="bg-gray-700 h-4 w-1/2 rounded"></div>
            </div>
            <div class="category-card p-4 rounded-lg animate-pulse">
                <div class="bg-gray-700 h-6 w-3/4 rounded mb-2"></div>
                <div class="bg-gray-700 h-4 w-1/2 rounded"></div>
            </div>
            <div class="category-card p-4 rounded-lg animate-pulse">
                <div class="bg-gray-700 h-6 w-3/4 rounded mb-2"></div>
                <div class="bg-gray-700 h-4 w-1/2 rounded"></div>
            </div>
        `;
        
        document.getElementById('categoryTree').innerHTML = `
            <div class="animate-pulse">
                <div class="bg-gray-700 h-5 w-40 rounded my-2"></div>
                <div class="ml-6 space-y-2">
                    <div class="bg-gray-700 h-5 w-32 rounded"></div>
                    <div class="bg-gray-700 h-5 w-36 rounded"></div>
                </div>
                <div class="bg-gray-700 h-5 w-44 rounded my-2"></div>
            </div>
        `;
        
        // APIリクエスト
        const response = await fetch(API_CATEGORIES_URL, {
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
        currentState.categories = data;
        
        // 検索キーワードによるフィルタリング
        let filteredCategories = data;
        if (currentState.search) {
            const searchLower = currentState.search.toLowerCase();
            filteredCategories = data.filter(category => 
                category.name.toLowerCase().includes(searchLower) || 
                (category.description && category.description.toLowerCase().includes(searchLower))
            );
        }
        
        renderCategoryList(filteredCategories);
        renderCategoryTree(data);
        updateParentCategoryOptions();
        
        // 合計カテゴリー数の表示
        document.getElementById('totalCategories').textContent = data.length;
        
    } catch (error) {
        console.error('カテゴリーの取得に失敗しました:', error);
        showErrorState();
    }
}

// エラー表示
function showErrorState() {
    document.getElementById('categoryList').innerHTML = `
        <div class="col-span-full py-8 text-center text-red-400">
            カテゴリーの取得に失敗しました。後でもう一度お試しください。
        </div>
    `;
    
    document.getElementById('categoryTree').innerHTML = `
        <div class="py-4 text-center text-red-400">
            カテゴリー階層の取得に失敗しました。
        </div>
    `;
}

// カテゴリーリストの描画
function renderCategoryList(categories) {
    const categoryList = document.getElementById('categoryList');
    
    if (categories.length === 0) {
        categoryList.innerHTML = `
            <div class="col-span-full py-8 text-center text-gray-400">
                カテゴリーがありません
            </div>
        `;
        return;
    }
    
    categoryList.innerHTML = categories.map(category => {
        // 親カテゴリー名の取得
        let parentName = '';
        if (category.parent) {
            const parentCategory = currentState.categories.find(c => c._id === category.parent);
            parentName = parentCategory ? parentCategory.name : '';
        }
        
        // 関連記事数（APIが対応している場合）
        const articleCount = category.articleCount || 0;
        
        return `
            <div class="category-card p-4 rounded-lg hover:bg-gray-800" data-id="${category._id}">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-lg">${category.name}</h3>
                    <div class="flex gap-2">
                        <button class="edit-category-btn p-1 bg-blue-600 rounded hover:bg-blue-700" title="編集" data-id="${category._id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button class="delete-category-btn p-1 bg-red-600 rounded hover:bg-red-700" title="削除" data-id="${category._id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="text-sm">
                    <div class="text-gray-400 mb-1">スラッグ: ${category.slug}</div>
                    ${category.description ? `<div class="mb-2">${category.description}</div>` : ''}
                    <div class="flex flex-wrap gap-4">
                        ${parentName ? `<div class="text-blue-400">親: ${parentName}</div>` : ''}
                        <div class="text-gray-400">記事数: ${articleCount}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // 編集ボタンのイベント設定
    document.querySelectorAll('.edit-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const categoryId = btn.getAttribute('data-id');
            openEditCategoryModal(categoryId);
        });
    });
    
    // 削除ボタンのイベント設定
    document.querySelectorAll('.delete-category-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const categoryId = btn.getAttribute('data-id');
            openDeleteCategoryModal(categoryId);
        });
    });
}

// カテゴリーツリーの描画
function renderCategoryTree(categories) {
    const categoryTree = document.getElementById('categoryTree');
    
    // 親カテゴリー (parentがnullまたは未設定)
    const parentCategories = categories.filter(c => !c.parent);
    
    if (categories.length === 0) {
        categoryTree.innerHTML = `
            <div class="py-4 text-center text-gray-400">
                カテゴリーがありません
            </div>
        `;
        return;
    }
    
    categoryTree.innerHTML = parentCategories.map(parent => {
        // 子カテゴリーを取得
        const children = categories.filter(c => c.parent === parent._id);
        
        return `
            <div class="mb-3">
                <div class="flex items-center py-1">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    <span class="font-semibold">${parent.name}</span>
                    <span class="ml-2 text-xs text-gray-400">(${parent.slug})</span>
                </div>
                ${children.length > 0 ? `
                    <div class="ml-6 pl-2 border-l border-gray-700">
                        ${children.map(child => `
                            <div class="flex items-center py-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                </svg>
                                <span>${child.name}</span>
                                <span class="ml-2 text-xs text-gray-400">(${child.slug})</span>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
}

// 親カテゴリー選択肢の更新
function updateParentCategoryOptions() {
    const parentSelect = document.getElementById('parentCategory');
    const currentId = document.getElementById('categoryId').value;
    
    // 親カテゴリー候補（自分自身を除外し、子カテゴリーにすでになっているものも除外）
    const possibleParents = currentState.categories.filter(c => {
        // 自分自身は親にできない
        if (c._id === currentId) return false;
        
        // 自分の子カテゴリーは親にできない（循環参照防止）
        if (currentId) {
            const isMyChild = isChildCategory(c._id, currentId);
            if (isMyChild) return false;
        }
        
        return true;
    });
    
    parentSelect.innerHTML = `<option value="">親カテゴリーなし</option>`;
    
    possibleParents.forEach(category => {
        parentSelect.innerHTML += `<option value="${category._id}">${category.name}</option>`;
    });
}

// 子カテゴリーかどうかを再帰的に判定
function isChildCategory(categoryId, potentialParentId) {
    const category = currentState.categories.find(c => c._id === categoryId);
    if (!category) return false;
    
    // 直接の親が対象の場合
    if (category.parent === potentialParentId) return true;
    
    // 親の親をチェック（再帰）
    if (category.parent) {
        return isChildCategory(category.parent, potentialParentId);
    }
    
    return false;
}

// スラッグの自動生成
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

// カテゴリー作成モーダルを開く
function openCreateCategoryModal() {
    const modal = document.getElementById('categoryModal');
    const modalTitle = document.getElementById('modalTitle');
    const categoryForm = document.getElementById('categoryForm');
    const categoryId = document.getElementById('categoryId');
    
    // モーダルの設定
    modalTitle.textContent = 'カテゴリーの作成';
    categoryId.value = '';
    categoryForm.reset();
    
    // 親カテゴリーの選択肢を更新
    updateParentCategoryOptions();
    
    // モーダルを表示
    modal.classList.remove('hidden');
    
    // フォーカスを最初の入力欄に
    document.getElementById('categoryName').focus();
}

// カテゴリー編集モーダルを開く
function openEditCategoryModal(categoryId) {
    const category = currentState.categories.find(c => c._id === categoryId);
    if (!category) return;
    
    const modal = document.getElementById('categoryModal');
    const modalTitle = document.getElementById('modalTitle');
    const categoryForm = document.getElementById('categoryForm');
    const categoryIdField = document.getElementById('categoryId');
    const categoryName = document.getElementById('categoryName');
    const categorySlug = document.getElementById('categorySlug');
    const categoryDescription = document.getElementById('categoryDescription');
    const parentCategory = document.getElementById('parentCategory');
    
    // モーダルの設定
    modalTitle.textContent = 'カテゴリーの編集';
    categoryIdField.value = category._id;
    categoryName.value = category.name;
    categorySlug.value = category.slug;
    categoryDescription.value = category.description || '';
    
    // 親カテゴリーの選択肢を更新
    updateParentCategoryOptions();
    
    // 親カテゴリーの選択
    parentCategory.value = category.parent || '';
    
    // モーダルを表示
    modal.classList.remove('hidden');
    
    // フォーカスを最初の入力欄に
    categoryName.focus();
}

// カテゴリー削除モーダルを開く
function openDeleteCategoryModal(categoryId) {
    const category = currentState.categories.find(c => c._id === categoryId);
    if (!category) return;
    
    currentState.selectedId = categoryId;
    
    const modal = document.getElementById('deleteModal');
    const modalContent = document.getElementById('deleteModalContent');
    
    // 子カテゴリーがあるかチェック
    const childCategories = currentState.categories.filter(c => c.parent === categoryId);
    
    // モーダルコンテンツの設定
    if (childCategories.length > 0) {
        modalContent.innerHTML = `
            <p>カテゴリー「${category.name}」を削除しますか？この操作は元に戻せません。</p>
            <p class="text-red-400 mt-2">警告: このカテゴリーには ${childCategories.length} 個の子カテゴリーがあります。</p>
            <p class="text-red-400">削除すると、子カテゴリーは親なしになります。</p>
        `;
    } else {
        modalContent.innerHTML = `
            <p>カテゴリー「${category.name}」を削除しますか？この操作は元に戻せません。</p>
            <p class="text-red-400 mt-2">注意: このカテゴリーに属する記事は、カテゴリーなしになります。</p>
        `;
    }
    
    // モーダルを表示
    modal.classList.remove('hidden');
}

// カテゴリーの保存（作成・更新）
async function saveCategory(event) {
    event.preventDefault();
    
    const categoryId = document.getElementById('categoryId').value;
    const name = document.getElementById('categoryName').value;
    const slug = document.getElementById('categorySlug').value;
    const description = document.getElementById('categoryDescription').value;
    const parent = document.getElementById('parentCategory').value || null;
    
    const categoryData = {
        name,
        slug,
        description,
        parent
    };
    
    try {
        let response;
        
        if (categoryId) {
            // 更新
            response = await fetch(`${API_CATEGORIES_URL}/${categoryId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(categoryData)
            });
        } else {
            // 新規作成
            response = await fetch(API_CATEGORIES_URL, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(categoryData)
            });
        }
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        // モーダルを閉じる
        document.getElementById('categoryModal').classList.add('hidden');
        
        // 成功通知
        showNotification(categoryId ? 'カテゴリーを更新しました' : 'カテゴリーを作成しました');
        
        // カテゴリー一覧の再読み込み
        fetchCategories();
        
    } catch (error) {
        console.error('カテゴリーの保存に失敗しました:', error);
        showNotification('カテゴリーの保存に失敗しました', 'error');
    }
}

// カテゴリーの削除
async function deleteCategory() {
    const categoryId = currentState.selectedId;
    if (!categoryId) return;
    
    try {
        const response = await fetch(`${API_CATEGORIES_URL}/${categoryId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        // モーダルを閉じる
        document.getElementById('deleteModal').classList.add('hidden');
        
        // 成功通知
        showNotification('カテゴリーを削除しました');
        
        // 選択IDのクリア
        currentState.selectedId = null;
        
        // カテゴリー一覧の再読み込み
        fetchCategories();
        
    } catch (error) {
        console.error('カテゴリーの削除に失敗しました:', error);
        showNotification('カテゴリーの削除に失敗しました', 'error');
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
        // デモ用の仮表示（開発時のみ使用）
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
    // カテゴリー名の入力時にスラッグを自動生成
    const categoryName = document.getElementById('categoryName');
    const categorySlug = document.getElementById('categorySlug');
    
    categoryName.addEventListener('input', () => {
        // スラッグが未入力か、ユーザーが手動で変更していない場合のみ自動生成
        if (!categorySlug.value || categorySlug.dataset.autoGenerated === 'true') {
            categorySlug.value = generateSlug(categoryName.value);
            categorySlug.dataset.autoGenerated = 'true';
        }
    });
    
    categorySlug.addEventListener('input', () => {
        // ユーザーが手動で変更した場合は自動生成フラグを解除
        categorySlug.dataset.autoGenerated = 'false';
    });
    
    // 検索処理
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentState.search = searchInput.value.trim();
            fetchCategories();
        }, 500);
    });
    
    // 新規カテゴリー作成ボタン
    document.getElementById('createCategoryBtn').addEventListener('click', openCreateCategoryModal);
    
    // カテゴリーフォームの送信
    document.getElementById('categoryForm').addEventListener('submit', saveCategory);
    
    // モーダルのキャンセルボタン
    document.getElementById('cancelCategoryBtn').addEventListener('click', () => {
        document.getElementById('categoryModal').classList.add('hidden');
    });
    
    // 削除のキャンセルボタン
    document.getElementById('cancelDeleteBtn').addEventListener('click', () => {
        document.getElementById('deleteModal').classList.add('hidden');
        currentState.selectedId = null;
    });
    
    // 削除の確認ボタン
    document.getElementById('confirmDeleteBtn').addEventListener('click', deleteCategory);
    
    // ログアウトボタン
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // 初期化処理
    fetchUserInfo();
    fetchCategories();
}); 