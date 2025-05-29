// --- カテゴリ管理 ---
let categories = [];

// APIのベースURLを設定
const API_BASE_URL = 'http://localhost:3000';

async function fetchCategories() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        categories = await res.json();
        renderCategoriesTable();
        renderCategorySelect();
    } catch (error) {
        console.error('カテゴリの取得に失敗しました:', error);
    }
}

function renderCategoriesTable() {
    const tbody = document.getElementById('categoriesTableBody');
    if (!tbody) return;
    tbody.innerHTML = categories.map(cat => `
        <tr class="table-row">
            <td class="py-2 px-3">${cat.name}</td>
            <td class="py-2 px-3">
                <button onclick="editCategory('${cat._id}')" class="px-2 py-1 bg-primary text-white rounded mr-2">編集</button>
                <button onclick="deleteCategory('${cat._id}')" class="px-2 py-1 bg-red-600 text-white rounded">削除</button>
            </td>
        </tr>
    `).join('');
}

function renderCategorySelect(selected) {
    const select = document.querySelector('select[name="category"]');
    if (!select) return;
    if (categories.length === 0) {
        select.innerHTML = '<option value="">（カテゴリなし）</option>';
        return;
    }
    select.innerHTML = categories.map(cat => `<option value="${cat.name}" ${selected === cat.name ? 'selected' : ''}>${cat.name}</option>`).join('');
}

// 新規カテゴリ追加
function showCategoryModal(editId = null) {
    const name = editId ? categories.find(c => c._id === editId).name : '';
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 flex items-center justify-center bg-black/60 z-50';
    modal.innerHTML = `
        <div class="bg-[#23232a] p-6 rounded-lg w-80">
            <h2 class="text-lg font-bold mb-4">${editId ? 'カテゴリ編集' : '新規カテゴリ追加'}</h2>
            <form id="catForm">
                <input type="text" name="name" value="${name}" required class="w-full rounded bg-gray-800 border border-gray-600 px-3 py-2 mb-4" placeholder="カテゴリ名">
                <div class="flex justify-end gap-2">
                    <button type="button" id="catCancel" class="px-4 py-2 rounded bg-gray-600 hover:bg-gray-500">キャンセル</button>
                    <button type="submit" class="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90">保存</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('catCancel').onclick = () => modal.remove();
    document.getElementById('catForm').onsubmit = async e => {
        e.preventDefault();
        const val = e.target.name.value.trim();
        if (!val) return;
        if (editId) {
            await fetch(`${API_BASE_URL}/api/categories/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: val }) });
        } else {
            await fetch(`${API_BASE_URL}/api/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: val }) });
        }
        modal.remove();
        fetchCategories();
    };
}
window.editCategory = id => showCategoryModal(id);
window.deleteCategory = async id => {
    if (!confirm('このカテゴリを削除しますか？')) return;
    await fetch(`${API_BASE_URL}/api/categories/${id}`, { method: 'DELETE' });
    fetchCategories();
};

// --- UI切り替え ---
document.getElementById('nav-articles').onclick = () => {
    document.getElementById('articlesTableWrapper').classList.remove('hidden');
    document.getElementById('categoriesTableWrapper').classList.add('hidden');
    document.getElementById('collectionTitle').textContent = 'Articles';
};
document.getElementById('nav-categories').onclick = () => {
    document.getElementById('articlesTableWrapper').classList.add('hidden');
    document.getElementById('categoriesTableWrapper').classList.remove('hidden');
    document.getElementById('collectionTitle').textContent = 'Categories';
};
document.getElementById('nav-categories').insertAdjacentHTML('afterend', '<button id="newCategoryBtn" class="w-full text-left py-2 px-3 rounded mt-2 bg-primary text-white">+ 新規カテゴリ</button>');
document.getElementById('newCategoryBtn').onclick = () => showCategoryModal();

// --- 記事フォームのカテゴリをセレクト化 ---
function patchArticleFormCategory(selected) {
    const form = document.getElementById('modalForm');
    if (!form) return;
    let catInput = form.querySelector('input[name="category"]');
    if (catInput) {
        const select = document.createElement('select');
        select.name = 'category';
        select.className = catInput.className;
        select.required = false;
        catInput.replaceWith(select);
    }
    renderCategorySelect(selected);
}

// --- 記事編集時にカテゴリをセット ---
window.showEditArticle = async function(id) {
    // ...記事データ取得処理...
    // 例: const post = await fetch(...)
    // patchArticleFormCategory(post.category);
    // ...フォームに値セット...
}

// --- カテゴリ追加・編集後にセレクト即時反映 ---
async function afterCategoryChange() {
    await fetchCategories();
    patchArticleFormCategory();
}
// カテゴリ追加・編集・削除後はafterCategoryChange()を呼ぶ
// ... 既存のfetchCategories()→afterCategoryChange()に置換 ...

// 認証チェック
async function checkAuth() {
    try {
        // 一時的に認証チェックをバイパス
        document.getElementById('userInfo').textContent = `ログイン中: 管理者（一時ログインモード）`;
        
        // 元の認証チェックコード
        /* 
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
            credentials: 'include'
        });
        
        if (!response.ok) {
            window.location.href = 'login.html';
            return;
        }
        
        const data = await response.json();
        document.getElementById('userInfo').textContent = `ログイン中: ${data.user.username}`;
        */
    } catch (error) {
        // エラーが発生しても、ログインページにリダイレクトしない
        document.getElementById('userInfo').textContent = `ログイン中: 管理者（一時ログインモード）`;
        console.error('認証エラー:', error);
    }
}

// ログアウト
async function logout() {
    try {
        // 一時的にログアウト処理をバイパス
        alert('一時ログインモード中はログアウトできません');
        
        // 元のログアウトコード
        /*
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include'
        });
        window.location.href = 'login.html';
        */
    } catch (error) {
        console.error('ログアウトに失敗しました:', error);
    }
}

// 初期化時に認証チェック
window.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    fetchCategories();
    patchArticleFormCategory();

    // 画像アップロード処理
    const imageInput = document.getElementById('imageInput');
    const imageUrlInput = document.getElementById('imageUrlInput');
    const imagePreview = document.getElementById('imagePreview');

    if (imageInput) {
        imageInput.addEventListener('change', async function() {
            const file = this.files[0];
            if (!file) return;
            // プレビュー表示
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="プレビュー" class="max-h-40 rounded mb-2">`;
            };
            reader.readAsDataURL(file);
            // アップロード
            const formData = new FormData();
            formData.append('image', file);
            try {
                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        // 認証トークンが必要な場合はここに追加
                    }
                });
                if (!res.ok) throw new Error('アップロード失敗');
                const data = await res.json();
                imageUrlInput.value = data.url;
            } catch (err) {
                imagePreview.innerHTML += `<div class='text-red-500 mt-2'>画像アップロードに失敗しました</div>`;
                imageUrlInput.value = '';
            }
        });
    }
}); 