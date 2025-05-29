/**
 * 認証関連のAPIルート
 */
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { User, UserActivity } = require('../schema/user-schema');
const { authMiddleware, adminMiddleware, generateToken } = require('../middleware/auth');

/**
 * @route   POST /api/auth/login
 * @desc    ユーザーログイン
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // バリデーション
    if (!username || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Username and password are required'
      });
    }
    
    // ユーザー検索（メールアドレスまたはユーザー名で検索）
    const user = await User.findOne({
      $or: [
        { username: username },
        { email: username }
      ]
    });
    
    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      });
    }
    
    // アカウントが無効化されている場合
    if (!user.active) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Account is deactivated'
      });
    }
    
    // パスワード検証
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials'
      });
    }
    
    // ログイン日時の更新
    user.lastLogin = Date.now();
    await user.save();
    
    // アクティビティログの記録
    await UserActivity.create({
      user: user._id,
      action: 'login',
      resource: 'system',
      details: 'User logged in',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    // トークン生成
    const token = generateToken(user._id);
    
    // レスポンス
    res.status(200).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Login failed'
    });
  }
});

/**
 * @route   POST /api/auth/logout
 * @desc    ユーザーログアウト（クライアント側でトークンを破棄するため、主にログの記録用）
 * @access  Private
 */
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // アクティビティログの記録
    await UserActivity.create({
      user: req.user._id,
      action: 'logout',
      resource: 'system',
      details: 'User logged out',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Logout failed'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    現在のユーザー情報を取得
 * @access  Private
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to retrieve user information'
    });
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    新規ユーザー登録（管理者のみ）
 * @access  Private/Admin
 */
router.post('/register', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { username, email, password, name, role } = req.body;
    
    // バリデーション
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Username, email and password are required'
      });
    }
    
    // 既存ユーザーの確認
    const userExists = await User.findOne({
      $or: [
        { username: username },
        { email: email }
      ]
    });
    
    if (userExists) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Username or email already exists'
      });
    }
    
    // ユーザー作成
    const user = await User.create({
      username,
      email,
      password,
      name: name || username,
      role: role || 'contributor'
    });
    
    // アクティビティログの記録
    await UserActivity.create({
      user: req.user._id,
      action: 'create',
      resource: 'user',
      resourceId: user._id,
      details: `Created new user: ${username}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Registration failed'
    });
  }
});

/**
 * @route   POST /api/auth/change-password
 * @desc    パスワード変更
 * @access  Private
 */
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // バリデーション
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'New password must be at least 6 characters long'
      });
    }
    
    // ユーザー取得
    const user = await User.findById(req.user._id);
    
    // 現在のパスワード確認
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Current password is incorrect'
      });
    }
    
    // パスワード更新
    user.password = newPassword;
    await user.save();
    
    // アクティビティログの記録
    await UserActivity.create({
      user: user._id,
      action: 'update',
      resource: 'user',
      resourceId: user._id,
      details: 'User changed password',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to change password'
    });
  }
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    パスワードリセットリクエスト
 * @access  Public
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email is required'
      });
    }
    
    // ユーザー検索
    const user = await User.findOne({ email });
    if (!user) {
      // セキュリティのため、ユーザーが見つからなくても成功レスポンスを返す
      return res.status(200).json({
        success: true,
        message: 'If the email exists, a password reset link will be sent'
      });
    }
    
    // リセットトークン生成
    const resetToken = Math.random().toString(36).substring(2, 15) + 
                       Math.random().toString(36).substring(2, 15);
    
    // トークンの保存
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1時間有効
    await user.save();
    
    // TODO: メール送信処理
    // 実際の実装では、ここでメール送信処理を行う
    
    res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to process password reset request'
    });
  }
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    パスワードリセット実行
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Token and new password are required'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'New password must be at least 6 characters long'
      });
    }
    
    // トークンでユーザーを検索
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Password reset token is invalid or has expired'
      });
    }
    
    // パスワードの更新
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    // アクティビティログの記録
    await UserActivity.create({
      user: user._id,
      action: 'update',
      resource: 'user',
      resourceId: user._id,
      details: 'User reset password',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to reset password'
    });
  }
});

module.exports = router; 