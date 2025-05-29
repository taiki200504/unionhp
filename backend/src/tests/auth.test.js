const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const { generateToken } = require('../utils/auth');

let testUser;

beforeAll(async () => {
  // テスト用のユーザーデータを作成
  testUser = await User.create({
    email: 'test@example.com',
    password: 'password123',
    role: 'user'
  });
});

afterAll(async () => {
  // テストデータのクリーンアップ
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Auth API', () => {
  describe('POST /auth/login', () => {
    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should return 401 with invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const loginData = {
        email: 'test@example.com'
        // passwordが欠落
      };

      await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(400);
    });
  });

  describe('POST /auth/register', () => {
    it('should register new user', async () => {
      const registerData = {
        email: 'newuser@example.com',
        password: 'newpassword123',
        role: 'user'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(registerData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(registerData.email);
    });

    it('should not allow duplicate email', async () => {
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      };

      await request(app)
        .post('/auth/register')
        .send(registerData)
        .expect(400);
    });

    it('should validate required fields', async () => {
      const registerData = {
        email: 'newuser@example.com'
        // passwordが欠落
      };

      await request(app)
        .post('/auth/register')
        .send(registerData)
        .expect(400);
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user', async () => {
      const token = generateToken({ id: testUser._id, role: testUser.role });

      const response = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.email).toBe(testUser.email);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/auth/me')
        .expect(401);
    });
  });

  describe('POST /auth/refresh-token', () => {
    it('should refresh token', async () => {
      const token = generateToken({ id: testUser._id, role: testUser.role });

      const response = await request(app)
        .post('/auth/refresh-token')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('token');
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/auth/refresh-token')
        .expect(401);
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout user', async () => {
      const token = generateToken({ id: testUser._id, role: testUser.role });

      await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/auth/logout')
        .expect(401);
    });
  });
}); 