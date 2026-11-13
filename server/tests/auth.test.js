import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { initDatabase } from '../src/config/database.js';

let app;

test.before(async () => {
  await initDatabase();
  app = createApp();
});

test('POST /api/auth/register should create user with strict user role', async () => {
  const uniqueName = `user_${Date.now()}`;
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      username: uniqueName,
      email: `${uniqueName}@example.com`,
      password: 'StrongPassword123!',
      name: 'Test Reader Member',
      role: 'admin' // Injection attempt
    });

  assert.equal(res.status, 201);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.user.role, 'user', 'Enforces user role strictly');
  assert.equal(res.body.data.user.username, uniqueName);
  assert.ok(res.body.data.token, 'Returns token');
  assert.ok(!res.body.data.user.passwordHash, 'Never exposes password hash');
});

test('POST /api/auth/register should reject invalid emails or weak passwords', async () => {
  const resEmail = await request(app)
    .post('/api/auth/register')
    .send({
      username: 'validuser1',
      email: 'not-an-email',
      password: 'StrongPassword123!'
    });
  assert.equal(resEmail.status, 400);

  const resPass = await request(app)
    .post('/api/auth/register')
    .send({
      username: 'validuser2',
      email: 'valid2@example.com',
      password: 'weak'
    });
  assert.equal(resPass.status, 400);
});

test('POST /api/auth/login should authenticate by username or email', async () => {
  // Login with username
  const resUser = await request(app)
    .post('/api/auth/login')
    .send({
      identifier: 'user',
      password: 'UserSecurePassword2026!'
    });
  assert.equal(resUser.status, 200);
  assert.equal(resUser.body.data.user.role, 'user');

  // Login with email
  const resEmail = await request(app)
    .post('/api/auth/login')
    .send({
      identifier: 'admin@prism.company.io',
      password: 'AdminSecurePassword2026!'
    });
  assert.equal(resEmail.status, 200);
  assert.equal(resEmail.body.data.user.role, 'admin');

  // Reject bad password
  const resBad = await request(app)
    .post('/api/auth/login')
    .send({
      identifier: 'admin',
      password: 'WrongPassword!'
    });
  assert.equal(resBad.status, 401);
});

test('GET /api/auth/session should identify guest, user, and admin', async () => {
  // Guest session
  const resGuest = await request(app).get('/api/auth/session');
  assert.equal(resGuest.status, 200);
  assert.equal(resGuest.body.data.isAuthenticated, false);
  assert.equal(resGuest.body.data.role, 'guest');

  // User session
  const loginUser = await request(app)
    .post('/api/auth/login')
    .send({ identifier: 'user', password: 'UserSecurePassword2026!' });
  const userToken = loginUser.body.data.token;

  const resUser = await request(app)
    .get('/api/auth/session')
    .set('Authorization', `Bearer ${userToken}`);
  assert.equal(resUser.status, 200);
  assert.equal(resUser.body.data.isAuthenticated, true);
  assert.equal(resUser.body.data.role, 'user');
});

test('RBAC: Non-admin users must be rejected with 403 on admin routes', async () => {
  const loginUser = await request(app)
    .post('/api/auth/login')
    .send({ identifier: 'user', password: 'UserSecurePassword2026!' });
  const userToken = loginUser.body.data.token;

  const res = await request(app)
    .get('/api/admin/users')
    .set('Authorization', `Bearer ${userToken}`);

  assert.equal(res.status, 403);
  assert.equal(res.body.error?.code, 'FORBIDDEN');
});

test('Admin users can manage users list via /api/admin/users', async () => {
  const loginAdmin = await request(app)
    .post('/api/auth/login')
    .send({ identifier: 'admin', password: 'AdminSecurePassword2026!' });
  const adminToken = loginAdmin.body.data.token;

  const res = await request(app)
    .get('/api/admin/users')
    .set('Authorization', `Bearer ${adminToken}`);

  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body.data));
  assert.ok(res.body.data.length >= 2);
});

