const { validationResult } = require('express-validator');
const User = require('../models/User');

// 全ユーザーの取得（管理者専用）
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
    res.status(200).json({
      status: 'success',
      results: users.length,
      users
    });
  } catch (error) {
    console.error('ユーザー取得エラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'ユーザーの取得中にエラーが発生しました。',
      error
    });
  }
};

// 特定のユーザーを取得
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'ユーザーが見つかりません。',
        error: null
      });
    }
    
    res.status(200).json({
      status: 'success',
      user
    });
  } catch (error) {
    console.error('ユーザー取得エラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'ユーザーの取得中にエラーが発生しました。',
      error
    });
  }
};

// ユーザーを更新（自分自身または管理者のみ）
exports.updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'バリデーションエラー', error: errors.array() });
    }
    
    // パスワードとロールは直接更新不可（別のエンドポイントで処理）
    const { password, role, ...updateData } = req.body;
    
    // 自分自身または管理者のみ更新可能
    if (req.params.id !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'このユーザーを更新する権限がありません。'
      });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'ユーザーが見つかりません。'
      });
    }
    
    res.status(200).json({
      status: 'success',
      user: updatedUser
    });
  } catch (error) {
    console.error('ユーザー更新エラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'ユーザーの更新中にエラーが発生しました。',
      error
    });
  }
};

// ユーザーのロールを更新（管理者専用）
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['admin', 'editor', 'organization'].includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: '有効な役割を指定してください。'
      });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({
        status: 'error',
        message: 'ユーザーが見つかりません。'
      });
    }
    
    res.status(200).json({
      status: 'success',
      user: updatedUser
    });
  } catch (error) {
    console.error('ユーザー役割更新エラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'ユーザーの役割更新中にエラーが発生しました。',
      error
    });
  }
};

// パスワード変更
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: '現在のパスワードと新しいパスワードを入力してください。'
      });
    }
    
    // 自分自身のパスワードのみ変更可能
    if (req.params.id !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'このユーザーのパスワードを変更する権限がありません。'
      });
    }
    
    // ユーザーの取得（パスワードを含む）
    const user = await User.findById(req.params.id).select('+password');
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'ユーザーが見つかりません。'
      });
    }
    
    // 現在のパスワードの確認（管理者を除く）
    if (req.user.role !== 'admin') {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({
          status: 'error',
          message: '現在のパスワードが正しくありません。'
        });
      }
    }
    
    // パスワードの更新
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      status: 'success',
      message: 'パスワードが更新されました。'
    });
  } catch (error) {
    console.error('パスワード更新エラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'パスワードの更新中にエラーが発生しました。',
      error
    });
  }
};

// ユーザーを削除（または非アクティブにする）
exports.deleteUser = async (req, res) => {
  try {
    // 自分自身または管理者のみ削除可能
    if (req.params.id !== req.user.id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 'error',
        message: 'このユーザーを削除する権限がありません。'
      });
    }
    
    // 実際には削除せず、非アクティブにする
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'ユーザーが見つかりません。'
      });
    }
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    console.error('ユーザー削除エラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'ユーザーの削除中にエラーが発生しました。',
      error
    });
  }
}; 