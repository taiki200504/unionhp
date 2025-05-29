/**
 * UNION HPとCMS共通UIコンポーネント
 * 両方のフロントエンドで再利用可能なUIコンポーネントを定義
 */
import { SITE_CONFIG } from './config.js';
import { formatDate, truncateText, getStatusText, getStatusClass } from './utils.js';

/**
 * メディアカードを生成する
 * @param {Object} media - メディアデータ
 * @param {Function} onSelect - 選択時のコールバック関数
 * @return {HTMLElement} メディアカードのDOM要素
 */
export function createMediaCard(media, onSelect) {
  const mediaCard = document.createElement('div');
  mediaCard.className = 'bg-[#23232a] rounded-lg overflow-hidden';
  mediaCard.dataset.id = media.id;
  
  // メディアの種類に応じたプレビュー
  let previewHTML = '';
  const fileType = media.type || 'file';
  
  switch (fileType) {
    case 'image':
      previewHTML = `<img src="${media.url}" alt="${media.name}" class="w-full h-32 object-cover">`;
      break;
    case 'video':
      previewHTML = `
        <div class="w-full h-32 bg-gray-800 flex items-center justify-center relative">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="absolute bottom-1 right-1 bg-black bg-opacity-50 text-xs px-1 rounded">${media.duration || ''}</span>
        </div>
      `;
      break;
    case 'audio':
      previewHTML = `
        <div class="w-full h-32 bg-gray-800 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        </div>
      `;
      break;
    case 'document':
      previewHTML = `
        <div class="w-full h-32 bg-gray-800 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      `;
      break;
    default:
      previewHTML = `
        <div class="w-full h-32 bg-gray-800 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
        </div>
      `;
  }
  
  // メディア情報
  mediaCard.innerHTML = `
    <div class="relative group">
      ${previewHTML}
      <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
        <button class="select-media-btn px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm">選択</button>
      </div>
    </div>
    <div class="p-3">
      <h4 class="font-medium truncate" title="${media.name}">${media.name}</h4>
      <div class="flex justify-between mt-1 text-sm text-gray-400">
        <span>${media.size || '-'}</span>
        <span>${formatDate(media.uploadDate, false)}</span>
      </div>
    </div>
  `;
  
  // 選択ボタンのイベントリスナー
  if (onSelect && typeof onSelect === 'function') {
    const selectBtn = mediaCard.querySelector('.select-media-btn');
    if (selectBtn) {
      selectBtn.addEventListener('click', () => onSelect(media));
    }
  }
  
  return mediaCard;
}

/**
 * 記事カードを生成する
 * @param {Object} article - 記事データ
 * @param {boolean} isCompact - コンパクト表示するかどうか
 * @return {HTMLElement} 記事カードのDOM要素
 */
export function createArticleCard(article, isCompact = false) {
  const articleCard = document.createElement('div');
  
  if (isCompact) {
    // コンパクト表示（サイドバーや関連記事用）
    articleCard.className = 'bg-[#23232a] rounded-lg overflow-hidden mb-3';
    articleCard.innerHTML = `
      <div class="p-3">
        <div class="flex items-start">
          ${article.thumbnail ? `
            <img src="${article.thumbnail}" alt="${article.title}" class="w-16 h-16 object-cover rounded mr-3">
          ` : ''}
          <div class="flex-1 min-w-0">
            <h4 class="font-medium mb-1 truncate">${article.title}</h4>
            <div class="flex items-center text-xs text-gray-400">
              <span>${formatDate(article.publishedAt, false)}</span>
              ${article.category ? `
                <span class="mx-1">•</span>
                <span>${article.category}</span>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    // 通常表示
    articleCard.className = 'bg-[#23232a] rounded-lg overflow-hidden h-full flex flex-col';
    
    // サムネイル部分
    let thumbnailHTML = '';
    if (article.thumbnail) {
      thumbnailHTML = `
        <div class="relative">
          <img src="${article.thumbnail}" alt="${article.title}" class="w-full h-48 object-cover">
          ${article.featured ? `
            <div class="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded">特集</div>
          ` : ''}
          ${article.status !== 'published' ? `
            <div class="absolute top-2 right-2 ${getStatusClass(article.status)} text-xs px-2 py-1 rounded">${getStatusText(article.status)}</div>
          ` : ''}
        </div>
      `;
    } else {
      thumbnailHTML = `
        <div class="relative bg-gray-800 h-48 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          ${article.featured ? `
            <div class="absolute top-2 left-2 bg-orange-600 text-white text-xs px-2 py-1 rounded">特集</div>
          ` : ''}
          ${article.status !== 'published' ? `
            <div class="absolute top-2 right-2 ${getStatusClass(article.status)} text-xs px-2 py-1 rounded">${getStatusText(article.status)}</div>
          ` : ''}
        </div>
      `;
    }
    
    // 記事の内容
    articleCard.innerHTML = `
      ${thumbnailHTML}
      <div class="p-4 flex-1 flex flex-col">
        <h3 class="font-bold text-lg mb-2">${article.title}</h3>
        <p class="text-gray-400 text-sm mb-4 flex-1">${truncateText(article.content, 120)}</p>
        <div class="flex justify-between items-center text-sm">
          <div class="flex items-center text-gray-400">
            <span>${formatDate(article.publishedAt, false)}</span>
            ${article.category ? `
              <span class="mx-1">•</span>
              <span>${article.category}</span>
            ` : ''}
          </div>
          <a href="/news-detail.html?id=${article.id}" class="text-blue-400 hover:text-blue-300">詳細</a>
        </div>
      </div>
    `;
  }
  
  return articleCard;
}

