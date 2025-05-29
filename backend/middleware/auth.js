/**
 * 認証関連のミドルウェア
 */
const jwt = require('jsonwebtoken');
const { User } = require('../schema/user-schema');

// JWT シークレットキー
const JWT_SECRET = process.env.JWT_SECRET || 'union-cms-secret-key';

/**
 * 認証確認ミドルウェア
 * リクエストヘッダーからトークンを検証し、ユーザー情報をreq.userに設定
 */
const authMiddleware = async (req, res, next) => {
  try {
    // リクエストヘッダーからトークンを取得
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication token is required'
      });
    }
    
    // トークンの取得
    const token = authHeader.split(' ')[1];
    
    // トークンの検証
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // ユーザーの検索
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found'
      });
    }
    
    // ユーザーが非アクティブの場合
    if (!user.active) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User account is deactivated'
      });
    }
    
    // リクエストオブジェクトにユーザー情報を設定
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Token expired'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Authentication failed'
    });
  }
};

/**
 * 管理者権限確認ミドルウェア
 * ユーザーが管理者権限を持っているか確認
 */
const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Admin access required'
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Authorization check failed'
    });
  }
};

/**
 * 編集者権限確認ミドルウェア
 * ユーザーが管理者か編集者権限を持っているか確認
 */
const editorMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    if (req.user.role !== 'admin' && req.user.role !== 'editor') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Editor access required'
      });
    }
    
    next();
  } catch (error) {
    console.error('Editor middleware error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Authorization check failed'
    });
  }
};

/**
 * 著者権限確認ミドルウェア
 * 著者以上の権限を持っているか確認（admin, editor, author）
 */
const authorMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
    }
    
    const allowedRoles = ['admin', 'editor', 'author'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Author access required'
      });
    }
    
    next();
  } catch (error) {
    console.error('Author middleware error:', error);
    return res.status(500).json({
      error: 'Server Error',
      message: 'Authorization check failed'
    });
  }
};

/**
 * オプショナル認証ミドルウェア
 * トークンがある場合はユーザー情報をreq.userに設定、ない場合はそのまま通過
 */
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    // リクエストヘッダーからトークンを取得
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // トークンがなければそのまま次へ
      return next();
    }
    
    // トークンの取得
    const token = authHeader.split(' ')[1];
    
    // トークンの検証
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // ユーザーの検索
    const user = await User.findById(decoded.id).select('-password');
    if (user && user.active) {
      // リクエストオブジェクトにユーザー情報を設定
      req.user = user;
    }
    
    next();
  } catch (error) {
    // 認証エラー時はユーザー情報なしでそのまま次へ
    next();
  }
};

// JWTトークン生成関数
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

module.exports = {
  authMiddleware,
  adminMiddleware,
  editorMiddleware,
  authorMiddleware,
  optionalAuthMiddleware,
  generateToken
}; 