import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { initDatabase } from '../src/config/database.js';

describe('PRISM Social OAuth & Federated Identity Suite', () => {
  let app;

  before(async () => {
    await initDatabase();
    app = createApp();
  });

  it('GET /api/auth/config should return public OAuth status and keys without leaking secrets', async () => {
    const res = await request(app).get('/api/auth/config');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok('googleClientId' in res.body.data);
    assert.ok('kakaoRestApiKey' in res.body.data);
    assert.ok('isGoogleConfigured' in res.body.data);
    assert.ok('isKakaoConfigured' in res.body.data);
    // Crucial: ensure client secrets are NEVER exposed in public config
    assert.strictEqual(res.body.data.googleClientSecret, undefined);
    assert.strictEqual(res.body.data.kakaoClientSecret, undefined);
  });

  it('POST /api/auth/google should reject empty payload with 400', async () => {
    const res = await request(app).post('/api/auth/google').send({});
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('POST /api/auth/google should create brand new user with role USER', async () => {
    const uniqueSub = `sub-google-${Date.now()}`;
    const uniqueEmail = `test.google.${Date.now()}@example.com`;

    const res = await request(app).post('/api/auth/google').send({
      testProfile: {
        sub: uniqueSub,
        email: uniqueEmail,
        name: 'Camilla Thorne',
        picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
      }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.role, 'user');
    assert.strictEqual(res.body.data.user.email, uniqueEmail);
    assert.strictEqual(res.body.data.isNewUser, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.provider, 'google');

    // Confirm repeat login returns same user
    const repeatRes = await request(app).post('/api/auth/google').send({
      testProfile: {
        sub: uniqueSub,
        email: uniqueEmail,
        name: 'Camilla Thorne'
      }
    });

    assert.strictEqual(repeatRes.status, 200);
    assert.strictEqual(repeatRes.body.data.user.id, res.body.data.user.id);
    assert.strictEqual(repeatRes.body.data.isNewUser, false);
  });

  it('POST /api/auth/google should block hijack attempts on admin accounts with 403', async () => {
    const res = await request(app).post('/api/auth/google').send({
      testProfile: {
        sub: 'malicious-attacker-sub',
        email: 'admin@prism.company.io',
        name: 'Malicious Attacker'
      }
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'ADMIN_SOCIAL_FORBIDDEN');
  });

  it('POST /api/auth/kakao should reject empty payload with 400', async () => {
    const res = await request(app).post('/api/auth/kakao').send({});
    assert.strictEqual(res.status, 400);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('POST /api/auth/kakao should create user with role USER and allow repeat logins', async () => {
    const uniqueKakaoId = `kakao-id-${Date.now()}`;
    const uniqueEmail = `kakao.reader.${Date.now()}@kakao.test`;

    const res = await request(app).post('/api/auth/kakao').send({
      testProfile: {
        id: uniqueKakaoId,
        email: uniqueEmail,
        name: 'Jinwoo Song'
      }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.role, 'user');
    assert.strictEqual(res.body.data.isNewUser, true);
    assert.strictEqual(res.body.data.provider, 'kakao');

    // Confirm repeat login
    const repeatRes = await request(app).post('/api/auth/kakao').send({
      testProfile: {
        id: uniqueKakaoId,
        email: uniqueEmail
      }
    });

    assert.strictEqual(repeatRes.status, 200);
    assert.strictEqual(repeatRes.body.data.user.id, res.body.data.user.id);
    assert.strictEqual(repeatRes.body.data.isNewUser, false);
  });

  it('POST /api/auth/kakao should block hijack attempts on admin accounts with 403', async () => {
    const res = await request(app).post('/api/auth/kakao').send({
      testProfile: {
        id: 'kakao-admin-attacker',
        email: 'admin@prism.company.io',
        name: 'Attacker'
      }
    });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.error.code, 'ADMIN_SOCIAL_FORBIDDEN');
  });
});