/**
 * カテゴリーカードを生成する
 * @param {Object} category - カテゴリーデータ
 * @param {Function} onEdit - 編集時のコールバック関数
 * @param {Function} onDelete - 削除時のコールバック関数
 * @return {HTMLElement} カテゴリーカードのDOM要素
 */
export function createCategoryCard(category, onEdit, onDelete) {
  const categoryCard = document.createElement('div');
  categoryCard.className = 'bg-[#23232a] rounded-lg p-4';
  categoryCard.dataset.id = category.id;
  
  // 子カテゴリーの表示
  let childrenHTML = '';
  if (category.children && category.children.length > 0) {
    childrenHTML = `
      <div class="mt-3 pt-3 border-t border-gray-700">
        <h5 class="text-sm text-gray-400 mb-2">サブカテゴリー</h5>
        <div class="flex flex-wrap gap-2">
          ${category.children.map(child => `
            <span class="text-xs bg-gray-800 px-2 py-1 rounded">${child.name}</span>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  categoryCard.innerHTML = `
    <div class="flex justify-between items-start">
      <div>
        <h3 class="font-bold text-lg">${category.name}</h3>
        ${category.description ? `<p class="text-gray-400 text-sm mt-1">${category.description}</p>` : ''}
        ${category.parent ? `<p class="text-xs text-gray-400 mt-1">親カテゴリー: ${category.parent.name}</p>` : ''}
      </div>
      <div class="flex gap-2">
        ${onEdit ? `
          <button class="edit-category-btn p-1 bg-blue-600 rounded hover:bg-blue-700" title="編集">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        ` : ''}
        ${onDelete ? `
          <button class="delete-category-btn p-1 bg-red-600 rounded hover:bg-red-700" title="削除">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        ` : ''}
      </div>
    </div>
    
    <div class="flex items-center gap-3 mt-2">
      <span class="text-sm text-gray-400">${category.count || 0} 記事</span>
      <span class="text-sm px-2 py-0.5 bg-gray-800 rounded-full">${category.slug || ''}</span>
    </div>
    
    ${childrenHTML}
  `;
  
  // イベントリスナーの追加
  if (onEdit && typeof onEdit === 'function') {
    const editBtn = categoryCard.querySelector('.edit-category-btn');
    if (editBtn) {
      editBtn.addEventListener('click', () => onEdit(category));
    }
  }
  
  if (onDelete && typeof onDelete === 'function') {
    const deleteBtn = categoryCard.querySelector('.delete-category-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => onDelete(category));
    }
  }
  
  return categoryCard;
}

/**
 * ページネーションを生成する
 * @param {Object} paginationData - ページネーションデータ
 * @param {Function} onPageChange - ページ変更時のコールバック関数
 * @return {HTMLElement} ページネーションのDOM要素
 */
export function createPagination(paginationData, onPageChange) {
  const { current_page, total_pages, total_items, items_per_page } = paginationData;
  
  const paginationContainer = document.createElement('div');
  paginationContainer.className = 'flex justify-between items-center mt-6';
  
  // 表示情報
  const infoDiv = document.createElement('div');
  infoDiv.className = 'text-sm text-gray-400';
  infoDiv.textContent = `${(current_page - 1) * items_per_page + 1} - ${Math.min(current_page * items_per_page, total_items)} / ${total_items} 件`;
  
  // ページネーションコントロール
  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'flex gap-2';
  
  // 前へボタン
  const prevButton = document.createElement('button');
  prevButton.className = 'px-3 py-1 bg-gray-800 rounded border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed';
  prevButton.textContent = '前へ';
  prevButton.disabled = current_page <= 1;
  prevButton.addEventListener('click', () => {
    if (current_page > 1 && onPageChange) {
      onPageChange(current_page - 1);
    }
  });
  
  // ページ番号
  const pagesDiv = document.createElement('div');
  pagesDiv.className = 'flex';
  
  // 表示するページ番号の範囲を決定
  let startPage = Math.max(1, current_page - 2);
  let endPage = Math.min(total_pages, startPage + 4);
  
  if (endPage - startPage < 4) {
    startPage = Math.max(1, endPage - 4);
  }
  
  // 最初のページへのリンク
  if (startPage > 1) {
    const firstPageBtn = document.createElement('button');
    firstPageBtn.className = 'px-3 py-1 rounded border border-gray-700';
    firstPageBtn.textContent = '1';
    firstPageBtn.addEventListener('click', () => onPageChange && onPageChange(1));
    pagesDiv.appendChild(firstPageBtn);
    
    if (startPage > 2) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'px-3 py-1 text-gray-400';
      ellipsis.textContent = '...';
      pagesDiv.appendChild(ellipsis);
    }
  }
  
  // ページ番号ボタン
  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `px-3 py-1 rounded border ${i === current_page ? 'bg-blue-600 border-blue-700' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'}`;
    pageBtn.textContent = i;
    pageBtn.addEventListener('click', () => onPageChange && onPageChange(i));
    pagesDiv.appendChild(pageBtn);
  }
  
  // 最後のページへのリンク
  if (endPage < total_pages) {
    if (endPage < total_pages - 1) {
      const ellipsis = document.createElement('span');
      ellipsis.className = 'px-3 py-1 text-gray-400';
      ellipsis.textContent = '...';
      pagesDiv.appendChild(ellipsis);
    }
    
    const lastPageBtn = document.createElement('button');
    lastPageBtn.className = 'px-3 py-1 rounded border border-gray-700';
    lastPageBtn.textContent = total_pages;
    lastPageBtn.addEventListener('click', () => onPageChange && onPageChange(total_pages));
    pagesDiv.appendChild(lastPageBtn);
  }
  
  // 次へボタン
  const nextButton = document.createElement('button');
  nextButton.className = 'px-3 py-1 bg-gray-800 rounded border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed';
  nextButton.textContent = '次へ';
  nextButton.disabled = current_page >= total_pages;
  nextButton.addEventListener('click', () => {
    if (current_page < total_pages && onPageChange) {
      onPageChange(current_page + 1);
    }
  });
  
  // コンポーネントの組み立て
  controlsDiv.appendChild(prevButton);
  controlsDiv.appendChild(pagesDiv);
  controlsDiv.appendChild(nextButton);
  
  paginationContainer.appendChild(infoDiv);
  paginationContainer.appendChild(controlsDiv);
  
  return paginationContainer;
}

