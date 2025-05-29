const express = require('express');
const searchController = require('../controllers/searchController');

const router = express.Router();

// 検索エンドポイント
router.get('/', searchController.search);

// タグクラウドデータ取得
router.get('/tags', searchController.getTagCloud);

// アーカイブ（年月別記事数）データ取得
router.get('/archives', searchController.getArchives);

module.exports = router; 