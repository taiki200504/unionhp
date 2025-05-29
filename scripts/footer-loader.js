/**
 * フッターをロードするためのスクリプト
 * 全ページで共通して使用
 */
document.addEventListener('DOMContentLoaded', function() {
    // フッターを読み込む
    const footerElement = document.getElementById('footer-include');
    if (footerElement) {
        fetch('footer.html')
            .then(r => r.text())
            .then(html => {
                footerElement.innerHTML = html;
                
                // フッター内のスクリプトを実行
                const footerScripts = footerElement.querySelectorAll('script');
                footerScripts.forEach(script => {
                    const newScript = document.createElement('script');
                    if (script.src) {
                        newScript.src = script.src;
                    } else {
                        newScript.textContent = script.textContent;
                    }
                    document.body.appendChild(newScript);
                });
            })
            .catch(err => {
                console.error('フッターの読み込みに失敗しました:', err);
            });
    }
}); 