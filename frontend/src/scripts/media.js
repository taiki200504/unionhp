// メディアページのタブ切り替え機能
document.addEventListener('DOMContentLoaded', function() {
    // ヘッダー読み込み完了イベントをリッスンする方法も追加
    document.addEventListener('header:loaded', initializeMediaPage);
    
    // 既にヘッダーが読み込まれている場合のためにコールバックも登録
    if (window.headerLoadedCallbacks) {
        window.headerLoadedCallbacks.push(initializeMediaPage);
    }
    
    // 遅延初期化もバックアップとして残しておく
    setTimeout(initializeMediaPage, 500);
});

// メディアページの初期化関数
let mediaPageInitialized = false;
function initializeMediaPage() {
    // 既に初期化済みなら処理しない（複数回呼ばれる可能性があるため）
    if (mediaPageInitialized) return;
    mediaPageInitialized = true;
    
    // チャンネルタブ切り替え機能
    const tabs = document.querySelectorAll('.channel-tab');
    const contents = document.querySelectorAll('.channel-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // タブのアクティブ状態を切り替え
            tabs.forEach(t => {
                t.classList.remove('active', 'text-blue-600', 'border-b-2', 'border-blue-600', 'font-medium');
                t.classList.add('text-gray-500', 'hover:text-gray-700');
            });
            
            tab.classList.remove('text-gray-500', 'hover:text-gray-700');
            tab.classList.add('active', 'text-blue-600', 'border-b-2', 'border-blue-600', 'font-medium');
            
            // コンテンツの表示を切り替え
            const targetId = tab.getAttribute('data-target') + '-channels';
            contents.forEach(content => {
                if (content.id === targetId) {
                    content.classList.remove('hidden');
                    content.classList.add('active');
                } else {
                    content.classList.add('hidden');
                    content.classList.remove('active');
                }
            });
        });
    });
    
    // アコーディオンの切り替え機能（番組紹介セクション用）
    window.toggleAccordion = function(element) {
        const content = element.nextElementSibling;
        const icon = element.querySelector('svg');
        
        if (content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            icon.style.transform = 'rotate(180deg)';
        } else {
            content.classList.add('hidden');
            icon.style.transform = 'rotate(0deg)';
        }
    }
} 