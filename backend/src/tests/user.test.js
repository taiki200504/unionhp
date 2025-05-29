const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/user');
const { generateToken } = require('../utils/auth');

let adminToken;
let userToken;
let testUser;

beforeAll(async () => {
  // テスト用のトークンを生成
  adminToken = generateToken({ role: 'admin' });
  userToken = generateToken({ role: 'user' });

  // テスト用のユーザーデータを作成
  testUser = await User.create({
    email: 'test@example.com',
    password: 'password123',
    role: 'user',
    name: 'テストユーザー',
    profile: {
      bio: 'テスト用のプロフィール',
      avatar: 'https://example.com/avatar.jpg'
    }
  });
});

afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('User API', () => {
  describe('GET /users', () => {
    it('should return all users for admin', async () => {
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should not allow non-admin users to list all users', async () => {
      await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should require authentication', async () => {
      await request(app)
        .get('/users')
        .expect(401);
    });
  });

  describe('GET /users/:id', () => {
    it('should return user by id for admin', async () => {
      const response = await request(app)
        .get(`/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.email).toBe(testUser.email);
    });

    it('should allow users to view their own profile', async () => {
      const response = await request(app)
        .get(`/users/${testUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.email).toBe(testUser.email);
    });

    it('should not allow users to view other profiles', async () => {
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

  describe('PATCH /users/:id', () => {
    it('should allow admin to update any user', async () => {
      const updateData = {
        name: '更新された名前',
        profile: {
          bio: '更新されたプロフィール'
        }
      };

      const response = await request(app)
        .patch(`/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.profile.bio).toBe(updateData.profile.bio);
    });

    it('should allow users to update their own profile', async () => {
      const updateData = {
        name: '自分の名前を更新',
        profile: {
          bio: '自分のプロフィールを更新'
        }
      };

      const response = await request(app)
        .patch(`/users/${testUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
    });

    it('should not allow users to update their role', async () => {
      const updateData = {
        role: 'admin'
      };

      const response = await request(app)
        .patch(`/users/${testUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.role).toBe('user');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should allow admin to delete any user', async () => {
      const userToDelete = await User.create({
        email: 'delete@example.com',
        password: 'password123',
        role: 'user'
      });

      await request(app)
        .delete(`/users/${userToDelete._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      const deletedUser = await User.findById(userToDelete._id);
      expect(deletedUser).toBeNull();
    });

    it('should not allow users to delete other users', async () => {
      const otherUser = await User.create({
        email: 'other@example.com',
        password: 'password123',
        role: 'user'
      });

      await request(app)
        .delete(`/users/${otherUser._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should allow users to delete their own account', async () => {
      const ownUser = await User.create({
        email: 'own@example.com',
        password: 'password123',
        role: 'user'
      });

      const ownToken = generateToken({ id: ownUser._id, role: 'user' });

      await request(app)
        .delete(`/users/${ownUser._id}`)
        .set('Authorization', `Bearer ${ownToken}`)
        .expect(204);

      const deletedUser = await User.findById(ownUser._id);
      expect(deletedUser).toBeNull();
    });
  });

  describe('PATCH /users/:id/password', () => {
    it('should allow users to change their password', async () => {
      const passwordData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123'
      };

      await request(app)
        .patch(`/users/${testUser._id}/password`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(passwordData)
        .expect(200);

      // 新しいパスワードでログインできることを確認
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'newpassword123'
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
    });

    it('should validate current password', async () => {
      const passwordData = {
        currentPassword: 'wrongpassword',
        newPassword: 'newpassword123'
      };

      await request(app)
        .patch(`/users/${testUser._id}/password`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(passwordData)
        .expect(400);
    });
  });
}); 