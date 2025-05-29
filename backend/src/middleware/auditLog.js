const AuditLog = require('../models/AuditLog');

/**
 * 監査ログを記録するミドルウェア
 * @param {string} action - 操作名（例: 'delete', 'update'など）
 * @param {string} resource - リソース名（例: 'news', 'user'など）
 * @returns {function} Expressミドルウェア
 */
function auditLog(action, resource) {
  return async (req, res, next) => {
    res.on('finish', async () => {
      // 成功時のみ記録（必要に応じて失敗も記録可）
      if (res.statusCode >= 200 && res.statusCode < 300) {
        await AuditLog.create({
          user: req.user ? req.user._id : null,
          action,
          resource,
          resourceId: req.params.id || null,
          details: JSON.stringify(req.body),
          ip: req.ip,
          userAgent: req.headers['user-agent']
        });
      }
    });
    next();
  };
}

module.exports = auditLog; 