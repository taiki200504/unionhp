const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = require('../middleware/auth');

// ユーザー登録
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ユーザーの存在確認
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'このユーザー名またはメールアドレスは既に使用されています' });
    }

    // 新規ユーザーの作成
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    // JWTトークンの生成
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'ユーザー登録が完了しました',
      token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    res.status(400).json({ message: 'ユーザー登録に失敗しました', error: error.message });
  }
});

// ログイン
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // ユーザーの検索
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // パスワードの検証
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }

    // 最終ログイン時間の更新
    user.lastLogin = new Date();
    await user.save();

    // JWTトークンの生成
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'ログインに成功しました',
      token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    res.status(500).json({ message: 'ログインに失敗しました', error: error.message });
  }
});

// ユーザー情報の取得
router.get('/me', auth.verifyToken, async (req, res) => {
  try {
    res.json(req.user.toPublicJSON());
  } catch (error) {
    res.status(500).json({ message: 'ユーザー情報の取得に失敗しました', error: error.message });
  }
});

// パスワードの変更
router.put('/change-password', auth.verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // 現在のパスワードの検証
    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: '現在のパスワードが正しくありません' });
    }

    // パスワードの更新
    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'パスワードを変更しました' });
  } catch (error) {
    res.status(400).json({ message: 'パスワードの変更に失敗しました', error: error.message });
  }
});

module.exports = router; 