/**
 * モーダルを生成する
 * @param {Object} options - モーダルのオプション
 * @return {Object} モーダルの操作オブジェクト
 */
export function createModal(options = {}) {
  const {
    title = '',
    content = '',
    size = 'md', // sm, md, lg, xl
    showClose = true,
    backdrop = true,
    onClose = null
  } = options;
  
  // サイズクラスの決定
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };
  
  // モーダル要素の作成
  const modalEl = document.createElement('div');
  modalEl.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 opacity-0 transition-opacity';
  
  modalEl.innerHTML = `
    <div class="bg-[#23232a] rounded-lg p-6 ${sizeClasses[size] || sizeClasses.md} w-full max-h-[90vh] flex flex-col shadow-xl">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-bold">${title}</h3>
        ${showClose ? `
          <button class="modal-close p-1 hover:bg-gray-700 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ` : ''}
      </div>
      <div class="overflow-auto flex-1">
        ${content}
      </div>
    </div>
  `;
  
  // DOMに追加
  document.body.appendChild(modalEl);
  
  // アニメーション用のタイムアウト
  setTimeout(() => {
    modalEl.classList.add('opacity-100');
  }, 10);
  
  // 閉じるボタンのイベント設定
  const closeBtn = modalEl.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeModal();
    });
  }
  
  // バックドロップクリックで閉じる
  if (backdrop) {
    modalEl.addEventListener('click', (e) => {
      if (e.target === modalEl) {
        closeModal();
      }
    });
  }
  
  // モーダルを閉じる関数
  function closeModal() {
    modalEl.classList.remove('opacity-100');
    modalEl.classList.add('opacity-0');
    
    setTimeout(() => {
      document.body.removeChild(modalEl);
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    }, 300);
  }
  
  // モーダルの内容を取得する関数
  function getContentElement() {
    return modalEl.querySelector('.overflow-auto');
  }
  
  // モーダルの内容を設定する関数
  function setContent(newContent) {
    const contentEl = getContentElement();
    if (contentEl) {
      if (typeof newContent === 'string') {
        contentEl.innerHTML = newContent;
      } else if (newContent instanceof Element) {
        contentEl.innerHTML = '';
        contentEl.appendChild(newContent);
      }
    }
  }
  
  // モーダルのタイトルを設定する関数
  function setTitle(newTitle) {
    const titleEl = modalEl.querySelector('h3');
    if (titleEl) {
      titleEl.textContent = newTitle;
    }
  }
  
  // 返却するオブジェクト
  return {
    close: closeModal,
    getContent: getContentElement,
    setContent,
    setTitle,
    element: modalEl
  };
} 