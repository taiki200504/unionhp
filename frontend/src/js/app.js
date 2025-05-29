/**
 * UNION HPメインアプリケーション
 * HPフロントエンド全体の制御を行う
 */
import { SITE_CONFIG, CONTENT_CONFIG } from './shared/config.js';
import { ContentAPI, CategoryAPI, NewsletterAPI } from './shared/api.js';
import { showNotification, formatDate, truncateText } from './shared/utils.js';
import { createArticleCard, createPagination } from './shared/components.js';

// アプリケーション状態
const appState = {
  currentPage: 1,
  totalPages: 1,
  articles: [],
  categories: [],
  featuredArticles: [],
  filter: {
    category: null,
    tag: null,
    search: ''
  }
};

// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

/**
 * アプリケーションの初期化
 */
async function initApp() {
  // ヘッダー・フッターの読み込み
  loadHeader();
  loadFooter();
  
  // 現在のページを判断して適切な初期化関数を呼び出す
  const currentPage = getCurrentPage();
  
  try {
    switch (currentPage) {
      case 'home':
        await initHomePage();
        break;
      case 'news':
        await initNewsPage();
        break;
      case 'news-detail':
        await initNewsDetailPage();
        break;
      case 'about':
        initAboutPage();
        break;
      case 'contact':
        initContactPage();
        break;
      default:
        // その他のページ
        break;
    }
    
    // 全ページ共通の初期化
    initCommon();
    
  } catch (error) {
    console.error('アプリケーションの初期化に失敗しました:', error);
    showNotification('ページの読み込み中にエラーが発生しました。', 'error');
  }
}

/**
 * 現在のページ種別を取得
 * @return {string} ページ種別
 */
function getCurrentPage() {
  const path = window.location.pathname;
  
  if (path.endsWith('/') || path.endsWith('/index.html')) {
    return 'home';
  }
  
  if (path.includes('/news.html')) {
    return 'news';
  }
  
  if (path.includes('/news-detail.html')) {
    return 'news-detail';
  }
  
  if (path.includes('/about.html')) {
    return 'about';
  }
  
  if (path.includes('/contact.html')) {
    return 'contact';
  }
  
  // ファイル名からページ種別を取得
  const pageName = path.split('/').pop().replace('.html', '');
  return pageName || 'unknown';
}

/**
 * URLパラメータを取得
 * @param {string} name - パラメータ名
 * @return {string|null} パラメータ値
 */
function getUrlParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

/**
 * ヘッダーを読み込む
 */
function loadHeader() {
  const headerContainer = document.getElementById('header-container');
  if (!headerContainer) return;
  
  fetch('header.html')
    .then(response => response.text())
    .then(html => {
      headerContainer.innerHTML = html;
      
      // ナビゲーションのアクティブ状態を設定
      const currentPage = getCurrentPage();
      const navLink = document.querySelector(`.nav-link[data-page="${currentPage}"]`);
      if (navLink) {
        navLink.classList.add('nav-active');
      }
      
      // モバイルメニューのイベント設定
      const mobileMenuBtn = document.getElementById('mobile-menu-btn');
      const mobileMenu = document.getElementById('mobile-menu');
      
      if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
          mobileMenu.classList.toggle('hidden');
        });
      }
    })
    .catch(error => {
      console.error('ヘッダーの読み込みに失敗しました:', error);
      headerContainer.innerHTML = '<p class="text-red-500">ヘッダーの読み込みに失敗しました。</p>';
    });
}

/**
 * フッターを読み込む
 */
function loadFooter() {
  const footerContainer = document.getElementById('footer-container');
  if (!footerContainer) return;
  
  fetch('footer.html')
    .then(response => response.text())
    .then(html => {
      footerContainer.innerHTML = html;
      
      // 年号を動的に更新
      const yearEl = document.getElementById('current-year');
      if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
      }
      
      // ニュースレター購読フォームの設定
      const newsletterForm = document.getElementById('newsletter-form');
      if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubscribe);
      }
    })
    .catch(error => {
      console.error('フッターの読み込みに失敗しました:', error);
      footerContainer.innerHTML = '<p class="text-red-500">フッターの読み込みに失敗しました。</p>';
    });
}

