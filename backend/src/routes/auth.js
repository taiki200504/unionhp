const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcrypt');

const router = express.Router();

// 登録バリデーション
const registerValidation = [
  check('name', '名前は必須です').not().isEmpty(),
  check('email', '有効なメールアドレスを入力してください').isEmail(),
  check('password', 'パスワードは6文字以上必要です').isLength({ min: 6 }),
  check('role', '無効な役割です').optional().isIn(['admin', 'editor', 'organization']),
  check('organizationName', '団体名は必須です').optional().not().isEmpty(),
  check('organizationType', '無効な団体種別です').optional().isIn(['academic', 'environment', 'volunteer', 'culture', 'startup', 'art', 'international', 'other'])
];

// 認証ルート
router.post('/register', registerValidation, authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware.protect, authController.getCurrentUser);

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, organizationName, organizationType, role } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: '既にこのメールアドレスのユーザーが存在します' });
    }
    const user = new User({
      email,
      password,
      name,
      organizationName,
      organizationType,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await user.save();
    res.status(201).json({ success: true, message: '管理者アカウントを作成しました' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router; 