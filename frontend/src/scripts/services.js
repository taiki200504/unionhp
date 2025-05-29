// サービスページのタブ切り替え機能
document.addEventListener('DOMContentLoaded', function() {
    // ヘッダー読み込み完了イベントをリッスンする方法も追加
    document.addEventListener('header:loaded', initializeServicesPage);
    
    // 既にヘッダーが読み込まれている場合のためにコールバックも登録
    if (window.headerLoadedCallbacks) {
        window.headerLoadedCallbacks.push(initializeServicesPage);
    }
    
    // 遅延初期化もバックアップとして残しておく
    setTimeout(initializeServicesPage, 500);
});

// サービスページの初期化関数
let servicesPageInitialized = false;
function initializeServicesPage() {
    // 既に初期化済みなら処理しない（複数回呼ばれる可能性があるため）
    if (servicesPageInitialized) return;
    servicesPageInitialized = true;
    
    // タブ切り替え機能
    const tabs = document.querySelectorAll('.service-tab');
    const categories = document.querySelectorAll('.service-category');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // タブのアクティブ状態を切り替え
            tabs.forEach(t => {
                t.classList.remove('active');
                // 明示的に背景色を透明に設定
                t.style.background = 'transparent';
                t.style.backgroundColor = 'transparent';
            });
            
            // アクティブタブはグラデーション背景を設定
            tab.classList.add('active');
            tab.style.background = 'linear-gradient(135deg, #066ff2 0%, #ec4faf 100%)';
            
            // カテゴリーの表示を切り替え
            const targetId = tab.getAttribute('data-target');
            categories.forEach(category => {
                if (category.id === targetId) {
                    category.classList.add('active');
                } else {
                    category.classList.remove('active');
                }
            });
        });
    });
} 