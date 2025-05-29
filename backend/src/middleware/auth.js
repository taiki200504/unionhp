const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT認証ミドルウェア
exports.protect = async (req, res, next) => {
  let token;

  // トークンの取得（Authorization ヘッダーから）
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // トークンが存在しない場合
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: '認証されていません。ログインしてください。'
    });
  }

  try {
    // トークンの検証
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ユーザーの取得
    const currentUser = await User.findById(decoded.id);

    // ユーザーが存在しない場合
    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'このトークンのユーザーは存在しません。'
      });
    }

    // リクエストオブジェクトにユーザー情報を設定
    req.user = currentUser;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: '認証に失敗しました。ログインしてください。'
    });
  }
};

// 権限確認ミドルウェア
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'この操作を実行する権限がありません。'
      });
    }
    next();
  };
}; 