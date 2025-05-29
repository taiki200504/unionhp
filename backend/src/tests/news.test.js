const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const News = require('../models/news');
const { generateToken } = require('../utils/auth');

let adminToken;
let testNews;

beforeAll(async () => {
  // テスト用の管理者トークンを生成
  adminToken = generateToken({ role: 'admin' });

  // テスト用のニュースデータを作成
  testNews = await News.create({
    title: 'テストニュース',
    content: 'テストコンテンツ',
    category: new mongoose.Types.ObjectId(),
    status: 'published'
  });
});

afterAll(async () => {
  // テストデータのクリーンアップ
  await News.deleteMany({});
  await mongoose.connection.close();
});

describe('News API', () => {
  describe('GET /news', () => {
    it('should return all news', async () => {
      const response = await request(app)
        .get('/news')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter news by category', async () => {
      const response = await request(app)
        .get('/news')
        .query({ category: testNews.category.toString() })
        .expect(200);

      expect(response.body.data[0].category.toString()).toBe(testNews.category.toString());
    });
  });

  describe('GET /news/:id', () => {
    it('should return news by id', async () => {
      const response = await request(app)
        .get(`/news/${testNews._id}`)
        .expect(200);

      expect(response.body.title).toBe(testNews.title);
    });

    it('should return 404 for non-existent news', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/news/${fakeId}`)
        .expect(404);
    });
  });

  describe('POST /news', () => {
    it('should create new news', async () => {
      const newsData = {
        title: '新規ニュース',
        content: '新規コンテンツ',
        category: testNews.category.toString(),
        status: 'draft'
      };

      const response = await request(app)
        .post('/news')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newsData)
        .expect(201);

      expect(response.body.title).toBe(newsData.title);
    });

    it('should require authentication', async () => {
      const newsData = {
        title: '新規ニュース',
        content: '新規コンテンツ'
      };

      await request(app)
        .post('/news')
        .send(newsData)
        .expect(401);
    });
  });

  describe('PATCH /news/:id', () => {
    it('should update news', async () => {
      const updateData = {
        title: '更新されたニュース',
        content: '更新されたコンテンツ'
      };

      const response = await request(app)
        .patch(`/news/${testNews._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
    });

    it('should require authentication', async () => {
      const updateData = {
        title: '更新されたニュース'
      };

      await request(app)
        .patch(`/news/${testNews._id}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('DELETE /news/:id', () => {
    it('should delete news', async () => {
      await request(app)
        .delete(`/news/${testNews._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedNews = await News.findById(testNews._id);
      expect(deletedNews).toBeNull();
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/news/${testNews._id}`)
        .expect(401);
    });
  });
}); 