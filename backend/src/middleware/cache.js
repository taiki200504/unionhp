const redis = require('redis');
const { promisify } = require('util');

// Redisクライアントの設定
const client = redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

// RedisコマンドをPromise化
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const delAsync = promisify(client.del).bind(client);

// キャッシュミドルウェア
const cache = (duration) => {
  return async (req, res, next) => {
    // キャッシュキーの生成
    const key = `__express__${req.originalUrl || req.url}`;

    try {
      // キャッシュからデータを取得
      const cachedResponse = await getAsync(key);

      if (cachedResponse) {
        // キャッシュヒットの場合
        const data = JSON.parse(cachedResponse);
        return res.json(data);
      }

      // キャッシュミスの場合、レスポンスをキャッシュ
      const originalJson = res.json;
      res.json = function(body) {
        setAsync(key, JSON.stringify(body), 'EX', duration);
        return originalJson.call(this, body);
      };

      next();
    } catch (error) {
      console.error('Cache error:', error);
      next();
    }
  };
};

// キャッシュのクリア
const clearCache = async (pattern) => {
  try {
    const keys = await promisify(client.keys).bind(client)(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map(key => delAsync(key)));
    }
  } catch (error) {
    console.error('Clear cache error:', error);
  }
};

// キャッシュの無効化
const invalidateCache = (patterns) => {
  return async (req, res, next) => {
    await next();

    if (patterns && patterns.length > 0) {
      await Promise.all(patterns.map(pattern => clearCache(pattern)));
    }
  };
};

// キャッシュの状態確認
const getCacheStatus = async () => {
  try {
    const info = await promisify(client.info).bind(client)();
    return {
      connected: client.connected,
      info: info
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
};

module.exports = {
  cache,
  clearCache,
  invalidateCache,
  getCacheStatus
}; 