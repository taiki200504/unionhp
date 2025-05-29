document.addEventListener('DOMContentLoaded', function() {
  // DOM要素
  const newsDetail = document.getElementById('newsDetail');
  const newsTitle = document.getElementById('newsTitle');
  const newsDate = document.getElementById('newsDate');
  const newsAuthor = document.getElementById('newsAuthor');
  const newsContent = document.getElementById('newsContent');
  const newsImage = document.getElementById('newsImage');
  const loading = document.getElementById('loading');
  const errorContainer = document.getElementById('error');
  
  // URLからニュースIDを取得
  const urlParams = new URLSearchParams(window.location.search);
  const newsId = urlParams.get('id');
  
  if (!newsId) {
    showError('ニュース記事IDが指定されていません');
    return;
  }
  
  // ニュース記事の取得
  fetchNewsDetail(newsId);
  
  async function fetchNewsDetail(id) {
    try {
      // ローディング表示
      showLoading();
      
      // APIからニュース記事を取得
      const response = await fetch(`/api/news/${id}`);
      if (!response.ok) {
        throw new Error('APIエラー: ' + response.status);
      }
      
      const news = await response.json();
      
      // ニュース詳細を表示
      displayNewsDetail(news);
      
      // ローディング非表示
      hideLoading();
      
      // ニュース詳細を表示
      newsDetail.classList.remove('hidden');
    } catch (error) {
      console.error('ニュース詳細の取得に失敗しました:', error);
      showError('ニュース記事の読み込みに失敗しました');
      hideLoading();
    }
  }
  
  function displayNewsDetail(news) {
    // タイトルと日付を設定
    document.title = `${news.title} | UNION`;
    newsTitle.textContent = news.title;
    
    // 日付のフォーマット
    const date = new Date(news.publishedAt);
    newsDate.textContent = date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // 著者
    newsAuthor.textContent = news.author;
    
    // 内容
    // 注意: 実際の実装ではXSS対策が必要
    newsContent.innerHTML = news.content;
    
    // 画像の設定（エラー時はデフォルト画像）
    newsImage.src = news.image || '/UNION-icon.png';
    newsImage.alt = news.title;
    newsImage.onerror = function() {
      this.src = '/UNION-icon.png';
    };
  }
  
  function showLoading() {
    loading.classList.remove('hidden');
  }
  
  function hideLoading() {
    loading.classList.add('hidden');
  }
  
  function showError(message) {
    errorContainer.textContent = message;
    errorContainer.classList.remove('hidden');
  }
}); 