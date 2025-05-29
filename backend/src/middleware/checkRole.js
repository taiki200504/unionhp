/**
 * 特定のロールを持つユーザーのみアクセスを許可するミドルウェア
 * @param {Array} roles - 許可するロールの配列
 * @returns {Function} Express ミドルウェア関数
 */
const checkRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: '認証されていません。ログインしてください。'
      });
    }

    // ユーザーのロールが許可されているかチェック
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'この操作を実行する権限がありません。'
      });
    }

    // 権限があれば次のミドルウェアに進む
    next();
  };
};

module.exports = checkRole; 