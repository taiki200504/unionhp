const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const auditLog = require('../middleware/auditLog');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: ユーザーAPI
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: ユーザー一覧取得
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: ユーザー一覧
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *   post:
 *     summary: ユーザー新規作成
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: 作成成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: バリデーションエラー
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "バリデーションエラー"
 *                 error:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "メールアドレスは必須です"
 *                       param:
 *                         type: string
 *                         example: "email"
 *                       location:
 *                         type: string
 *                         example: "body"
 *       401:
 *         description: 認証エラー
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "認証が必要です"
 *                 error:
 *                   type: string
 *                   example: null
 *       403:
 *         description: 権限エラー
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "権限がありません"
 *                 error:
 *                   type: string
 *                   example: null
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: ユーザー詳細取得
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ユーザー詳細
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *   patch:
 *     summary: ユーザー更新
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: バリデーションエラー
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "バリデーションエラー"
 *                 error:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "メールアドレスは必須です"
 *                       param:
 *                         type: string
 *                         example: "email"
 *                       location:
 *                         type: string
 *                         example: "body"
 *       401:
 *         description: 認証エラー
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "認証が必要です"
 *                 error:
 *                   type: string
 *                   example: null
 *       403:
 *         description: 権限エラー
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "権限がありません"
 *                 error:
 *                   type: string
 *                   example: null
 *       404:
 *         description: リソース未発見
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ユーザーが見つかりません。"
 *                 error:
 *                   type: string
 *                   example: null
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "60f7c2b8e1b1c8a1b8e1b1e0"
 *         name:
 *           type: string
 *           example: "山田太郎"
 *         email:
 *           type: string
 *           example: "yamada@example.com"
 *         organizationName:
 *           type: string
 *           example: "UNION大学"
 *         organizationType:
 *           type: string
 *           example: "academic"
 *         role:
 *           type: string
 *           example: "admin"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2024-03-31T10:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2024-04-01T12:00:00Z"
 */

// すべてのルートで認証が必要
router.use(authMiddleware.protect);

// ユーザー更新バリデーション
const userUpdateValidation = [
  check('name', '名前は必須です').optional().not().isEmpty(),
  check('email', '有効なメールアドレスを入力してください').optional().isEmail(),
  check('organizationName', '団体名は必須です').optional().not().isEmpty(),
  check('organizationType', '無効な団体種別です').optional().isIn(['academic', 'environment', 'volunteer', 'culture', 'startup', 'art', 'international', 'other'])
];

// 管理者専用ルート
router.get('/', authMiddleware.restrictTo('admin'), userController.getAllUsers);
router.patch('/:id/role', authMiddleware.restrictTo('admin'), userController.updateUserRole);

// ユーザールート
router.get('/:id', userController.getUser);
router.patch('/:id', userUpdateValidation, userController.updateUser);
router.patch('/:id/password', userController.updatePassword);
router.delete('/:id', auditLog('delete', 'user'), userController.deleteUser);

module.exports = router; 