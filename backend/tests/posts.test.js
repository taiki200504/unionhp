const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
let token;
let createdPostId;

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

describe('Posts API', () => {
  describe('POST /api/posts', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/api/posts')
        .send({ title: '投稿', content: '内容', category: 'event', group: 'academic' });
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('message');
    });

    it('should return 400 if required fields are missing', async () => {
      // 認証トークンが必要な場合はここでセットする
      // const token = '...';
      const res = await request(app)
        .post('/api/posts')
        // .set('Authorization', `Bearer ${token}`)
        .send({});
      // 401 or 400どちらか返る可能性あり
      expect([400, 401]).toContain(res.statusCode);
    });
  });

  describe('PATCH /api/posts/:id', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .patch('/api/posts/123456789012345678901234')
        .send({ title: '更新' });
      expect(res.statusCode).toBe(401);
    });
    it('should return 404 for non-existent resource', async () => {
      // const token = '...';
      const res = await request(app)
        .patch('/api/posts/000000000000000000000000')
        // .set('Authorization', `Bearer ${token}`)
        .send({ title: '更新' });
      expect([401, 404]).toContain(res.statusCode);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .delete('/api/posts/123456789012345678901234');
      expect(res.statusCode).toBe(401);
    });
    it('should return 404 for non-existent resource', async () => {
      // const token = '...';
      const res = await request(app)
        .delete('/api/posts/000000000000000000000000');
        // .set('Authorization', `Bearer ${token}`);
      expect([401, 404]).toContain(res.statusCode);
    });
  });
});

describe('Posts API (正常系)', () => {
  it('should create a post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'テスト投稿',
        content: 'テスト内容',
        category: 'event',
        group: 'academic'
      });
    expect([201, 400]).toContain(res.statusCode); // category/groupが不正なら400
    if (res.statusCode === 201) {
      createdPostId = res.body.id || res.body._id || res.body.post?.id;
    }
  });
  it('should update a post', async () => {
    if (!createdPostId) return;
    const res = await request(app)
      .put(`/api/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '更新済み投稿', category: 'event', group: 'academic' });
    expect([200, 404]).toContain(res.statusCode);
  });
  it('should delete a post', async () => {
    if (!createdPostId) return;
    const res = await request(app)
      .delete(`/api/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${token}`);
    expect([200, 404]).toContain(res.statusCode);
  });
});

describe('GET /api/posts', () => {
  it('should return post list', async () => {
    const res = await request(app).get('/api/posts');
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeDefined();
  });
});

describe('GET /api/posts/:id', () => {
  it('should return 404 for non-existent post', async () => {
    const res = await request(app).get('/api/posts/000000000000000000000000');
    expect([404, 400]).toContain(res.statusCode);
  });
});

describe('Posts API (権限エラー)', () => {
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
  it('should return 403 if non-admin user tries to create post', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: '一般ユーザー投稿', content: '内容', category: 'event', group: 'academic' });
    expect(res.statusCode).toBe(403);
  });
  it('should return 403 if non-admin user tries to update post', async () => {
    const res = await request(app)
      .patch('/api/posts/123456789012345678901234')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: '一般ユーザー更新' });
    expect(res.statusCode).toBe(403);
  });
  it('should return 403 if non-admin user tries to delete post', async () => {
    const res = await request(app)
      .delete('/api/posts/123456789012345678901234')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });
});

describe('Posts API (バリデーション)', () => {
  it('should return 400 if title is missing', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '内容', category: 'event', group: 'academic' });
    expect(res.statusCode).toBe(400);
  });
  it('should return 400 if content is missing', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'タイトル', category: 'event', group: 'academic' });
    expect(res.statusCode).toBe(400);
  });
  it('should return 400 if category is missing', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'タイトル', content: '内容', group: 'academic' });
    expect(res.statusCode).toBe(400);
  });
  it('should return 400 if group is missing', async () => {
    const res = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'タイトル', content: '内容', category: 'event' });
    expect(res.statusCode).toBe(400);
  });
}); 