document.addEventListener('DOMContentLoaded', function() {
  // DOM要素
  const newsContainer = document.getElementById('newsGrid');
  const yearTabs = document.getElementById('yearTabs');
  const loadingIndicator = document.getElementById('loading');
  const categoryBtns = document.querySelectorAll('.category-btn');
  const yearBtns = document.querySelectorAll('.year-btn');
  
  // 状態管理
  let currentYear = 'all';
  let currentCategory = 'all';
  
  // 初期データ取得
  fetchAndDisplayNews();
  
  // カテゴリ切り替え
  categoryBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      categoryBtns.forEach(b => b.classList.remove('active', 'bg-blue-500', 'text-white'));
      this.classList.add('active', 'bg-blue-500', 'text-white');
      currentCategory = this.dataset.category;
      fetchAndDisplayNews();
    });
  });
  
  // 年切り替え
  yearBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      yearBtns.forEach(b => b.classList.remove('active', 'bg-blue-500', 'text-white'));
      this.classList.add('active', 'bg-blue-500', 'text-white');
      currentYear = this.dataset.year;
      fetchAndDisplayNews();
    });
  });
  
  // ニュース取得・表示
  async function fetchAndDisplayNews() {
    try {
      showLoading();
      let url = '/api/news?';
      if (currentYear !== 'all') url += `year=${currentYear}&`;
      if (currentCategory !== 'all') url += `category=${currentCategory}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('APIエラー: ' + response.status);
      const news = await response.json();
      displayNewsGrid(news.news || news); // ページネーション対応
      hideLoading();
    } catch (error) {
      console.error('ニュースの読み込みに失敗しました:', error);
      showError('ニュースの読み込みに失敗しました。');
      hideLoading();
    }
  }
  
  // ニュースグリッドの表示
  function displayNewsGrid(news) {
    newsContainer.innerHTML = '';
    if (!news || news.length === 0) {
      newsContainer.innerHTML = '<div class="no-news">表示するニュースがありません</div>';
      return;
    }
    news.forEach(item => {
      const newsCard = document.createElement('div');
      newsCard.classList.add('news-card');
      const imageUrl = item.image || '/UNION-icon.png';
      const date = new Date(item.publishedAt).toLocaleDateString('ja-JP', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
      newsCard.innerHTML = `
        <div class="news-image">
          <img src="${imageUrl}" alt="${item.title}" onerror="this.src='/UNION-icon.png'">
        </div>
        <div class="news-content">
          <div class="news-date">${date}</div>
          <h3 class="news-title">${item.title}</h3>
          <p class="news-excerpt">${item.content.substring(0, 100)}${item.content.length > 100 ? '...' : ''}</p>
          <a href="/news-detail.html?id=${item._id}" class="read-more">続きを読む</a>
        </div>
      `;
      newsContainer.appendChild(newsCard);
    });
  }
  
  function showLoading() {
    loadingIndicator.classList.remove('hidden');
  }
  
  function hideLoading() {
    loadingIndicator.classList.add('hidden');
  }
  
  function showError(message) {
    newsContainer.innerHTML = `<div class="error-message">${message}</div>`;
  }
}); 