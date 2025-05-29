const path = require('path');
const fs = require('fs').promises;

/**
 * 単一ファイルをアップロードする
 * @route POST /api/upload
 * @access Private
 */
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'ファイルがアップロードされていません',
        error: null
      });
    }

    // アップロードされたファイルのパスを構築
    const relativePath = req.file.path.replace(/\\/g, '/');
    const fileUrl = `${req.protocol}://${req.get('host')}/${relativePath}`;

    // レスポンス
    res.status(201).json({
      status: 'success',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: relativePath,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('ファイルアップロードエラー:', error);
    res.status(500).json({
      message: 'ファイルのアップロード中にエラーが発生しました。',
      error
    });
  }
};

/**
 * 複数のファイルをアップロードする
 * @route POST /api/upload/multiple
 * @access Private
 */
exports.uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'ファイルがアップロードされていません。'
      });
    }

    // 各ファイルの情報を整形
    const files = req.files.map(file => {
      const relativePath = file.path.replace(/\\/g, '/');
      const fileUrl = `${req.protocol}://${req.get('host')}/${relativePath}`;
      
      return {
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: relativePath,
        url: fileUrl
      };
    });

    // レスポンス
    res.status(201).json({
      status: 'success',
      files: files
    });
  } catch (error) {
    console.error('複数ファイルアップロードエラー:', error);
    res.status(500).json({
      status: 'error',
      message: '複数ファイルのアップロード中にエラーが発生しました。'
    });
  }
};

/**
 * ファイルを削除する
 * @route DELETE /api/upload/:filename
 * @access Private
 */
exports.deleteFile = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      return res.status(400).json({
        status: 'error',
        message: 'ファイル名が指定されていません。'
      });
    }
    
    // ファイル名に不正なパスが含まれていないか確認（セキュリティ対策）
    if (filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({
        status: 'error',
        message: '不正なファイル名です。'
      });
    }
    
    // ファイルを探す
    const directories = ['uploads/news', 'uploads/posts', 'uploads/profiles'];
    let filePath = null;
    
    for (const dir of directories) {
      const testPath = path.join(dir, filename);
      try {
        await fs.access(testPath);
        filePath = testPath;
        break;
      } catch (error) {
        // ファイルが見つからない場合は次のディレクトリを確認
      }
    }
    
    if (!filePath) {
      return res.status(404).json({
        status: 'error',
        message: 'ファイルが見つかりません。'
      });
    }
    
    // ファイル削除
    await fs.unlink(filePath);
    
    res.status(200).json({
      status: 'success',
      message: 'ファイルを削除しました。'
    });
  } catch (error) {
    console.error('ファイル削除エラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'ファイルの削除中にエラーが発生しました。'
    });
  }
};

/**
 * 特定のディレクトリ内のファイル一覧を取得
 * @route GET /api/upload/:directory
 * @access Private
 */
exports.getFileList = async (req, res) => {
  try {
    const { directory } = req.params;
    
    // 許可されたディレクトリのみアクセス可能
    const allowedDirectories = ['news', 'posts', 'profiles'];
    
    if (!allowedDirectories.includes(directory)) {
      return res.status(400).json({
        status: 'error',
        message: '指定されたディレクトリは無効です。'
      });
    }
    
    const dirPath = path.join('uploads', directory);
    
    // ディレクトリ内のファイル一覧を取得
    const files = await fs.readdir(dirPath);
    
    // ファイル情報を取得
    const fileList = await Promise.all(files.map(async (filename) => {
      const filePath = path.join(dirPath, filename);
      const stats = await fs.stat(filePath);
      const relativePath = filePath.replace(/\\/g, '/');
      
      return {
        filename,
        path: relativePath,
        url: `${req.protocol}://${req.get('host')}/${relativePath}`,
        size: stats.size,
        created: stats.birthtimeMs,
        modified: stats.mtimeMs
      };
    }));
    
    // 変更日時の降順でソート
    fileList.sort((a, b) => b.modified - a.modified);
    
    res.status(200).json({
      status: 'success',
      directory,
      files: fileList
    });
  } catch (error) {
    console.error('ファイル一覧取得エラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'ファイル一覧の取得中にエラーが発生しました。'
    });
  }
}; 