/**
 * ニュースレター購読処理
 * @param {Event} e - イベントオブジェクト
 */
async function handleNewsletterSubscribe(e) {
  e.preventDefault();
  
  const emailInput = e.target.querySelector('input[type="email"]');
  if (!emailInput || !emailInput.value) {
    showNotification('メールアドレスを入力してください。', 'warning');
    return;
  }
  
  const email = emailInput.value.trim();
  
  try {
    await NewsletterAPI.addSubscriber({ email });
    showNotification('ニュースレターに登録しました。確認メールをご確認ください。');
    emailInput.value = '';
  } catch (error) {
    console.error('ニュースレター登録に失敗しました:', error);
    showNotification('登録処理中にエラーが発生しました。後でもう一度お試しください。', 'error');
  }
}

/**
 * 共通の初期化処理
 */
function initCommon() {
  // 検索フォーム
  const searchForm = document.getElementById('search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchInput = searchForm.querySelector('input[type="search"]');
      if (searchInput && searchInput.value.trim()) {
        window.location.href = `/news.html?search=${encodeURIComponent(searchInput.value.trim())}`;
      }
    });
  }
  
  // スクロールトップボタン
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.remove('hidden');
      } else {
        scrollTopBtn.classList.add('hidden');
      }
    });
    
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/**
 * ホームページの初期化
 */
async function initHomePage() {
  try {
    // 特集記事の取得
    const featuredContainer = document.getElementById('featured-articles');
    if (featuredContainer) {
      const featuredArticles = await ContentAPI.getArticles({ 
        featured: true, 
        status: CONTENT_CONFIG.STATUS.PUBLISHED,
        limit: 3
      });
      
      renderFeaturedArticles(featuredArticles.data, featuredContainer);
    }
    
    // 最新記事の取得
    const recentContainer = document.getElementById('recent-articles');
    if (recentContainer) {
      const recentArticles = await ContentAPI.getArticles({
        status: CONTENT_CONFIG.STATUS.PUBLISHED,
        limit: 6,
        sort: '-publishedAt'
      });
      
      renderArticleGrid(recentArticles.data, recentContainer);
    }
    
  } catch (error) {
    console.error('ホームページデータの取得に失敗しました:', error);
    showNotification('コンテンツの読み込みに失敗しました。', 'error');
  }
}

/**
 * ニュースページの初期化
 */
async function initNewsPage() {
  try {
    // URLパラメータからフィルタを取得
    const categorySlug = getUrlParameter('category');
    const tag = getUrlParameter('tag');
    const search = getUrlParameter('search');
    const page = parseInt(getUrlParameter('page')) || 1;
    
    // フィルタを状態に保存
    appState.filter.category = categorySlug;
    appState.filter.tag = tag;
    appState.filter.search = search;
    appState.currentPage = page;
    
    // フィルタUIの更新
    updateFilterUI();
    
    // カテゴリー一覧を取得
    const categoriesResponse = await CategoryAPI.getCategories();
    appState.categories = categoriesResponse.data || [];
    
    // カテゴリーリストの描画
    const categoryListEl = document.getElementById('category-list');
    if (categoryListEl && appState.categories.length > 0) {
      renderCategoryList(appState.categories, categoryListEl);
    }
    
    // 記事一覧を取得
    const articlesResponse = await ContentAPI.getArticles({
      category: categorySlug,
      tag: tag,
      search: search,
      page: page,
      status: CONTENT_CONFIG.STATUS.PUBLISHED,
      limit: CONTENT_CONFIG.DISPLAY.ITEMS_PER_PAGE
    });
    
    // 記事一覧とページネーションの描画
    const articlesContainer = document.getElementById('articles-container');
    const paginationContainer = document.getElementById('pagination-container');
    
    if (articlesContainer) {
      renderArticleGrid(articlesResponse.data, articlesContainer);
    }
    
    if (paginationContainer) {
      const paginationData = {
        current_page: articlesResponse.current_page || 1,
        total_pages: articlesResponse.total_pages || 1,
        total_items: articlesResponse.total || 0,
        items_per_page: CONTENT_CONFIG.DISPLAY.ITEMS_PER_PAGE
      };
      
      const paginationEl = createPagination(paginationData, (page) => {
        // ページ変更時の処理
        const url = new URL(window.location.href);
        url.searchParams.set('page', page);
        window.location.href = url.toString();
      });
      
      paginationContainer.innerHTML = '';
      paginationContainer.appendChild(paginationEl);
    }
    
  } catch (error) {
    console.error('ニュースページデータの取得に失敗しました:', error);
    showNotification('コンテンツの読み込みに失敗しました。', 'error');
  }
}

