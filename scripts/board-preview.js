// board-preview.js
document.addEventListener('DOMContentLoaded', function() {
    // URLからパラメータを取得
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const isPreview = urlParams.get('preview') === 'true';
    const previewToken = urlParams.get('token');
    
    // プレビューモードの場合はヘッダーに表示
    if (isPreview) {
        const previewBanner = document.createElement('div');
        previewBanner.className = 'fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 font-medium z-50';
        previewBanner.textContent = 'プレビューモード';
        document.body.prepend(previewBanner);
        
        // コンテンツのTOP位置を調整
        document.body.style.paddingTop = '2.5rem';
    }
    
    // コンテンツIDが必須
    if (!id) {
        showError('コンテンツIDが指定されていません');
        return;
    }
    
    // コンテンツの取得
    fetchBoardContent(id, isPreview, previewToken);
    
    // コンテンツの取得関数
    async function fetchBoardContent(contentId, isPreview, token) {
        try {
            let apiUrl = `/api/boards/${contentId}`;
            
            // プレビューモードの場合は下書きも取得
            if (isPreview && token) {
                apiUrl = `/api/preview/boards/${contentId}?token=${token}`;
            }
            
            // 本番環境ではこのように実際のAPIからデータを取得
            // const response = await fetch(apiUrl);
            // if (!response.ok) throw new Error('コンテンツの取得に失敗しました');
            // const data = await response.json();
            
            // 開発用のモックデータ
            const data = {
                id: contentId,
                title: "掲示板タイトル: テストコンテンツ #" + contentId,
                content: `<p>これは掲示板の本文です。ID: ${contentId} のコンテンツがここに表示されます。</p>
                <h2>セクション1</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.</p>
                <h2>セクション2</h2>
                <p>Donec euismod, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl. Donec euismod, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.</p>
                <ul>
                    <li>リスト項目1</li>
                    <li>リスト項目2</li>
                    <li>リスト項目3</li>
                </ul>`,
                published_at: new Date().toISOString(),
                author: "UNION サークル",
                category: "お知らせ",
                tags: ["重要", "イベント", "告知"],
                image_url: "",  // 画像がない場合は空文字
                details: {
                    location: "オンライン",
                    date: "2023年10月15日",
                    time: "13:00〜15:00",
                    contact: "union-info@example.com"
                }
            };
            
            // プレビューモードの場合はステータスを追加
            if (isPreview) {
                data.status = isPreview ? 'draft' : 'published';
            }
            
            // データをページに表示
            displayContent(data);
        } catch (error) {
            console.error('コンテンツ取得エラー:', error);
            showError('コンテンツの取得に失敗しました');
        }
    }
    
    // コンテンツ表示関数
    function displayContent(data) {
        // タイトル設定
        document.title = `${data.title} | UNION`;
        document.getElementById('post-title').textContent = data.title;
        
        // メタ情報設定
        document.getElementById('post-date').textContent = formatDate(data.published_at);
        document.getElementById('post-author').textContent = data.author;
        
        // カテゴリ・タグ設定
        const categoryContainer = document.getElementById('post-category-tags');
        categoryContainer.innerHTML = '';
        
        // カテゴリー
        if (data.category) {
            const categoryTag = document.createElement('span');
            categoryTag.className = 'category-tag bg-blue-100';
            categoryTag.textContent = data.category;
            categoryContainer.appendChild(categoryTag);
        }
        
        // タグ
        if (data.tags && data.tags.length > 0) {
            data.tags.forEach(tag => {
                const tagElement = document.createElement('span');
                tagElement.className = 'category-tag bg-gray-100 ml-2';
                tagElement.textContent = tag;
                categoryContainer.appendChild(tagElement);
            });
        }
        
        // プレビューステータス表示（下書き・アーカイブの場合）
        if (data.status && data.status !== 'published') {
            const statusElement = document.createElement('span');
            statusElement.className = 'category-tag ml-2 ' + 
                (data.status === 'draft' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800');
            statusElement.textContent = data.status === 'draft' ? '下書き' : 'アーカイブ';
            categoryContainer.appendChild(statusElement);
        }
        
        // 画像設定
        const imageContainer = document.getElementById('post-image');
        if (data.image_url) {
            imageContainer.innerHTML = `
                <div class="board-image-container">
                    <img src="${data.image_url}" alt="${data.title}" class="w-full">
                </div>
            `;
        } else {
            // デフォルト画像
            imageContainer.innerHTML = `
                <div class="board-image-container">
                    <div class="default-board-image">
                        <img src="UNION-icon.png" alt="UNION" class="w-20 h-20 opacity-20">
                    </div>
                </div>
            `;
        }
        
        // 詳細情報ボックス
        const detailsContainer = document.getElementById('post-details');
        if (data.details) {
            let detailsHTML = '';
            if (data.details.date) {
                detailsHTML += `<p class="mb-2"><strong>日付:</strong> ${data.details.date}</p>`;
            }
            if (data.details.time) {
                detailsHTML += `<p class="mb-2"><strong>時間:</strong> ${data.details.time}</p>`;
            }
            if (data.details.location) {
                detailsHTML += `<p class="mb-2"><strong>場所:</strong> ${data.details.location}</p>`;
            }
            if (data.details.contact) {
                detailsHTML += `<p class="mb-2"><strong>連絡先:</strong> ${data.details.contact}</p>`;
            }
            detailsContainer.innerHTML = detailsHTML;
        } else {
            // 詳細情報がない場合は非表示
            document.getElementById('post-info-box').style.display = 'none';
        }
        
        // 本文設定
        document.getElementById('post-content').innerHTML = data.content;
    }
    
    // エラー表示関数
    function showError(message) {
        const container = document.querySelector('.max-w-4xl.mx-auto.px-4.pb-16');
        container.innerHTML = `
            <div class="py-12 text-center">
                <div class="bg-red-50 text-red-700 p-6 rounded-lg mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 class="text-xl font-bold mb-2">エラーが発生しました</h2>
                    <p>${message}</p>
                </div>
                <a href="javascript:history.back()" class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                    前のページに戻る
                </a>
            </div>
        `;
    }
    
    // 日付フォーマット関数
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}); 