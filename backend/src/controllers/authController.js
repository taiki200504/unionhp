const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

// JWTトークンの生成
const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// ユーザー登録
exports.register = async (req, res) => {
  try {
    // バリデーションエラーのチェック
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 既存のユーザーのチェック
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'このメールアドレスは既に使用されています。'
      });
    }

    // 新しいユーザーの作成
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role || 'organization',
      organizationName: req.body.organizationName,
      organizationType: req.body.organizationType
    });

    // パスワードを除外してユーザー情報を返す
    const user = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      organizationName: newUser.organizationName,
      organizationType: newUser.organizationType
    };

    // トークンの生成
    const token = signToken(newUser._id);

    // 応答の送信
    res.status(201).json({
      status: 'success',
      token,
      user
    });
  } catch (error) {
    console.error('ユーザー登録エラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'ユーザー登録中にエラーが発生しました。'
    });
  }
};

// ログイン
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // メールとパスワードのチェック
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'メールアドレスとパスワードを入力してください。'
      });
    }

    // ユーザーの検索（パスワードを含む）
    const user = await User.findOne({ email }).select('+password');

    // ユーザーが存在しないか、パスワードが正しくない場合
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'メールアドレスまたはパスワードが正しくありません。'
      });
    }

    // ユーザー情報（パスワードを除く）
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationName: user.organizationName,
      organizationType: user.organizationType
    };

    // トークンの生成
    const token = signToken(user._id);

    // 応答の送信
    res.status(200).json({
      status: 'success',
      token,
      user: userData
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'ログイン中にエラーが発生しました。'
    });
  }
};

// 現在のユーザー情報の取得
exports.getCurrentUser = async (req, res) => {
  try {
    // req.userは認証ミドルウェアによって設定される
    const user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      organizationName: req.user.organizationName,
      organizationType: req.user.organizationType,
      profileImage: req.user.profileImage,
      contactInfo: req.user.contactInfo
    };

    res.status(200).json({
      status: 'success',
      user
    });
  } catch (error) {
    console.error('ユーザー情報取得エラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'ユーザー情報の取得中にエラーが発生しました。'
    });
  }
}; 