/**
 * ニュース詳細ページの初期化
 */
async function initNewsDetailPage() {
  try {
    // 記事IDを取得
    const articleId = getUrlParameter('id');
    if (!articleId) {
      showNotification('記事IDが指定されていません。', 'error');
      return;
    }
    
    // 記事詳細を取得
    const article = await ContentAPI.getArticle(articleId);
    
    // 記事が存在しない場合
    if (!article) {
      showNotification('指定された記事は存在しません。', 'error');
      return;
    }
    
    // 記事内容の描画
    renderArticleDetail(article);
    
    // 関連記事の取得と描画
    if (article.category) {
      const relatedArticles = await ContentAPI.getArticles({
        category: article.category,
        exclude: articleId,
        limit: 3,
        status: CONTENT_CONFIG.STATUS.PUBLISHED
      });
      
      const relatedContainer = document.getElementById('related-articles');
      if (relatedContainer && relatedArticles.data && relatedArticles.data.length > 0) {
        renderRelatedArticles(relatedArticles.data, relatedContainer);
      }
    }
    
  } catch (error) {
    console.error('記事詳細の取得に失敗しました:', error);
    showNotification('記事の読み込みに失敗しました。', 'error');
  }
}

/**
 * About ページの初期化
 */
function initAboutPage() {
  // メンバー紹介セクションのアニメーション設定など
  const memberCards = document.querySelectorAll('.member-card');
  if (memberCards.length > 0) {
    memberCards.forEach((card, index) => {
      card.style.animationDelay = `${index * 0.1}s`;
    });
  }
}

/**
 * お問い合わせページの初期化
 */
function initContactPage() {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const nameInput = contactForm.querySelector('input[name="name"]');
      const emailInput = contactForm.querySelector('input[name="email"]');
      const messageInput = contactForm.querySelector('textarea[name="message"]');
      
      if (!nameInput.value || !emailInput.value || !messageInput.value) {
        showNotification('すべての必須項目を入力してください。', 'warning');
        return;
      }
      
      try {
        // フォーム送信処理
        // 実際のAPI実装時にはここでAPIを呼び出す
        showNotification('お問い合わせを送信しました。回答をお待ちください。');
        contactForm.reset();
      } catch (error) {
        console.error('お問い合わせ送信に失敗しました:', error);
        showNotification('送信中にエラーが発生しました。後でもう一度お試しください。', 'error');
      }
    });
  }
}

/**
 * 特集記事の描画
 * @param {Array} articles - 記事データ配列
 * @param {HTMLElement} container - 描画先のコンテナ要素
 */
function renderFeaturedArticles(articles, container) {
  if (!articles || articles.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-400 py-8">特集記事はありません。</p>';
    return;
  }
  
  const featuredHTML = articles.map((article, index) => {
    const isMain = index === 0;
    
    if (isMain) {
      // メイン特集記事
      return `
        <div class="col-span-1 md:col-span-2 lg:col-span-2 relative rounded-lg overflow-hidden h-96">
          <img src="${article.thumbnail || '/assets/images/default-thumbnail.jpg'}" alt="${article.title}" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <div class="absolute bottom-0 left-0 p-6">
            <span class="bg-orange-600 text-white px-2 py-1 rounded text-sm mb-2 inline-block">特集</span>
            <h2 class="text-white text-2xl font-bold mb-2">${article.title}</h2>
            <p class="text-gray-200 mb-4">${truncateText(article.content, 150)}</p>
            <div class="flex items-center text-gray-300 text-sm mb-4">
              <span>${formatDate(article.publishedAt, false)}</span>
              ${article.category ? `<span class="mx-2">•</span><span>${article.category}</span>` : ''}
            </div>
            <a href="/news-detail.html?id=${article.id}" class="bg-white text-gray-900 px-4 py-2 rounded inline-block hover:bg-gray-100 transition">詳細を見る</a>
          </div>
        </div>
      `;
    } else {
      // サブ特集記事
      return `
        <div class="col-span-1 relative rounded-lg overflow-hidden h-64">
          <img src="${article.thumbnail || '/assets/images/default-thumbnail.jpg'}" alt="${article.title}" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
          <div class="absolute bottom-0 left-0 p-4">
            <span class="bg-orange-600 text-white px-2 py-1 rounded text-sm mb-2 inline-block">特集</span>
            <h3 class="text-white text-lg font-bold mb-2">${article.title}</h3>
            <div class="flex items-center text-gray-300 text-sm mb-3">
              <span>${formatDate(article.publishedAt, false)}</span>
            </div>
            <a href="/news-detail.html?id=${article.id}" class="text-white hover:text-gray-200 transition underline">詳細を見る</a>
          </div>
        </div>
      `;
    }
  }).join('');
  
  container.innerHTML = featuredHTML;
}

