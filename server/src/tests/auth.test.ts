import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Auth & Session Integration Tests', () => {
  const uniqueNum = Date.now();
  const testUser = {
    email: `test_${uniqueNum}@example.com`,
    password: 'Password123!',
    displayName: 'Test Partner',
  };

  it('rejects signup with weak password', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: `weak_${uniqueNum}@example.com`,
        password: 'weak',
        displayName: 'Weak User',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('registers a new user successfully and returns auth token', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email.toLowerCase());
    expect(res.body.user.partnerCode).toBeDefined();
    expect(res.body.token).toBeDefined();
  });

  it('rejects duplicate email signup', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send(testUser);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('authenticates user on login with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.displayName).toBe('Test Partner');
  });

  it('rejects login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword999!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('requires authentication for protected /api/auth/me route', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
