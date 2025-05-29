document.addEventListener('DOMContentLoaded', function() {
    // DOM要素
    const mediaGrid = document.getElementById('mediaGrid');
    const searchInput = document.getElementById('searchInput');
    const folderFilter = document.getElementById('folderFilter');
    const dateFilter = document.getElementById('dateFilter');
    const sortOption = document.getElementById('sortOption');
    const tabButtons = document.querySelectorAll('.content-tabs button');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadModal = document.getElementById('uploadModal');
    const cancelUploadBtn = document.getElementById('cancelUploadBtn');
    
    // 状態管理
    let currentTab = 'all';
    let mediaData = [];
    
    // タブ切り替え
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentTab = this.getAttribute('data-tab');
            filterAndDisplayMedia();
        });
    });
    
    // アップロードモーダル
    uploadBtn.addEventListener('click', function() {
        uploadModal.classList.remove('hidden');
    });
    
    cancelUploadBtn.addEventListener('click', function() {
        uploadModal.classList.add('hidden');
    });
    
    // ファイルアップロード処理
    const dropArea = document.getElementById('dropArea');
    const fileInput = document.getElementById('fileInput');
    const browseFilesBtn = document.getElementById('browseFilesBtn');
    const uploadFilesBtn = document.getElementById('uploadFilesBtn');
    const uploadFileList = document.getElementById('uploadFileList');
    
    if (browseFilesBtn && fileInput) {
        browseFilesBtn.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function() {
            displaySelectedFiles(this.files);
        });
    }
    
    if (dropArea) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            dropArea.classList.add('border-blue-400');
        }
        
        function unhighlight() {
            dropArea.classList.remove('border-blue-400');
        }
        
        dropArea.addEventListener('drop', handleDrop, false);
        
        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;
            displaySelectedFiles(files);
        }
    }
    
    function displaySelectedFiles(files) {
        if (files.length > 0) {
            uploadFileList.classList.remove('hidden');
            uploadFilesBtn.disabled = false;
            
            const fileListElem = document.createElement('ul');
            fileListElem.className = 'space-y-2';
            
            Array.from(files).forEach(file => {
                const li = document.createElement('li');
                li.className = 'flex items-center justify-between bg-gray-50 p-2 rounded';
                li.innerHTML = `
                    <div class="flex items-center">
                        <span class="text-sm font-medium">${file.name}</span>
                        <span class="ml-2 text-xs text-gray-500">${formatFileSize(file.size)}</span>
                    </div>
                `;
                fileListElem.appendChild(li);
            });
            
            const existingList = uploadFileList.querySelector('ul');
            if (existingList) {
                uploadFileList.removeChild(existingList);
            }
            
            uploadFileList.appendChild(fileListElem);
        }
    }
    
    if (uploadFilesBtn) {
        uploadFilesBtn.addEventListener('click', async function() {
            if (!fileInput.files.length) return;
            
            const formData = new FormData();
            formData.append('file', fileInput.files[0]);
            
            try {
                uploadFilesBtn.disabled = true;
                uploadFilesBtn.textContent = 'アップロード中...';
                
                const response = await fetch('/api/media/upload', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    throw new Error(`APIエラー: ${response.status}`);
                }
                
                const result = await response.json();
                console.log('アップロード成功:', result);
                
                // 画面をリフレッシュ
                uploadModal.classList.add('hidden');
                fileInput.value = '';
                uploadFileList.classList.add('hidden');
                
                // メディアリストを更新
                fetchMediaData();
                
            } catch (error) {
                console.error('アップロードエラー:', error);
                alert('アップロードに失敗しました: ' + error.message);
            } finally {
                uploadFilesBtn.disabled = false;
                uploadFilesBtn.textContent = 'アップロード';
            }
        });
    }
    
    // ログアウト
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('ログアウトしますか？')) {
            window.location.href = '../login.html';
        }
    });
    
    // 初期データ取得
    fetchMediaData();
    
    // メディアデータの取得
    async function fetchMediaData() {
        try {
            // APIからデータを取得
            const response = await fetch('/api/media');
            
            if (!response.ok) {
                throw new Error(`APIエラー: ${response.status}`);
            }
            
            const data = await response.json();
            
            // 開発初期段階ではデータが少ない場合、モックデータで補完
            if (data && data.length > 0) {
                mediaData = data.map(item => ({
                    id: item._id,
                    name: item.name,
                    type: getMediaType(item.mime),
                    mime: item.mime,
                    size: item.size || 0,
                    path: item.path || '/uploads/',
                    url: item.url,
                    created_at: item.createdAt || new Date().toISOString()
                }));
            } else {
                console.warn('APIからデータが取得できないため、モックデータを使用します');
                mediaData = generateMockData();
            }
            
            filterAndDisplayMedia();
        } catch (error) {
            console.error('メディアデータの取得に失敗しました:', error);
            mediaGrid.innerHTML = `
                <div class="col-span-full py-4 text-center text-red-500">
                    データの取得に失敗しました。再読み込みしてください。
                </div>
            `;
            // エラー時はモックデータを使用
            mediaData = generateMockData();
            filterAndDisplayMedia();
        }
    }
    
    // メディアデータの表示
    function displayMedia() {
        // グリッド表示
        mediaGrid.innerHTML = '';
        
        if (mediaData.length === 0) {
            mediaGrid.innerHTML = `
                <div class="col-span-full py-4 text-center text-gray-400">
                    表示するメディアがありません
                </div>
            `;
            return;
        }
        
        mediaData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow-sm overflow-hidden media-card';
            card.setAttribute('data-id', item.id);
            
            const fileIcon = getFileIcon(item.type, item.mime);
            
            card.innerHTML = `
                <div class="relative pb-[75%] bg-gray-100">
                    <img src="${item.url}" alt="${item.name}" class="absolute inset-0 w-full h-full object-cover">
                    <div class="absolute top-2 left-2">
                        <label class="checkbox-item">
                            <input type="checkbox" class="media-checkbox opacity-0 absolute" data-id="${item.id}">
                            <span class="w-5 h-5 border-2 border-gray-300 rounded flex items-center justify-center bg-white"></span>
                        </label>
                    </div>
                </div>
                <div class="p-3">
                    <h3 class="font-medium text-gray-800 truncate" title="${item.name}">${item.name}</h3>
                    <p class="text-xs text-gray-500 mt-1">${formatFileSize(item.size)} · ${formatDate(item.created_at)}</p>
                </div>
            `;
            
            mediaGrid.appendChild(card);
        });
    }
    
    // モックデータ生成
    function generateMockData() {
        return [
            { id: 1, name: 'union-event-poster.jpg', type: 'image', mime: 'image/jpeg', size: 1240000, path: '/uploads/images/', url: '../../../images/mock/event-poster.jpg', created_at: '2023-06-15T10:30:00Z' },
            { id: 2, name: 'members-guide.pdf', type: 'document', mime: 'application/pdf', size: 850000, path: '/uploads/docs/', url: '../../../images/mock/pdf-icon.png', created_at: '2023-05-22T14:15:00Z' },
            { id: 3, name: 'campus-tour.mp4', type: 'video', mime: 'video/mp4', size: 18500000, path: '/uploads/videos/', url: '../../../images/mock/video-thumbnail.jpg', created_at: '2023-07-03T09:45:00Z' },
            { id: 4, name: 'union-logo.png', type: 'image', mime: 'image/png', size: 350000, path: '/uploads/images/', url: '../../../images/mock/logo.png', created_at: '2023-04-10T11:20:00Z' },
            { id: 5, name: 'meeting-notes.docx', type: 'document', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 620000, path: '/uploads/docs/', url: '../../../images/mock/doc-icon.png', created_at: '2023-06-28T16:05:00Z' },
            { id: 6, name: 'activity-photo-1.jpg', type: 'image', mime: 'image/jpeg', size: 980000, path: '/uploads/images/', url: '../../../images/mock/activity-photo.jpg', created_at: '2023-07-12T13:40:00Z' },
            { id: 7, name: 'newsletter-template.zip', type: 'other', mime: 'application/zip', size: 1750000, path: '/uploads/other/', url: '../../../images/mock/zip-icon.png', created_at: '2023-05-30T15:25:00Z' },
            { id: 8, name: 'staff-training.mp4', type: 'video', mime: 'video/mp4', size: 25600000, path: '/uploads/videos/', url: '../../../images/mock/video-thumbnail2.jpg', created_at: '2023-06-05T10:10:00Z' }
        ];
    }
    
    function filterAndDisplayMedia() {
        // タブに基づいてフィルタリング
        const filteredMedia = mediaData.filter(item => {
            if (currentTab === 'all') return true;
            return item.type === currentTab;
        });
        
        // 検索フィルタリング
        const searchTerm = searchInput.value.toLowerCase();
        const searchFiltered = searchTerm ? 
            filteredMedia.filter(item => item.name.toLowerCase().includes(searchTerm)) : 
            filteredMedia;
        
        // フォルダフィルタリング
        const folderValue = folderFilter.value;
        const folderFiltered = folderValue ? 
            searchFiltered.filter(item => item.path.includes(folderValue)) : 
            searchFiltered;
        
        // 日付フィルタリング
        const dateValue = dateFilter.value;
        let dateFiltered = folderFiltered;
        
        if (dateValue) {
            const today = new Date();
            const filterDate = new Date();
            
            if (dateValue === 'today') {
                filterDate.setHours(0, 0, 0, 0);
            } else if (dateValue === 'week') {
                filterDate.setDate(today.getDate() - 7);
            } else if (dateValue === 'month') {
                filterDate.setMonth(today.getMonth() - 1);
            } else if (dateValue === 'year') {
                filterDate.setFullYear(today.getFullYear() - 1);
            }
            
            dateFiltered = folderFiltered.filter(item => {
                const itemDate = new Date(item.created_at);
                return itemDate >= filterDate;
            });
        }
        
        // ソート
        const sortBy = sortOption.value;
        if (sortBy === 'newest') {
            dateFiltered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (sortBy === 'oldest') {
            dateFiltered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        } else if (sortBy === 'name') {
            dateFiltered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortBy === 'size') {
            dateFiltered.sort((a, b) => b.size - a.size);
        }
        
        // 表示用のデータ更新
        mediaData = dateFiltered;
        
        // 表示更新
        displayMedia();
    }
    
    // MIMEタイプからメディアタイプを取得
    function getMediaType(mime) {
        if (!mime) return 'other';
        
        if (mime.startsWith('image/')) {
            return 'image';
        } else if (mime.startsWith('video/')) {
            return 'video';
        } else if (
            mime === 'application/pdf' || 
            mime.includes('word') || 
            mime.includes('text/') || 
            mime.includes('spreadsheet') || 
            mime.includes('presentation')
        ) {
            return 'document';
        } else {
            return 'other';
        }
    }
    
    // ファイルタイプに応じたアイコンを取得
    function getFileIcon(type, mime) {
        // 実際の実装ではファイルタイプに応じたアイコンを返す
        return 'document';
    }
    
    // ファイルサイズのフォーマット
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
        else return (bytes / 1073741824).toFixed(1) + ' GB';
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
}); 