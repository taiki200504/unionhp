const winston = require('winston');
const path = require('path');

// ログのフォーマット設定
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 開発環境用のコンソール出力フォーマット
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple()
);

// ロガーの設定
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  transports: [
    // エラーログ
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 全ログ
    new winston.transports.File({
      filename: path.join('logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// 開発環境の場合はコンソールにも出力
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

// ログ出力用のストリーム
const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = {
  logger,
  stream,
}; 