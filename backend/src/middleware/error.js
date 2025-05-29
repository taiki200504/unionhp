const { ValidationError } = require('mongoose');
const { JsonWebTokenError } = require('jsonwebtoken');

// カスタムエラークラス
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// エラーハンドリングミドルウェア
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // 開発環境では詳細なエラー情報を返す
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // 本番環境では必要最小限の情報のみを返す
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } else {
      // プログラミングエラーや不明なエラーの場合
      console.error('ERROR 💥', err);
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      });
    }
  }
};

// バリデーションエラーの処理
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

// JWTエラーの処理
const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again!', 401);
};

// JWT有効期限切れの処理
const handleJWTExpiredError = () => {
  return new AppError('Your token has expired! Please log in again.', 401);
};

// 重複キーエラーの処理
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

// 無効なIDの処理
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// エラーの種類に応じた処理
const handleError = (err) => {
  if (err instanceof ValidationError) return handleValidationError(err);
  if (err instanceof JsonWebTokenError) return handleJWTError();
  if (err.name === 'TokenExpiredError') return handleJWTExpiredError();
  if (err.code === 11000) return handleDuplicateFieldsDB(err);
  if (err.name === 'CastError') return handleCastErrorDB(err);
  return err;
};

module.exports = {
  AppError,
  errorHandler,
  handleError
}; 