const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const News = require('../models/news');
const Category = require('../models/category');
const User = require('../models/user');
const { generateToken } = require('../utils/auth');

let adminToken;
let testCategories;
let testNews;
let testUsers;

// テストデータの準備
beforeAll(async () => {
  adminToken = generateToken({ role: 'admin' });

  // カテゴリーの作成
  testCategories = await Category.create([
    { name: 'カテゴリー1', slug: 'category-1' },
    { name: 'カテゴリー2', slug: 'category-2' },
    { name: 'カテゴリー3', slug: 'category-3' }
  ]);

  // ニュースの作成
  const newsData = Array.from({ length: 1000 }, (_, i) => ({
    title: `ニュース${i + 1}`,
    content: `コンテンツ${i + 1}`,
    category: testCategories[i % 3]._id,
    status: 'published'
  }));

  testNews = await News.create(newsData);

  // ユーザーの作成
  const userData = Array.from({ length: 100 }, (_, i) => ({
    email: `user${i + 1}@example.com`,
    password: 'password123',
    role: 'user',
    name: `ユーザー${i + 1}`
  }));

  testUsers = await User.create(userData);
});

afterAll(async () => {
  await News.deleteMany({});
  await Category.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Load Tests', () => {
  describe('News API Load Tests', () => {
    it('should handle high concurrent read requests', async () => {
      const numRequests = 100;
      const requests = Array.from({ length: numRequests }, () =>
        request(app)
          .get('/news')
          .query({ page: 1, limit: 10 })
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // すべてのリクエストが成功することを確認
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // 100リクエストを2秒以内に処理
      expect(totalTime).toBeLessThan(2000);
    });

    it('should handle high concurrent write requests', async () => {
      const numRequests = 50;
      const requests = Array.from({ length: numRequests }, (_, i) =>
        request(app)
          .post('/news')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            title: `負荷テストニュース${i + 1}`,
            content: `負荷テストコンテンツ${i + 1}`,
            category: testCategories[0]._id,
            status: 'draft'
          })
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // すべてのリクエストが成功することを確認
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // 50リクエストを5秒以内に処理
      expect(totalTime).toBeLessThan(5000);
    });

    it('should handle mixed read/write load', async () => {
      const numReadRequests = 50;
      const numWriteRequests = 10;

      const readRequests = Array.from({ length: numReadRequests }, () =>
        request(app)
          .get('/news')
          .query({ page: 1, limit: 10 })
      );

      const writeRequests = Array.from({ length: numWriteRequests }, (_, i) =>
        request(app)
          .post('/news')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            title: `混合負荷テストニュース${i + 1}`,
            content: `混合負荷テストコンテンツ${i + 1}`,
            category: testCategories[0]._id,
            status: 'draft'
          })
      );

      const startTime = Date.now();
      const [readResponses, writeResponses] = await Promise.all([
        Promise.all(readRequests),
        Promise.all(writeRequests)
      ]);
      const totalTime = Date.now() - startTime;

      // すべてのリクエストが成功することを確認
      readResponses.forEach(response => {
        expect(response.status).toBe(200);
      });
      writeResponses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // 混合リクエストを3秒以内に処理
      expect(totalTime).toBeLessThan(3000);
    });
  });

  describe('User API Load Tests', () => {
    it('should handle high concurrent user registrations', async () => {
      const numRequests = 20;
      const requests = Array.from({ length: numRequests }, (_, i) =>
        request(app)
          .post('/auth/register')
          .send({
            email: `loadtest${i + 1}@example.com`,
            password: 'password123',
            role: 'user'
          })
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // すべてのリクエストが成功することを確認
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // 20リクエストを3秒以内に処理
      expect(totalTime).toBeLessThan(3000);
    });

    it('should handle high concurrent user logins', async () => {
      const numRequests = 50;
      const requests = Array.from({ length: numRequests }, (_, i) =>
        request(app)
          .post('/auth/login')
          .send({
            email: `user${i + 1}@example.com`,
            password: 'password123'
          })
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // すべてのリクエストが成功することを確認
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });

      // 50リクエストを2秒以内に処理
      expect(totalTime).toBeLessThan(2000);
    });
  });

  describe('System Resource Tests', () => {
    it('should maintain stable memory usage under load', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // 大量のリクエストを実行
      const requests = Array.from({ length: 200 }, () =>
        request(app)
          .get('/news')
          .query({ page: 1, limit: 10 })
      );

      await Promise.all(requests);

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // メモリ使用量の増加が200MB以内であることを確認
      expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024);
    });

    it('should handle database connection pool efficiently', async () => {
      const numConnections = 50;
      const connections = Array.from({ length: numConnections }, () =>
        mongoose.createConnection(process.env.MONGODB_URI)
      );

      const startTime = Date.now();
      await Promise.all(connections.map(conn => conn.asPromise()));
      const totalTime = Date.now() - startTime;

      // 50接続を2秒以内に確立
      expect(totalTime).toBeLessThan(2000);

      // 接続を閉じる
      await Promise.all(connections.map(conn => conn.close()));
    });
  });

  describe('Error Handling Under Load', () => {
    it('should handle invalid requests gracefully under load', async () => {
      const numRequests = 100;
      const requests = Array.from({ length: numRequests }, (_, i) =>
        request(app)
          .get('/news')
          .query({ page: i % 2 === 0 ? 'invalid' : 1, limit: 10 })
      );

      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // すべてのリクエストが適切なステータスコードを返すことを確認
      responses.forEach((response, i) => {
        if (i % 2 === 0) {
          expect(response.status).toBe(400);
        } else {
          expect(response.status).toBe(200);
        }
      });

      // 100リクエストを2秒以内に処理
      expect(totalTime).toBeLessThan(2000);
    });
  });
}); 