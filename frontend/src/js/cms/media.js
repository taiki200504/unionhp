// API基本設定
const API_BASE_URL = 'http://localhost:3000';
const API_CMS_URL = `${API_BASE_URL}/api/cms`;
let authToken = localStorage.getItem('authToken');

// 現在の状態
let currentState = {
    view: 'grid',      // grid, list
    filter: 'all',     // all, image, document, video, other
    directory: 'all',  // all, news, posts, profiles
    search: '',        // 検索キーワード
    page: 1,           // 現在のページ
    limit: 20          // 1ページあたりの件数
};

// 選択されたファイル（アップロード用）
let selectedFiles = [];

// 選択されたメディアファイル（詳細表示用）
let selectedMedia = null;

// 認証ヘッダーの作成
const getAuthHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };
};

// メディア一覧の取得
async function fetchMedia() {
    try {
        // 読み込み中表示
        showLoadingState();
        
        // クエリパラメータの構築
        const params = new URLSearchParams();
        params.append('page', currentState.page);
        params.append('limit', currentState.limit);
        
        if (currentState.directory !== 'all') {
            params.append('directory', currentState.directory);
        }
        
        if (currentState.filter !== 'all') {
            params.append('type', currentState.filter);
        }
        
        // APIリクエスト
        const response = await fetch(`${API_CMS_URL}/media?${params.toString()}`, {
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
        
        if (currentState.view === 'grid') {
            renderMediaGrid(data);
        } else {
            renderMediaList(data);
        }
        
        renderPagination(data);
        
    } catch (error) {
        console.error('メディアの取得に失敗しました:', error);
        showErrorState();
    }
}

// 読み込み中表示
function showLoadingState() {
    if (currentState.view === 'grid') {
        document.getElementById('mediaGrid').innerHTML = `
            <div class="media-card p-2 rounded-lg animate-pulse">
                <div class="bg-gray-700 h-32 w-full rounded"></div>
                <div class="mt-2 bg-gray-700 h-4 w-3/4 rounded"></div>
                <div class="mt-1 bg-gray-700 h-3 w-1/2 rounded"></div>
            </div>
            <div class="media-card p-2 rounded-lg animate-pulse">
                <div class="bg-gray-700 h-32 w-full rounded"></div>
                <div class="mt-2 bg-gray-700 h-4 w-3/4 rounded"></div>
                <div class="mt-1 bg-gray-700 h-3 w-1/2 rounded"></div>
            </div>
            <div class="media-card p-2 rounded-lg animate-pulse">
                <div class="bg-gray-700 h-32 w-full rounded"></div>
                <div class="mt-2 bg-gray-700 h-4 w-3/4 rounded"></div>
                <div class="mt-1 bg-gray-700 h-3 w-1/2 rounded"></div>
            </div>
            <div class="media-card p-2 rounded-lg animate-pulse">
                <div class="bg-gray-700 h-32 w-full rounded"></div>
                <div class="mt-2 bg-gray-700 h-4 w-3/4 rounded"></div>
                <div class="mt-1 bg-gray-700 h-3 w-1/2 rounded"></div>
            </div>
        `;
    } else {
        document.getElementById('mediaListBody').innerHTML = `
            <tr>
                <td colspan="5" class="py-4 text-center text-gray-400">読み込み中...</td>
            </tr>
        `;
    }
}

// エラー表示
function showErrorState() {
    if (currentState.view === 'grid') {
        document.getElementById('mediaGrid').innerHTML = `
            <div class="col-span-full py-8 text-center text-red-400">
                メディアの取得に失敗しました。後でもう一度お試しください。
            </div>
        `;
    } else {
        document.getElementById('mediaListBody').innerHTML = `
            <tr>
                <td colspan="5" class="py-4 text-center text-red-400">メディアの取得に失敗しました。後でもう一度お試しください。</td>
            </tr>
        `;
    }
}

// メディアグリッドの描画
function renderMediaGrid(data) {
    const mediaGrid = document.getElementById('mediaGrid');
    const files = data.files || [];
    
    if (files.length === 0) {
        mediaGrid.innerHTML = `
            <div class="col-span-full py-8 text-center text-gray-400">
                メディアがありません
            </div>
        `;
        return;
    }
    
    mediaGrid.innerHTML = files.map(file => {
        const isImage = file.type === 'image';
        const previewUrl = isImage ? file.url : getFileTypeIcon(file.type);
        const previewStyle = isImage ? 'object-cover' : 'object-contain p-4';
        
        return `
            <div class="media-card p-2 rounded-lg hover:bg-gray-800 cursor-pointer" 
                data-filename="${file.filename}" 
                data-path="${file.path}" 
                data-url="${file.url}" 
                data-type="${file.type}" 
                data-size="${file.size}" 
                data-created="${file.created}" 
                data-modified="${file.modified}"
                onclick="showMediaDetail(this)">
                <div class="relative h-32 w-full rounded bg-gray-800 overflow-hidden flex items-center justify-center">
                    ${isImage 
                        ? `<img src="${file.url}" alt="${file.filename}" class="h-full w-full ${previewStyle}">` 
                        : `<img src="${previewUrl}" alt="${file.type}" class="h-16 w-16 opacity-70">`
                    }
                </div>
                <div class="mt-2 truncate text-sm">${file.filename}</div>
                <div class="mt-1 flex justify-between text-xs text-gray-400">
                    <span>${formatFileType(file.type)}</span>
                    <span>${formatFileSize(file.size)}</span>
                </div>
            </div>
        `;
    }).join('');
    
    // 表示中のアイテム数を更新
    document.getElementById('currentItems').textContent = files.length;
    document.getElementById('totalItems').textContent = data.total || 0;
}

// メディアリストの描画
function renderMediaList(data) {
    const mediaListBody = document.getElementById('mediaListBody');
    const files = data.files || [];
    
    if (files.length === 0) {
        mediaListBody.innerHTML = `
            <tr>
                <td colspan="5" class="py-4 text-center text-gray-400">メディアがありません</td>
            </tr>
        `;
        return;
    }
    
    mediaListBody.innerHTML = files.map(file => {
        return `
            <tr class="border-b border-gray-700 hover:bg-gray-800 cursor-pointer" 
                data-filename="${file.filename}" 
                data-path="${file.path}" 
                data-url="${file.url}" 
                data-type="${file.type}" 
                data-size="${file.size}" 
                data-created="${file.created}" 
                data-modified="${file.modified}"
                onclick="showMediaDetail(this)">
                <td class="py-3 px-4 flex items-center gap-3">
                    <div class="h-10 w-10 rounded bg-gray-800 flex items-center justify-center overflow-hidden">
                        ${file.type === 'image' 
                            ? `<img src="${file.url}" alt="${file.filename}" class="h-full w-full object-cover">` 
                            : `<img src="${getFileTypeIcon(file.type)}" alt="${file.type}" class="h-6 w-6 opacity-70">`
                        }
                    </div>
                    <span class="truncate max-w-xs">${file.filename}</span>
                </td>
                <td class="py-3 px-4">${formatFileType(file.type)}</td>
                <td class="py-3 px-4">${formatFileSize(file.size)}</td>
                <td class="py-3 px-4">${formatDate(file.modified)}</td>
                <td class="py-3 px-4">
                    <div class="flex gap-2">
                        <button class="p-1 bg-blue-600 rounded hover:bg-blue-700" title="詳細" onclick="showMediaDetail(this.parentNode.parentNode.parentNode); event.stopPropagation();">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </button>
                        <button class="p-1 bg-gray-600 rounded hover:bg-gray-500" title="移動" onclick="moveMedia('${file.filename}'); event.stopPropagation();">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                            </svg>
                        </button>
                        <button class="p-1 bg-red-600 rounded hover:bg-red-700" title="削除" onclick="deleteMedia('${file.filename}'); event.stopPropagation();">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
    
    // 表示中のアイテム数を更新
    document.getElementById('currentItems').textContent = files.length;
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
    fetchMedia();
}

// メディア詳細表示
function showMediaDetail(element) {
    // 要素からデータを取得
    selectedMedia = {
        filename: element.dataset.filename,
        path: element.dataset.path,
        url: element.dataset.url,
        type: element.dataset.type,
        size: parseInt(element.dataset.size),
        created: parseInt(element.dataset.created),
        modified: parseInt(element.dataset.modified)
    };
    
    // モーダルに詳細を表示
    const modal = document.getElementById('mediaDetailModal');
    const title = document.getElementById('mediaDetailTitle');
    const preview = document.getElementById('mediaPreview');
    const fileName = document.getElementById('mediaFileName');
    const fileType = document.getElementById('mediaFileType');
    const fileSize = document.getElementById('mediaFileSize');
    const uploadDate = document.getElementById('mediaUploadDate');
    const mediaUrl = document.getElementById('mediaUrl');
    
    title.textContent = selectedMedia.filename;
    fileName.textContent = selectedMedia.filename;
    fileType.textContent = formatFileType(selectedMedia.type);
    fileSize.textContent = formatFileSize(selectedMedia.size);
    uploadDate.textContent = formatDate(selectedMedia.created);
    mediaUrl.value = selectedMedia.url;
    
    // プレビュー表示
    if (selectedMedia.type === 'image') {
        preview.innerHTML = `<img src="${selectedMedia.url}" alt="${selectedMedia.filename}" class="max-h-full max-w-full object-contain">`;
    } else if (selectedMedia.type === 'video') {
        preview.innerHTML = `<video src="${selectedMedia.url}" controls class="max-h-full max-w-full"></video>`;
    } else {
        const iconUrl = getFileTypeIcon(selectedMedia.type);
        preview.innerHTML = `
            <div class="flex flex-col items-center justify-center">
                <img src="${iconUrl}" alt="${selectedMedia.type}" class="h-24 w-24 opacity-70 mb-2">
                <div class="text-sm text-gray-400">${formatFileType(selectedMedia.type)}</div>
            </div>
        `;
    }
    
    modal.classList.remove('hidden');
}

// ファイルタイプアイコンの取得
function getFileTypeIcon(type) {
    switch (type) {
        case 'image':
            return '/src/assets/icons/image-icon.svg';
        case 'video':
            return '/src/assets/icons/video-icon.svg';
        case 'document':
            return '/src/assets/icons/document-icon.svg';
        default:
            return '/src/assets/icons/file-icon.svg';
    }
}

// ファイルタイプの表示用フォーマット
function formatFileType(type) {
    switch (type) {
        case 'image':
            return '画像';
        case 'video':
            return '動画';
        case 'document':
            return '文書';
        case 'other':
        default:
            return 'その他';
    }
}

// ファイルサイズのフォーマット
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 日付のフォーマット
function formatDate(timestamp) {
    if (!timestamp) return '不明';
    const date = new Date(timestamp);
    return `${date.getFullYear()}/${(date.getMonth()+1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

// ファイルの削除
async function deleteMedia(filename) {
    if (!confirm(`ファイル「${filename}」を削除しますか？この操作は元に戻せません。`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_CMS_URL}/media/${filename}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        showNotification(`ファイル「${filename}」を削除しました`);
        
        // 詳細モーダルが開いていれば閉じる
        if (selectedMedia && selectedMedia.filename === filename) {
            document.getElementById('mediaDetailModal').classList.add('hidden');
            selectedMedia = null;
        }
        
        // リストを更新
        fetchMedia();
    } catch (error) {
        console.error('ファイルの削除に失敗しました:', error);
        showNotification('ファイルの削除に失敗しました', 'error');
    }
}

// ファイルの移動
async function moveMedia(filename) {
    const newDirectory = prompt(`ファイル「${filename}」の移動先ディレクトリを選択してください（news, posts, profiles）:`, 'news');
    
    if (!newDirectory || !['news', 'posts', 'profiles'].includes(newDirectory)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_CMS_URL}/media/organize`, {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filename,
                newDirectory
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        showNotification(`ファイル「${filename}」を「${newDirectory}」ディレクトリに移動しました`);
        
        // 詳細モーダルが開いていれば閉じる
        if (selectedMedia && selectedMedia.filename === filename) {
            document.getElementById('mediaDetailModal').classList.add('hidden');
            selectedMedia = null;
        }
        
        // リストを更新
        fetchMedia();
    } catch (error) {
        console.error('ファイルの移動に失敗しました:', error);
        showNotification('ファイルの移動に失敗しました', 'error');
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

// URLをクリップボードにコピー
function copyUrlToClipboard() {
    const urlInput = document.getElementById('mediaUrl');
    urlInput.select();
    document.execCommand('copy');
    showNotification('URLをコピーしました');
}

// ファイルアップロード処理
async function uploadFiles() {
    if (selectedFiles.length === 0) {
        showNotification('アップロードするファイルを選択してください', 'error');
        return;
    }
    
    const directorySelect = document.querySelector('#uploadForm select[name="directory"]');
    const directory = directorySelect.value;
    
    const formData = new FormData();
    formData.append('directory', directory);
    
    selectedFiles.forEach(file => {
        formData.append('files', file);
    });
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        document.getElementById('uploadModal').classList.add('hidden');
        showNotification(`${selectedFiles.length}個のファイルをアップロードしました`);
        
        // アップロード後はファイルリストをクリア
        selectedFiles = [];
        document.getElementById('fileList').innerHTML = '';
        document.getElementById('selectedFiles').classList.add('hidden');
        
        // メディア一覧を更新
        fetchMedia();
    } catch (error) {
        console.error('ファイルのアップロードに失敗しました:', error);
        showNotification('ファイルのアップロードに失敗しました', 'error');
    }
}

// イベントリスナーの設定
document.addEventListener('DOMContentLoaded', () => {
    // タブ切り替え
    const filterButtons = document.querySelectorAll('.media-filter button');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentState.filter = button.dataset.filter;
            currentState.page = 1;
            fetchMedia();
        });
    });
    
    // ビュー切り替え
    document.getElementById('gridViewBtn').addEventListener('click', () => {
        if (currentState.view !== 'grid') {
            currentState.view = 'grid';
            document.getElementById('mediaGrid').classList.remove('hidden');
            document.getElementById('mediaList').classList.add('hidden');
            document.getElementById('gridViewBtn').classList.remove('bg-gray-800');
            document.getElementById('gridViewBtn').classList.add('bg-gray-700');
            document.getElementById('listViewBtn').classList.remove('bg-gray-700');
            document.getElementById('listViewBtn').classList.add('bg-gray-800');
            fetchMedia();
        }
    });
    
    document.getElementById('listViewBtn').addEventListener('click', () => {
        if (currentState.view !== 'list') {
            currentState.view = 'list';
            document.getElementById('mediaGrid').classList.add('hidden');
            document.getElementById('mediaList').classList.remove('hidden');
            document.getElementById('listViewBtn').classList.remove('bg-gray-800');
            document.getElementById('listViewBtn').classList.add('bg-gray-700');
            document.getElementById('gridViewBtn').classList.remove('bg-gray-700');
            document.getElementById('gridViewBtn').classList.add('bg-gray-800');
            fetchMedia();
        }
    });
    
    // ディレクトリフィルター
    document.getElementById('directoryFilter').addEventListener('change', e => {
        currentState.directory = e.target.value;
        currentState.page = 1;
        fetchMedia();
    });
    
    // 検索処理
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            currentState.search = searchInput.value.trim();
            currentState.page = 1;
            fetchMedia();
        }, 500);
    });
    
    // アップロードボタン
    document.getElementById('uploadBtn').addEventListener('click', () => {
        document.getElementById('uploadModal').classList.remove('hidden');
    });
    
    // ファイル選択ボタン
    document.getElementById('browseBtn').addEventListener('click', () => {
        document.getElementById('fileInput').click();
    });
    
    // ファイル選択処理
    document.getElementById('fileInput').addEventListener('change', e => {
        handleFileSelection(e.target.files);
    });
    
    // ドラッグ＆ドロップ処理
    const dropArea = document.getElementById('dropArea');
    
    dropArea.addEventListener('dragover', e => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.add('border-blue-500');
    });
    
    dropArea.addEventListener('dragleave', e => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove('border-blue-500');
    });
    
    dropArea.addEventListener('drop', e => {
        e.preventDefault();
        e.stopPropagation();
        dropArea.classList.remove('border-blue-500');
        
        const dt = e.dataTransfer;
        const files = dt.files;
        
        handleFileSelection(files);
    });
    
    // ファイル選択・ドロップ共通処理
    function handleFileSelection(files) {
        if (files.length === 0) return;
        
        selectedFiles = Array.from(files);
        const fileList = document.getElementById('fileList');
        
        fileList.innerHTML = selectedFiles.map(file => `
            <li class="flex justify-between items-center py-1 px-2 rounded hover:bg-gray-700">
                <span class="truncate mr-2">${file.name}</span>
                <span class="text-xs text-gray-400">${formatFileSize(file.size)}</span>
            </li>
        `).join('');
        
        document.getElementById('selectedFiles').classList.remove('hidden');
    }
    
    // アップロードキャンセル
    document.getElementById('cancelUploadBtn').addEventListener('click', () => {
        document.getElementById('uploadModal').classList.add('hidden');
        selectedFiles = [];
        document.getElementById('fileList').innerHTML = '';
        document.getElementById('selectedFiles').classList.add('hidden');
    });
    
    // アップロード実行
    document.getElementById('uploadForm').addEventListener('submit', e => {
        e.preventDefault();
        uploadFiles();
    });
    
    // メディア詳細モーダルを閉じる
    document.getElementById('closeDetailBtn').addEventListener('click', () => {
        document.getElementById('mediaDetailModal').classList.add('hidden');
        selectedMedia = null;
    });
    
    // URLコピーボタン
    document.getElementById('copyUrlBtn').addEventListener('click', copyUrlToClipboard);
    
    // 移動ボタン
    document.getElementById('moveFileBtn').addEventListener('click', () => {
        if (selectedMedia) {
            moveMedia(selectedMedia.filename);
        }
    });
    
    // 削除ボタン
    document.getElementById('deleteFileBtn').addEventListener('click', () => {
        if (selectedMedia) {
            deleteMedia(selectedMedia.filename);
        }
    });
    
    // ログアウトボタン
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // 初期化処理
    fetchUserInfo();
    fetchMedia();
    
    // グローバル関数を設定
    window.showMediaDetail = showMediaDetail;
    window.deleteMedia = deleteMedia;
    window.moveMedia = moveMedia;
}); 