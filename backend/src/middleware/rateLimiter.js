const rateLimit = require('express-rate-limit');

// 一般API用のレート制限
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // IPアドレスごとに15分で100リクエストまで
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// 認証関連API用のレート制限（より厳しい制限）
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1時間
  max: 5, // IPアドレスごとに1時間で5リクエストまで
  message: 'Too many login attempts, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

// 管理者API用のレート制限
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 50, // IPアドレスごとに15分で50リクエストまで
  message: 'Too many admin requests, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  adminLimiter,
}; 