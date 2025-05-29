const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const News = require('../models/news');
const Category = require('../models/category');
const { generateToken } = require('../utils/auth');

let adminToken;
let testCategories;
let testNews;

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
  const newsData = Array.from({ length: 100 }, (_, i) => ({
    title: `ニュース${i + 1}`,
    content: `コンテンツ${i + 1}`,
    category: testCategories[i % 3]._id,
    status: 'published'
  }));

  testNews = await News.create(newsData);
});

afterAll(async () => {
  await News.deleteMany({});
  await Category.deleteMany({});
  await mongoose.connection.close();
});

describe('Performance Tests', () => {
  describe('News API Performance', () => {
    it('should handle pagination efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/news')
        .query({ page: 1, limit: 10 })
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(100); // 100ms以内にレスポンス
      expect(response.body.data).toHaveLength(10);
    });

    it('should handle filtering efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/news')
        .query({ category: testCategories[0]._id })
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(100);
      expect(response.body.data.every(news => 
        news.category.toString() === testCategories[0]._id.toString()
      )).toBe(true);
    });

    it('should handle search efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/news')
        .query({ search: 'ニュース1' })
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(100);
      expect(response.body.data.every(news => 
        news.title.includes('ニュース1')
      )).toBe(true);
    });
  });

  describe('Category API Performance', () => {
    it('should handle category listing efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .get('/categories')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(50); // 50ms以内にレスポンス
      expect(response.body.data).toHaveLength(3);
    });

    it('should handle category creation efficiently', async () => {
      const startTime = Date.now();
      
      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: '新規カテゴリー',
          slug: 'new-category'
        })
        .expect(201);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(responseTime).toBeLessThan(100);
    });
  });

  describe('Cache Performance', () => {
    it('should cache repeated requests', async () => {
      // 最初のリクエスト
      const firstStartTime = Date.now();
      await request(app)
        .get('/news')
        .query({ page: 1, limit: 10 })
        .expect(200);
      const firstResponseTime = Date.now() - firstStartTime;

      // 2回目のリクエスト（キャッシュヒット）
      const secondStartTime = Date.now();
      await request(app)
        .get('/news')
        .query({ page: 1, limit: 10 })
        .expect(200);
      const secondResponseTime = Date.now() - secondStartTime;

      // キャッシュヒットの方が高速であることを確認
      expect(secondResponseTime).toBeLessThan(firstResponseTime);
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle concurrent requests efficiently', async () => {
      const requests = Array.from({ length: 10 }, () =>
        request(app)
          .get('/news')
          .query({ page: 1, limit: 10 })
      );

      const startTime = Date.now();
      await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // 10個の同時リクエストを500ms以内に処理
      expect(totalTime).toBeLessThan(500);
    });
  });

  describe('Memory Usage', () => {
    it('should maintain stable memory usage', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // 複数のリクエストを実行
      for (let i = 0; i < 100; i++) {
        await request(app)
          .get('/news')
          .query({ page: 1, limit: 10 });
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // メモリ使用量の増加が100MB以内であることを確認
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });
  });
}); 