/**
 * 記事グリッドの描画
 * @param {Array} articles - 記事データ配列
 * @param {HTMLElement} container - 描画先のコンテナ要素
 */
function renderArticleGrid(articles, container) {
  if (!articles || articles.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-400 py-8">記事がありません。</p>';
    return;
  }
  
  // コンテナをクリア
  container.innerHTML = '';
  
  // 記事グリッドを描画
  articles.forEach(article => {
    const articleCard = createArticleCard(article);
    container.appendChild(articleCard);
  });
}

/**
 * カテゴリーリストの描画
 * @param {Array} categories - カテゴリーデータ配列
 * @param {HTMLElement} container - 描画先のコンテナ要素
 */
function renderCategoryList(categories, container) {
  if (!categories || categories.length === 0) {
    container.innerHTML = '<p class="text-gray-400">カテゴリーがありません。</p>';
    return;
  }
  
  const currentCategory = appState.filter.category;
  
  const categoryHTML = categories.map(category => {
    const isActive = category.slug === currentCategory;
    return `
      <li>
        <a href="/news.html?category=${category.slug}" 
           class="block py-2 px-3 rounded hover:bg-gray-700 ${isActive ? 'bg-blue-600' : ''}">
          ${category.name}
          <span class="text-gray-400 text-sm">(${category.count || 0})</span>
        </a>
      </li>
    `;
  }).join('');
  
  container.innerHTML = `
    <li>
      <a href="/news.html" 
         class="block py-2 px-3 rounded hover:bg-gray-700 ${!currentCategory ? 'bg-blue-600' : ''}">
        すべてのカテゴリー
      </a>
    </li>
    ${categoryHTML}
  `;
}

/**
 * 記事詳細の描画
 * @param {Object} article - 記事データ
 */
function renderArticleDetail(article) {
  const titleEl = document.getElementById('article-title');
  const metaEl = document.getElementById('article-meta');
  const contentEl = document.getElementById('article-content');
  const thumbnailEl = document.getElementById('article-thumbnail');
  const tagsEl = document.getElementById('article-tags');
  
  if (titleEl) titleEl.textContent = article.title;
  
  if (metaEl) {
    metaEl.innerHTML = `
      <div class="flex items-center text-gray-400 flex-wrap gap-y-2">
        <span><i class="far fa-calendar mr-1"></i>${formatDate(article.publishedAt)}</span>
        ${article.category ? `
          <span class="mx-2">•</span>
          <a href="/news.html?category=${article.category.slug}" class="hover:text-blue-400">${article.category.name}</a>
        ` : ''}
        ${article.author ? `
          <span class="mx-2">•</span>
          <span>${article.author}</span>
        ` : ''}
      </div>
    `;
  }
  
  if (contentEl) {
    // テキストからHTMLに変換（改行を<br>に）
    contentEl.innerHTML = article.content.replace(/\n/g, '<br>');
  }
  
  if (thumbnailEl && article.thumbnail) {
    thumbnailEl.innerHTML = `<img src="${article.thumbnail}" alt="${article.title}" class="w-full h-auto rounded-lg">`;
  } else if (thumbnailEl) {
    thumbnailEl.classList.add('hidden');
  }
  
  if (tagsEl && article.tags && article.tags.length > 0) {
    tagsEl.innerHTML = article.tags.map(tag => `
      <a href="/news.html?tag=${tag}" class="bg-gray-700 text-gray-200 px-3 py-1 rounded text-sm hover:bg-gray-600 transition">${tag}</a>
    `).join('');
  } else if (tagsEl) {
    tagsEl.classList.add('hidden');
  }
  
  // ページタイトルを更新
  document.title = `${article.title} | ${SITE_CONFIG.SITE_NAME}`;
  
  // OGPタグを更新
  updateOgpTags(article);
}

