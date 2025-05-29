const jwt = require('jsonwebtoken');
const User = require('../models/user');

// JWTトークンの検証
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: '認証が必要です' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: 'ユーザーが見つかりません' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: '無効なトークンです' });
  }
};

// 管理者権限の確認
const requireAdmin = async (req, res, next) => {
  try {
    await verifyToken(req, res, () => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: '管理者権限が必要です' });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: '認証が必要です' });
  }
};

module.exports = {
  verifyToken,
  requireAdmin
}; 