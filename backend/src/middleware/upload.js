const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('./errorHandler');

// アップロードの基本設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    // リクエストパスに基づいてアップロードディレクトリを決定
    if (req.baseUrl.includes('/news')) {
      uploadPath += 'news/';
    } else if (req.baseUrl.includes('/posts')) {
      uploadPath += 'posts/';
    } else if (req.baseUrl.includes('/users') || req.baseUrl.includes('/auth')) {
      uploadPath += 'profiles/';
    }
    
    // ディレクトリがなければ作成
    fs.mkdirSync(uploadPath, { recursive: true });
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // ファイル名の衝突を避けるためUUIDとタイムスタンプを使用
    const uniquePrefix = `${Date.now()}-${uuidv4()}`;
    // 元のファイル名から拡張子を取得
    const ext = path.extname(file.originalname).toLowerCase();
    
    cb(null, `${uniquePrefix}${ext}`);
  }
});

// ファイルフィルター（許可するファイルタイプの制限）
const fileFilter = (req, file, cb) => {
  // 許可するファイルタイプ
  const allowedFileTypes = /jpeg|jpg|png|gif|webp|svg|pdf|doc|docx|xls|xlsx|ppt|pptx/;
  // 拡張子のチェック
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
  // MIMEタイプのチェック
  const mimetype = file.mimetype.startsWith('image/') || 
                   file.mimetype.startsWith('application/pdf') ||
                   file.mimetype.includes('officedocument') ||
                   file.mimetype === 'application/msword';
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    return cb(new Error('サポートされていないファイル形式です。画像(.jpg, .jpeg, .png, .gif, .webp, .svg)、PDF、およびOfficeファイル(.doc, .docx, .xls, .xlsx, .ppt, .pptx)のみアップロード可能です。'), false);
  }
};

// 最大ファイルサイズの設定（10MB）
const limits = {
  fileSize: 10 * 1024 * 1024
};

// 単一ファイルアップロード用ミドルウェア
const uploadSingle = multer({
  storage,
  fileFilter,
  limits
}).single('file');

// 複数ファイルアップロード用ミドルウェア（最大5ファイル）
const uploadMultiple = multer({
  storage,
  fileFilter,
  limits
}).array('files', 5);

// ファイルが必須でない単一ファイルアップロード
const uploadOptionalSingle = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'ファイルアップロードエラー: ' + err.message 
      });
    } else if (err) {
      return res.status(400).json({ 
        status: 'error', 
        message: err.message
      });
    }
    next();
  });
};

// ファイルが必須でない複数ファイルアップロード
const uploadOptionalMultiple = (req, res, next) => {
  uploadMultiple(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'ファイルアップロードエラー: ' + err.message 
      });
    } else if (err) {
      return res.status(400).json({ 
        status: 'error', 
        message: err.message 
      });
    }
    next();
  });
};

// ストレージ設定
const storageImage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// ファイルフィルター
const fileFilterImage = (req, file, cb) => {
  // 許可する画像形式
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only JPEG, PNG, GIF and WebP images are allowed.', 400), false);
  }
};

// アップロード設定
const uploadImage = multer({
  storage: storageImage,
  fileFilter: fileFilterImage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

// 画像アップロード用のミドルウェア
const uploadImageSingle = uploadImage.single('image');

// エラーハンドリング
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File size too large. Maximum size is 5MB.', 400));
    }
    return next(new AppError(err.message, 400));
  }
  next(err);
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  uploadOptionalSingle,
  uploadOptionalMultiple,
  uploadImageSingle,
  handleUploadError
}; 