/**
 * 関連記事の描画
 * @param {Array} articles - 記事データ配列
 * @param {HTMLElement} container - 描画先のコンテナ要素
 */
function renderRelatedArticles(articles, container) {
  if (!articles || articles.length === 0) {
    container.innerHTML = '<p class="text-center text-gray-400 py-4">関連記事はありません。</p>';
    return;
  }
  
  const relatedHTML = `
    <h3 class="text-xl font-bold mb-4">関連記事</h3>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      ${articles.map(article => `
        <div class="bg-gray-800 rounded-lg overflow-hidden">
          <a href="/news-detail.html?id=${article.id}">
            <img src="${article.thumbnail || '/assets/images/default-thumbnail.jpg'}" alt="${article.title}" class="w-full h-40 object-cover">
          </a>
          <div class="p-4">
            <h4 class="font-bold mb-2"><a href="/news-detail.html?id=${article.id}" class="hover:text-blue-400">${article.title}</a></h4>
            <p class="text-gray-400 text-sm">${formatDate(article.publishedAt, false)}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  container.innerHTML = relatedHTML;
}

/**
 * フィルターUIの更新
 */
function updateFilterUI() {
  const activeFiltersEl = document.getElementById('active-filters');
  if (!activeFiltersEl) return;
  
  const filters = [];
  
  if (appState.filter.category) {
    filters.push({
      type: 'category',
      value: appState.filter.category,
      label: `カテゴリー: ${appState.filter.category}`
    });
  }
  
  if (appState.filter.tag) {
    filters.push({
      type: 'tag',
      value: appState.filter.tag,
      label: `タグ: ${appState.filter.tag}`
    });
  }
  
  if (appState.filter.search) {
    filters.push({
      type: 'search',
      value: appState.filter.search,
      label: `検索: ${appState.filter.search}`
    });
  }
  
  if (filters.length === 0) {
    activeFiltersEl.classList.add('hidden');
    return;
  }
  
  activeFiltersEl.classList.remove('hidden');
  activeFiltersEl.innerHTML = `
    <div class="mb-4 p-3 bg-gray-800 rounded flex flex-wrap gap-2 items-center">
      <span class="text-gray-400">フィルター:</span>
      ${filters.map(filter => `
        <div class="bg-gray-700 rounded-full px-3 py-1 flex items-center">
          <span class="text-sm">${filter.label}</span>
          <button class="remove-filter ml-2" data-type="${filter.type}" data-value="${filter.value}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      `).join('')}
      <button id="clear-all-filters" class="text-blue-400 hover:text-blue-300 text-sm ml-auto">すべてクリア</button>
    </div>
  `;
  
  // フィルター削除ボタンのイベント設定
  document.querySelectorAll('.remove-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.type;
      
      // URLパラメータからフィルターを削除
      const url = new URL(window.location.href);
      url.searchParams.delete(type);
      url.searchParams.delete('page'); // ページもリセット
      window.location.href = url.toString();
    });
  });
  
  // すべてクリアボタン
  const clearAllBtn = document.getElementById('clear-all-filters');
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
      window.location.href = '/news.html';
    });
  }
}

/**
 * OGPタグの更新
 * @param {Object} article - 記事データ
 */
function updateOgpTags(article) {
  // OGPタイトル
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    document.head.appendChild(ogTitle);
  }
  ogTitle.setAttribute('content', article.title);
  
  // OGP説明
  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (!ogDesc) {
    ogDesc = document.createElement('meta');
    ogDesc.setAttribute('property', 'og:description');
    document.head.appendChild(ogDesc);
  }
  ogDesc.setAttribute('content', truncateText(article.content, 200));
  
  // OGP画像
  if (article.thumbnail) {
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute('content', article.thumbnail);
  }
} 