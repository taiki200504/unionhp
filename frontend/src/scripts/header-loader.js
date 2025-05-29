/**
 * ヘッダーをロードして初期化するためのスクリプト
 * 全ページで共通して使用
 */

// ヘッダーが読み込まれた後に呼び出されるコールバック関数を格納する配列
window.headerLoadedCallbacks = window.headerLoadedCallbacks || [];

// ヘッダーが読み込まれたことを他のスクリプトに通知するためのイベント
function notifyHeaderLoaded() {
    // カスタムイベントをディスパッチ
    const headerLoadedEvent = new CustomEvent('header:loaded');
    document.dispatchEvent(headerLoadedEvent);

    // 登録されているコールバックを実行
    if (window.headerLoadedCallbacks && window.headerLoadedCallbacks.length > 0) {
        window.headerLoadedCallbacks.forEach(callback => {
            try {
                callback();
            } catch(e) {
                console.error('ヘッダーコールバック実行エラー:', e);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // ヘッダーを読み込む
    const headerElement = document.getElementById('header-include');
    if (headerElement) {
        fetch('header.html')
            .then(r => r.text())
            .then(html => {
                headerElement.innerHTML = html;
                
                // ヘッダー内のスクリプトを実行
                const headerScripts = headerElement.querySelectorAll('script');
                headerScripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        newScript.src = script.src;
                    } else {
                        newScript.textContent = script.textContent;
                    }
                    document.body.appendChild(newScript);
                });
                
                // 現在のページをナビゲーションでハイライト
                highlightCurrentPage();
                
                // ヘッダーが読み込まれたことを通知
                notifyHeaderLoaded();
            })
            .catch(err => {
                console.error('ヘッダーの読み込みに失敗しました:', err);
            });
    }
});

/**
 * 現在のページに対応するナビゲーションリンクをハイライトする
 */
function highlightCurrentPage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage) {
            link.classList.add('text-transparent', 'bg-clip-text', 'bg-gradient-primary', 'font-medium');
            const span = link.querySelector('span');
            if (span) {
                span.classList.add('w-full');
            }
        }
    });
} 