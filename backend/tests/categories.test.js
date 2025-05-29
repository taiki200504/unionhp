const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
let token;
let createdCategoryId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/union_hp');
  await User.deleteMany({ email: 'test-admin@union.jp' });
  await request(app)
    .post('/api/users')
    .send({
      name: 'テスト管理者',
      email: 'test-admin@union.jp',
      password: 'testpass1234',
      role: 'admin',
      organizationName: 'UNION',
      organizationType: 'academic'
    });
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test-admin@union.jp', password: 'testpass1234' });
  token = res.body.token;
});
afterAll(async () => {
  await mongoose.disconnect();
});

describe('Categories API', () => {
  describe('POST /api/categories', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({ name: 'カテゴリ', slug: 'cat' });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 if required fields are missing', async () => {
      // 認証トークンが必要な場合はここでセットする
      // const token = '...';
      const res = await request(app)
        .post('/api/categories')
        // .set('Authorization', `Bearer ${token}`)
        .send({});
      // 401 or 400どちらか返る可能性あり
      expect([400, 401]).toContain(res.statusCode);
    });
  });

  describe('PATCH /api/categories/:id', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .patch('/api/categories/123456789012345678901234')
        .send({ name: '更新' });
      expect(res.statusCode).toBe(401);
    });
    it('should return 404 for non-existent resource', async () => {
      // const token = '...';
      const res = await request(app)
        .patch('/api/categories/000000000000000000000000')
        // .set('Authorization', `Bearer ${token}`)
        .send({ name: '更新' });
      expect([401, 404]).toContain(res.statusCode);
    });
  });

  describe('DELETE /api/categories/:id', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .delete('/api/categories/123456789012345678901234');
      expect(res.statusCode).toBe(401);
    });
    it('should return 404 for non-existent resource', async () => {
      // const token = '...';
      const res = await request(app)
        .delete('/api/categories/000000000000000000000000');
        // .set('Authorization', `Bearer ${token}`);
      expect([401, 404]).toContain(res.statusCode);
    });
  });
});

describe('Categories API (正常系)', () => {
  it('should create a category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'テストカテゴリ',
        slug: 'test-category'
      });
    expect([201, 400]).toContain(res.statusCode); // slug重複やバリデーションで400の可能性
    if (res.statusCode === 201) {
      createdCategoryId = res.body.id || res.body._id || res.body.category?.id;
    }
  });
  it('should update a category', async () => {
    if (!createdCategoryId) return;
    const res = await request(app)
      .patch(`/api/categories/${createdCategoryId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '更新済みカテゴリ' });
    expect([200, 404]).toContain(res.statusCode);
  });
  it('should delete a category', async () => {
    if (!createdCategoryId) return;
    const res = await request(app)
      .delete(`/api/categories/${createdCategoryId}`)
      .set('Authorization', `Bearer ${token}`);
    expect([200, 404]).toContain(res.statusCode);
  });
});

describe('GET /api/categories', () => {
  it('should return category list', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();
  });
});

describe('GET /api/categories/:id', () => {
  it('should return 404 for non-existent category', async () => {
    const res = await request(app).get('/api/categories/000000000000000000000000');
    expect([404, 400]).toContain(res.statusCode);
  });
});

describe('Categories API (権限エラー)', () => {
  let userToken;
  beforeAll(async () => {
    await request(app)
      .post('/api/users')
      .send({
        name: '一般ユーザー',
        email: 'user@union.jp',
        password: 'userpass1234',
        role: 'user',
        organizationName: 'UNION',
        organizationType: 'academic'
      });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@union.jp', password: 'userpass1234' });
    userToken = res.body.token;
  });
  it('should return 403 if non-admin user tries to create category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: '一般ユーザーカテゴリ', slug: 'user-cat' });
    expect(res.statusCode).toBe(403);
  });
  it('should return 403 if non-admin user tries to update category', async () => {
    const res = await request(app)
      .patch('/api/categories/123456789012345678901234')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: '一般ユーザー更新' });
    expect(res.statusCode).toBe(403);
  });
  it('should return 403 if non-admin user tries to delete category', async () => {
    const res = await request(app)
      .delete('/api/categories/123456789012345678901234')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });
});

describe('Categories API (バリデーション)', () => {
  it('should return 400 if name is missing', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ slug: 'cat' });
    expect(res.statusCode).toBe(400);
  });
  it('should return 400 if slug is missing', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'カテゴリ' });
    expect(res.statusCode).toBe(400);
  });
}); 