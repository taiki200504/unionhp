const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const { generateToken } = require('../utils/auth');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');

let adminToken;
let userToken;
let testUser;

beforeAll(async () => {
  adminToken = generateToken({ role: 'admin' });
  userToken = generateToken({ role: 'user' });

  testUser = await User.create({
    email: 'test@example.com',
    password: 'password123',
    role: 'user'
  });
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Security Tests', () => {
  describe('Authentication Tests', () => {
    it('should prevent access without token', async () => {
      await request(app)
        .get('/users')
        .expect(401);
    });

    it('should prevent access with invalid token', async () => {
      await request(app)
        .get('/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should prevent access with expired token', async () => {
      const expiredToken = generateToken({ role: 'admin' }, '1ms');
      await new Promise(resolve => setTimeout(resolve, 2));
      
      await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });
  });

  describe('Authorization Tests', () => {
    it('should prevent non-admin users from accessing admin routes', async () => {
      await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should prevent users from accessing other users data', async () => {
      const otherUser = await User.create({
        email: 'other@example.com',
        password: 'password123',
        role: 'user'
      });

      await request(app)
        .get(`/users/${otherUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('Input Validation Tests', () => {
    it('should prevent SQL injection in search queries', async () => {
      const response = await request(app)
        .get('/news')
        .query({ search: "' OR '1'='1" })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should prevent XSS attacks in user input', async () => {
      const xssPayload = '<script>alert("XSS")</script>';
      
      const response = await request(app)
        .post('/news')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: xssPayload,
          content: xssPayload,
          category: testUser._id
        })
        .expect(201);

      expect(response.body.title).not.toContain('<script>');
      expect(response.body.content).not.toContain('<script>');
    });

    it('should prevent NoSQL injection in query parameters', async () => {
      const response = await request(app)
        .get('/users')
        .query({ role: { $ne: null } })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('Rate Limiting Tests', () => {
    it('should limit login attempts', async () => {
      const attempts = 6;
      const promises = Array.from({ length: attempts }, () =>
        request(app)
          .post('/auth/login')
          .send({
            email: 'test@example.com',
            password: 'wrongpassword'
          })
      );

      const responses = await Promise.all(promises);
      const tooManyRequests = responses.filter(r => r.status === 429);
      
      expect(tooManyRequests.length).toBeGreaterThan(0);
    });

    it('should limit API requests', async () => {
      const attempts = 101;
      const promises = Array.from({ length: attempts }, () =>
        request(app)
          .get('/news')
      );

      const responses = await Promise.all(promises);
      const tooManyRequests = responses.filter(r => r.status === 429);
      
      expect(tooManyRequests.length).toBeGreaterThan(0);
    });
  });

  describe('Security Headers Tests', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
      expect(response.headers).toHaveProperty('strict-transport-security');
    });
  });

  describe('Password Security Tests', () => {
    it('should enforce password complexity', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'weak',
          role: 'user'
        })
        .expect(400);

      expect(response.body.error).toContain('password');
    });

    it('should prevent password reuse', async () => {
      const response = await request(app)
        .patch(`/users/${testUser._id}/password`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'password123'
        })
        .expect(400);

      expect(response.body.error).toContain('password');
    });
  });

  describe('Session Security Tests', () => {
    it('should invalidate all sessions on password change', async () => {
      // パスワードを変更
      await request(app)
        .patch(`/users/${testUser._id}/password`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        })
        .expect(200);

      // 古いトークンでアクセスを試みる
      await request(app)
        .get(`/users/${testUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(401);
    });

    it('should prevent session fixation', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        })
        .expect(200);

      const newToken = response.body.token;
      expect(newToken).not.toBe(userToken);
    });
  });
}); 