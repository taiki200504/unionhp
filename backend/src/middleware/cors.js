const cors = require('cors');

const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    process.env.ADMIN_URL || 'http://localhost:3002'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // 24時間
};

module.exports = cors(corsOptions); 