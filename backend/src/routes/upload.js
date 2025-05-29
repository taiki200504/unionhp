const express = require('express');
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Upload
 *   description: アップロードAPI
 */

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: ファイルアップロード
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: アップロード成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Upload'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Upload:
 *       type: object
 *       properties:
 *         filename:
 *           type: string
 *           example: "example.jpg"
 *         originalname:
 *           type: string
 *           example: "original.jpg"
 *         mimetype:
 *           type: string
 *           example: "image/jpeg"
 *         size:
 *           type: integer
 *           example: 1024
 *         path:
 *           type: string
 *           example: "/uploads/example.jpg"
 *         url:
 *           type: string
 *           example: "https://example.com/uploads/example.jpg"
 */

// 認証が必要なルート
router.use(auth.protect);

// 単一ファイルのアップロード
router.post('/', upload.uploadOptionalSingle, uploadController.uploadFile);

// 複数ファイルのアップロード
router.post('/multiple', upload.uploadOptionalMultiple, uploadController.uploadMultipleFiles);

// ディレクトリ内のファイル一覧を取得（管理者・編集者のみ）
router.get('/list/:directory', checkRole(['admin', 'editor']), uploadController.getFileList);

// ファイルの削除（所有者または管理者のみ）
router.delete('/:filename', checkRole(['admin', 'editor']), uploadController.deleteFile);

module.exports = router; 