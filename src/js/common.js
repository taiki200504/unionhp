/**
 * 共通処理を管理するJavaScriptファイル
 * ヘッダーとフッターのインクルードなどの共通機能を提供
 */

document.addEventListener('DOMContentLoaded', function() {
  // ヘッダーのインクルード
  const headerPlaceholder = document.getElementById('header-placeholder');
  if (headerPlaceholder) {
    loadComponent('/components/header.html', headerPlaceholder);
  }
  
  // フッターのインクルード
  const footerPlaceholder = document.getElementById('footer-placeholder');
  if (footerPlaceholder) {
    loadComponent('/components/footer.html', footerPlaceholder);
  }
  
  /**
   * 外部HTMLファイルを読み込み対象要素に挿入する
   * @param {string} url - 読み込むHTMLファイルのURL
   * @param {HTMLElement} element - 挿入先の要素
   */
  async function loadComponent(url, element) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load ${url}: ${response.status} ${response.statusText}`);
      }
      
      const html = await response.text();
      element.innerHTML = html;
      
      // コンポーネント内のスクリプトを実行
      const scripts = element.querySelectorAll('script');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        if (script.src) {
          newScript.src = script.src;
        } else {
          newScript.textContent = script.textContent;
        }
        document.head.appendChild(newScript);
      });
    } catch (error) {
      console.error('Component loading error:', error);
      element.innerHTML = `<p class="error">Component could not be loaded</p>`;
    }
  }
}); 