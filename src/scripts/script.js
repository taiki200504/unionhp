document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // メニュー項目をクリックしたときにメニューを閉じる
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}); 

// NEWSセクション：APIから記事を取得して描画
async function fetchAndRenderNews() {
    const container = document.getElementById('news-container');
    if (!container) return;
    try {
        const res = await fetch('http://localhost:3000/api/posts');
        if (!res.ok) throw new Error('記事の取得に失敗しました');
        const posts = await res.json();
        if (!Array.isArray(posts) || posts.length === 0) {
            container.innerHTML = '<p class="text-gray-500">記事がありません。</p>';
            return;
        }
        container.innerHTML = posts.map(post => `
            <div class="bg-blue-50 p-6 rounded-xl shadow-sm flex flex-col">
                <h3 class="text-xl font-bold text-primary mb-2">${post.title}</h3>
                <p class="text-gray-600 text-sm mb-4">${new Date(post.publishedAt).toLocaleDateString()}</p>
                <div class="text-gray-700 flex-1 mb-4">${post.content.slice(0, 100)}...</div>
                <a href="#" class="text-accent font-bold mt-auto">続きを読む</a>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = `<p class="text-red-500">${e.message}</p>`;
    }
}

window.addEventListener('DOMContentLoaded', fetchAndRenderNews);

let allPosts = [];
let selectedCategory = null;
let selectedTag = null;

function renderFilterBar(posts) {
    const filterBar = document.getElementById('filterBar');
    if (!filterBar) return;
    // カテゴリ一覧
    const categories = Array.from(new Set(posts.map(p => p.category).filter(Boolean)));
    // タグ一覧
    const tags = Array.from(new Set(posts.flatMap(p => (p.tags || []))));
    let html = '';
    if (categories.length > 0) {
        html += '<span class="font-bold mr-2">カテゴリ:</span>';
        html += `<button class="px-2 py-1 rounded ${!selectedCategory ? 'bg-primary text-white' : 'bg-gray-200'}" onclick="selectCategory(null)">すべて</button>`;
        categories.forEach(cat => {
            html += `<button class="px-2 py-1 rounded ${selectedCategory === cat ? 'bg-primary text-white' : 'bg-gray-200'}" onclick="selectCategory('${cat}')">${cat}</button>`;
        });
    }
    if (tags.length > 0) {
        html += '<span class="font-bold ml-4 mr-2">タグ:</span>';
        html += `<button class="px-2 py-1 rounded ${!selectedTag ? 'bg-accent text-white' : 'bg-gray-200'}" onclick="selectTag(null)">すべて</button>`;
        tags.forEach(tag => {
            html += `<button class="px-2 py-1 rounded ${selectedTag === tag ? 'bg-accent text-white' : 'bg-gray-200'}" onclick="selectTag('${tag}')">${tag}</button>`;
        });
    }
    filterBar.innerHTML = html;
}

window.selectCategory = function(cat) {
    selectedCategory = cat;
    selectedTag = null;
    renderPosts();
    renderFilterBar(allPosts);
}
window.selectTag = function(tag) {
    selectedTag = tag;
    selectedCategory = null;
    renderPosts();
    renderFilterBar(allPosts);
}

function renderPosts() {
    const postsList = document.getElementById('postsList');
    let filtered = allPosts;
    if (selectedCategory) {
        filtered = filtered.filter(p => p.category === selectedCategory);
    }
    if (selectedTag) {
        filtered = filtered.filter(p => (p.tags || []).includes(selectedTag));
    }
    postsList.innerHTML = filtered.map(post => `
        <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-xl font-bold text-primary cursor-pointer hover:underline" onclick="location.href='post.html?id=${post._id}'">${post.title}</h3>
            <p class="text-sm text-gray-600">著者: ${post.author} | 投稿日: ${new Date(post.publishedAt).toLocaleDateString()}</p>
            <div class="mt-2 text-gray-700 line-clamp-2">${post.content.replace(/\n/g, '<br>')}</div>
            <div class="mt-2 text-xs text-gray-500">カテゴリー: ${post.category || '-'} / タグ: ${(post.tags || []).join(', ')}</div>
        </div>
    `).join('') || '<p class="text-gray-500">記事がありません。</p>';
}

// 記事一覧の取得と表示
async function fetchPosts() {
    try {
        const res = await fetch('http://localhost:3000/api/posts');
        const posts = await res.json();
        allPosts = posts.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        renderFilterBar(allPosts);
        renderPosts();
    } catch (error) {
        document.getElementById('postsList').innerHTML = '<p class="text-red-600">記事の取得に失敗しました</p>';
    }
}

// 初期表示
fetchPosts();

// カルーセル用
async function renderBoardCarousel() {
    const carousel = document.getElementById('boardCarousel');
    if (!carousel) return;
    try {
        const res = await fetch('http://localhost:3000/api/posts');
        const posts = await res.json();
        const boardPosts = posts.filter(p => p.category === 'UNION掲示板');
        if (boardPosts.length === 0) {
            carousel.innerHTML = '<p class="text-gray-500">掲示板記事はありません。</p>';
            return;
        }
        let idx = 0;
        function render() {
            const post = boardPosts[idx];
            carousel.innerHTML = `
                <div class="bg-white rounded-lg shadow p-6 flex flex-col items-center text-gray-900 relative">
                    <button id="carouselPrev" class="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full px-2 py-1">&#8592;</button>
                    <button id="carouselNext" class="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-200 rounded-full px-2 py-1">&#8594;</button>
                    <h3 class="text-xl font-bold text-primary mb-2">${post.title}</h3>
                    <p class="text-sm text-gray-600 mb-2">著者: ${post.author} | 投稿日: ${new Date(post.publishedAt).toLocaleDateString()}</p>
                    <div class="mb-2">${post.content.replace(/\n/g, '<br>')}</div>
                    <div class="text-xs text-gray-500">タグ: ${(post.tags || []).join(', ')}</div>
                </div>
            `;
            document.getElementById('carouselPrev').onclick = () => { idx = (idx - 1 + boardPosts.length) % boardPosts.length; render(); };
            document.getElementById('carouselNext').onclick = () => { idx = (idx + 1) % boardPosts.length; render(); };
        }
        render();
    } catch (e) {
        carousel.innerHTML = '<p class="text-red-600">掲示板記事の取得に失敗しました。</p>';
    }
}
window.addEventListener('DOMContentLoaded', renderBoardCarousel); 