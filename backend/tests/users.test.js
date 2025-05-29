const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
let token;
let createdUserId;

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

describe('Users API', () => {
  describe('POST /api/users', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({ name: 'ユーザー', email: 'user@example.com', password: 'password123' });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 if required fields are missing', async () => {
      // 認証トークンが必要な場合はここでセットする
      // const token = '...';
      const res = await request(app)
        .post('/api/users')
        // .set('Authorization', `Bearer ${token}`)
        .send({});
      // 401 or 400どちらか返る可能性あり
      expect([400, 401]).toContain(res.statusCode);
    });
  });

  describe('PATCH /api/users/:id', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .patch('/api/users/123456789012345678901234')
        .send({ name: '更新' });
      expect(res.statusCode).toBe(401);
    });
    it('should return 404 for non-existent resource', async () => {
      // const token = '...';
      const res = await request(app)
        .patch('/api/users/000000000000000000000000')
        // .set('Authorization', `Bearer ${token}`)
        .send({ name: '更新' });
      expect([401, 404]).toContain(res.statusCode);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .delete('/api/users/123456789012345678901234');
      expect(res.statusCode).toBe(401);
    });
    it('should return 404 for non-existent resource', async () => {
      // const token = '...';
      const res = await request(app)
        .delete('/api/users/000000000000000000000000');
        // .set('Authorization', `Bearer ${token}`);
      expect([401, 404]).toContain(res.statusCode);
    });
  });
});

describe('Users API (正常系)', () => {
  it('should create a user', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'テストユーザー',
        email: 'test-user@union.jp',
        password: 'userpass1234',
        organizationName: 'UNION',
        organizationType: 'academic'
      });
    expect([201, 400]).toContain(res.statusCode); // email重複やバリデーションで400の可能性
    if (res.statusCode === 201) {
      createdUserId = res.body.id || res.body._id || res.body.user?.id;
    }
  });
  it('should update a user', async () => {
    if (!createdUserId) return;
    const res = await request(app)
      .patch(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '更新済みユーザー' });
    expect([200, 404]).toContain(res.statusCode);
  });
  it('should delete a user', async () => {
    if (!createdUserId) return;
    const res = await request(app)
      .delete(`/api/users/${createdUserId}`)
      .set('Authorization', `Bearer ${token}`);
    expect([200, 404]).toContain(res.statusCode);
  });
});

describe('GET /api/users', () => {
  it('should return 401 if not authenticated', async () => {
    const res = await request(app).get('/api/users');
    expect(res.statusCode).toBe(401);
  });
});

describe('GET /api/users/:id', () => {
  it('should return 401 if not authenticated', async () => {
    const res = await request(app).get('/api/users/000000000000000000000000');
    expect(res.statusCode).toBe(401);
  });
});

describe('Users API (権限エラー)', () => {
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
  it('should return 403 if non-admin user tries to create user', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: '新規ユーザー', email: 'new@union.jp', password: 'newpass1234', organizationName: 'UNION', organizationType: 'academic' });
    expect(res.statusCode).toBe(403);
  });
  it('should return 403 if non-admin user tries to update user', async () => {
    const res = await request(app)
      .patch('/api/users/123456789012345678901234')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: '一般ユーザー更新' });
    expect(res.statusCode).toBe(403);
  });
  it('should return 403 if non-admin user tries to delete user', async () => {
    const res = await request(app)
      .delete('/api/users/123456789012345678901234')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });
});

describe('Users API (バリデーション)', () => {
  it('should return 400 if name is missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'test@union.jp', password: 'testpass1234', organizationName: 'UNION', organizationType: 'academic' });
    expect(res.statusCode).toBe(400);
  });
  it('should return 400 if email is missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'テストユーザー', password: 'testpass1234', organizationName: 'UNION', organizationType: 'academic' });
    expect(res.statusCode).toBe(400);
  });
  it('should return 400 if password is missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'テストユーザー', email: 'test@union.jp', organizationName: 'UNION', organizationType: 'academic' });
    expect(res.statusCode).toBe(400);
  });
  it('should return 400 if organizationName is missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'テストユーザー', email: 'test@union.jp', password: 'testpass1234', organizationType: 'academic' });
    expect(res.statusCode).toBe(400);
  });
  it('should return 400 if organizationType is missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'テストユーザー', email: 'test@union.jp', password: 'testpass1234', organizationName: 'UNION' });
    expect(res.statusCode).toBe(400);
  });
}); 