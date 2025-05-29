// バックエンドAPIのベースURL
const API_BASE_URL = 'http://localhost:5001/api';

// URLパラメータからクエリパラメータを取得する関数
function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    year: params.get('year'),
    tag: params.get('tag'),
    category: params.get('category'),
    search: params.get('search'),
    page: params.get('page') || 1
  };
}

// APIからニュース記事を取得
async function fetchNews(params = {}) {
  try {
    // URLパラメータを構築
    const queryParams = new URLSearchParams();
    
    if (params.year) queryParams.append('year', params.year);
    if (params.tag) queryParams.append('tag', params.tag);
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);
    
    // API呼び出し
    const response = await fetch(`${API_BASE_URL}/news?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error('ニュース記事の取得に失敗しました');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API呼び出しエラー:', error);
    return { status: 'error', news: [] };
  }
}

// 年とタグの一覧を取得
async function fetchYearsAndTags() {
  try {
    const [yearsResponse, tagsResponse] = await Promise.all([
      fetch(`${API_BASE_URL}/news/years`),
      fetch(`${API_BASE_URL}/news/tags`)
    ]);
    
    if (!yearsResponse.ok || !tagsResponse.ok) {
      throw new Error('メタデータの取得に失敗しました');
    }
    
    const yearsData = await yearsResponse.json();
    const tagsData = await tagsResponse.json();
    
    return {
      years: yearsData.years || [],
      tags: tagsData.tags || []
    };
  } catch (error) {
    console.error('メタデータ取得エラー:', error);
    return { years: [], tags: [] };
  }
}

// ニュース記事HTMLを生成する関数
function createNewsItem(article) {
  // 画像URLがない場合はデフォルト画像を表示
  const imageHtml = article.featured_image ? 
    `<img src="${article.featured_image}" alt="${article.title}">` : 
    `<div class="default-news-image">
      <img src="UNION-icon.png" alt="UNION">
    </div>`;
  
  // 日付のフォーマット
  const publishDate = new Date(article.published_at);
  const formattedDate = `${publishDate.getFullYear()}.${String(publishDate.getMonth() + 1).padStart(2, '0')}.${String(publishDate.getDate()).padStart(2, '0')}`;
  
  // タグを最初の1つだけ表示
  const tagHtml = article.tags && article.tags.length > 0 ? 
    `<span class="news-tag tag-${article.tags[0].toLowerCase()}">${article.tags[0]}</span>` : '';
  
  // 記事の内容を100文字に制限
  const excerpt = article.content.length > 100 ? 
    article.content.substring(0, 100) + '...' : 
    article.content;
  
  return `
    <div class="col-span-1">
      <a href="news-detail.html?id=${article.id}" class="news-item">
        <div class="news-item-image">
          ${imageHtml}
        </div>
        <div class="news-content">
          ${tagHtml}
          <span class="news-date">${formattedDate}</span>
          <h3 class="news-title">${article.title}</h3>
          <p class="news-excerpt">${excerpt}</p>
        </div>
      </a>
    </div>
  `;
}

// 年のフィルターを生成
function createYearFilters(years) {
  const currentYear = getQueryParams().year;
  const yearContainer = document.getElementById('year-filters');
  
  if (!yearContainer) return;
  
  // すべて選択肢を追加
  let html = `
    <button class="year-pill ${!currentYear ? 'active' : ''} px-4 py-2 rounded-full text-sm font-medium mr-2 mb-2" 
      data-year="">すべて</button>
  `;
  
  // 各年のボタンを追加
  years.forEach(year => {
    html += `
      <button class="year-pill ${currentYear == year ? 'active' : ''} px-4 py-2 rounded-full text-sm font-medium mr-2 mb-2" 
        data-year="${year}">${year}年</button>
    `;
  });
  
  yearContainer.innerHTML = html;
  
  // イベントリスナーを追加
  document.querySelectorAll('.year-pill').forEach(button => {
    button.addEventListener('click', () => {
      const year = button.dataset.year;
      const params = getQueryParams();
      
      // URLを更新
      const newParams = new URLSearchParams();
      if (year) newParams.append('year', year);
      if (params.tag) newParams.append('tag', params.tag);
      if (params.category) newParams.append('category', params.category);
      if (params.search) newParams.append('search', params.search);
      
      window.location.href = `news.html?${newParams.toString()}`;
    });
  });
}

// タグのフィルターを生成
function createTagFilters(tags) {
  const currentTag = getQueryParams().tag;
  const tagContainer = document.getElementById('tag-filters');
  
  if (!tagContainer) return;
  
  // すべて選択肢を追加
  let html = `
    <button class="filter-pill ${!currentTag ? 'active' : ''} px-4 py-2 rounded-full text-sm font-medium mr-2 mb-2" 
      data-tag="">すべて</button>
  `;
  
  // 各タグのボタンを追加（上位10個まで）
  tags.slice(0, 10).forEach(tag => {
    html += `
      <button class="filter-pill ${currentTag === tag.name ? 'active' : ''} px-4 py-2 rounded-full text-sm font-medium mr-2 mb-2" 
        data-tag="${tag.name}">${tag.name} (${tag.count})</button>
    `;
  });
  
  tagContainer.innerHTML = html;
  
  // イベントリスナーを追加
  document.querySelectorAll('.filter-pill').forEach(button => {
    button.addEventListener('click', () => {
      const tag = button.dataset.tag;
      const params = getQueryParams();
      
      // URLを更新
      const newParams = new URLSearchParams();
      if (params.year) newParams.append('year', params.year);
      if (tag) newParams.append('tag', tag);
      if (params.category) newParams.append('category', params.category);
      if (params.search) newParams.append('search', params.search);
      
      window.location.href = `news.html?${newParams.toString()}`;
    });
  });
}

// ページネーションの生成
function createPagination(currentPage, totalPages) {
  const paginationContainer = document.getElementById('pagination');
  
  if (!paginationContainer || totalPages <= 1) {
    if (paginationContainer) {
      paginationContainer.innerHTML = '';
    }
    return;
  }
  
  let html = '<div class="flex justify-center mt-8 space-x-2">';
  
  // 前のページへのリンク
  if (currentPage > 1) {
    html += `<a href="#" class="pagination-link" data-page="${currentPage - 1}">前へ</a>`;
  }
  
  // ページ番号
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || // 最初のページ
      i === totalPages || // 最後のページ
      Math.abs(i - currentPage) <= 1 // 現在のページの前後1ページ
    ) {
      html += `
        <a href="#" class="pagination-link ${i === currentPage ? 'bg-gradient-primary text-white' : 'bg-gray-100'} 
          px-4 py-2 rounded-md" data-page="${i}">${i}</a>
      `;
    } else if (Math.abs(i - currentPage) === 2) {
      // 省略記号
      html += `<span class="px-3 py-2">...</span>`;
    }
  }
  
  // 次のページへのリンク
  if (currentPage < totalPages) {
    html += `<a href="#" class="pagination-link" data-page="${parseInt(currentPage) + 1}">次へ</a>`;
  }
  
  html += '</div>';
  paginationContainer.innerHTML = html;
  
  // イベントリスナーを追加
  document.querySelectorAll('.pagination-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      const params = getQueryParams();
      
      // URLを更新
      const newParams = new URLSearchParams();
      if (params.year) newParams.append('year', params.year);
      if (params.tag) newParams.append('tag', params.tag);
      if (params.category) newParams.append('category', params.category);
      if (params.search) newParams.append('search', params.search);
      newParams.append('page', page);
      
      window.location.href = `news.html?${newParams.toString()}`;
    });
  });
}

// ニュース記事を表示
async function displayNews() {
  const params = getQueryParams();
  const newsContainer = document.getElementById('news-container');
  const loadingIndicator = document.getElementById('loading-indicator');
  
  // ローディング表示
  if (loadingIndicator) {
    loadingIndicator.classList.remove('hidden');
  }
  
  // データを取得
  const [newsData, metaData] = await Promise.all([
    fetchNews(params),
    fetchYearsAndTags()
  ]);
  
  // ローディング非表示
  if (loadingIndicator) {
    loadingIndicator.classList.add('hidden');
  }
  
  // フィルターUI更新
  createYearFilters(metaData.years);
  createTagFilters(metaData.tags);
  
  // ニュース記事の表示
  if (newsData.status === 'success' && newsData.news.length > 0) {
    let html = '';
    newsData.news.forEach(article => {
      html += createNewsItem(article);
    });
    newsContainer.innerHTML = html;
    
    // ページネーション
    createPagination(newsData.current_page, newsData.total_pages);
  } else {
    newsContainer.innerHTML = `
      <div class="col-span-full text-center py-12">
        <p class="text-gray-500">該当するニュース記事が見つかりませんでした。</p>
      </div>
    `;
  }
}

// 検索機能
function setupSearch() {
  const searchForm = document.getElementById('news-search-form');
  if (!searchForm) return;
  
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchInput = document.getElementById('news-search-input');
    const searchTerm = searchInput.value.trim();
    
    if (searchTerm) {
      const params = getQueryParams();
      
      // URLを更新
      const newParams = new URLSearchParams();
      if (params.year) newParams.append('year', params.year);
      if (params.tag) newParams.append('tag', params.tag);
      if (params.category) newParams.append('category', params.category);
      newParams.append('search', searchTerm);
      
      window.location.href = `news.html?${newParams.toString()}`;
    }
  });
}

// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', () => {
  displayNews();
  setupSearch();
}); 