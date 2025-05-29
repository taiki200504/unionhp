const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Category = require('../models/category');
const { generateToken } = require('../utils/auth');

let adminToken;
let testCategory;

beforeAll(async () => {
  // テスト用の管理者トークンを生成
  adminToken = generateToken({ role: 'admin' });

  // テスト用のカテゴリーデータを作成
  testCategory = await Category.create({
    name: 'テストカテゴリー',
    slug: 'test-category',
    description: 'テスト用のカテゴリーです'
  });
});

afterAll(async () => {
  // テストデータのクリーンアップ
  await Category.deleteMany({});
  await mongoose.connection.close();
});

describe('Category API', () => {
  describe('GET /categories', () => {
    it('should return all categories', async () => {
      const response = await request(app)
        .get('/categories')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter categories by name', async () => {
      const response = await request(app)
        .get('/categories')
        .query({ name: 'テスト' })
        .expect(200);

      expect(response.body.data[0].name).toBe(testCategory.name);
    });
  });

  describe('GET /categories/:id', () => {
    it('should return category by id', async () => {
      const response = await request(app)
        .get(`/categories/${testCategory._id}`)
        .expect(200);

      expect(response.body.name).toBe(testCategory.name);
    });

    it('should return 404 for non-existent category', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/categories/${fakeId}`)
        .expect(404);
    });
  });

  describe('POST /categories', () => {
    it('should create new category', async () => {
      const categoryData = {
        name: '新規カテゴリー',
        slug: 'new-category',
        description: '新規カテゴリーの説明'
      };

      const response = await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(201);

      expect(response.body.name).toBe(categoryData.name);
    });

    it('should require authentication', async () => {
      const categoryData = {
        name: '新規カテゴリー',
        slug: 'new-category'
      };

      await request(app)
        .post('/categories')
        .send(categoryData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const categoryData = {
        name: '新規カテゴリー'
        // slugが欠落
      };

      await request(app)
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(400);
    });
  });

  describe('PATCH /categories/:id', () => {
    it('should update category', async () => {
      const updateData = {
        name: '更新されたカテゴリー',
        description: '更新された説明'
      };

      const response = await request(app)
        .patch(`/categories/${testCategory._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
    });

    it('should require authentication', async () => {
      const updateData = {
        name: '更新されたカテゴリー'
      };

      await request(app)
        .patch(`/categories/${testCategory._id}`)
        .send(updateData)
        .expect(401);
    });
  });

  describe('DELETE /categories/:id', () => {
    it('should delete category', async () => {
      await request(app)
        .delete(`/categories/${testCategory._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedCategory = await Category.findById(testCategory._id);
      expect(deletedCategory).toBeNull();
    });

    it('should require authentication', async () => {
      await request(app)
        .delete(`/categories/${testCategory._id}`)
        .expect(401);
    });
  });
}); 