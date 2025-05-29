const prometheus = require('prom-client');
const winston = require('winston');
const { ElasticsearchTransport } = require('winston-elasticsearch');

// Prometheusメトリクスの設定
const collectDefaultMetrics = prometheus.collectDefaultMetrics;
collectDefaultMetrics({ timeout: 5000 });

// カスタムメトリクスの定義
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5]
});

const activeConnections = new prometheus.Gauge({
  name: 'active_connections',
  help: 'Number of active database connections'
});

const memoryUsage = new prometheus.Gauge({
  name: 'memory_usage_bytes',
  help: 'Memory usage in bytes',
  labelNames: ['type']
});

const errorCount = new prometheus.Counter({
  name: 'error_count_total',
  help: 'Total number of errors',
  labelNames: ['type']
});

// ロガーの設定
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'backend' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new ElasticsearchTransport({
      level: 'info',
      index: 'logs',
      clientOpts: { node: process.env.ELASTICSEARCH_URL }
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// パフォーマンスモニタリングミドルウェア
const monitoringMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    httpRequestDuration
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration / 1000);

    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration
    });
  });

  next();
};

// メモリ使用量の監視
const monitorMemoryUsage = () => {
  const usage = process.memoryUsage();
  memoryUsage.labels('heapUsed').set(usage.heapUsed);
  memoryUsage.labels('heapTotal').set(usage.heapTotal);
  memoryUsage.labels('rss').set(usage.rss);
  memoryUsage.labels('external').set(usage.external);
};

// エラーハンドリング
const handleError = (error, req, res, next) => {
  errorCount.inc({ type: error.name });
  
  logger.error('Error occurred', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    request: {
      method: req.method,
      path: req.path,
      body: req.body,
      user: req.user
    }
  });

  next(error);
};

// データベース接続の監視
const monitorDatabaseConnections = (mongoose) => {
  const updateConnectionCount = () => {
    const count = mongoose.connection.base.connections.length;
    activeConnections.set(count);
  };

  mongoose.connection.on('connected', updateConnectionCount);
  mongoose.connection.on('disconnected', updateConnectionCount);
};

// パフォーマンスメトリクスのエンドポイント
const metricsEndpoint = async (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(await prometheus.register.metrics());
};

module.exports = {
  monitoringMiddleware,
  monitorMemoryUsage,
  handleError,
  monitorDatabaseConnections,
  metricsEndpoint,
  logger
}; 