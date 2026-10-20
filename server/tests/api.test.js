import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { initDatabase } from '../src/config/database.js';

describe('PRISM Company REST API Suite', () => {
  let app;
  let server;
  let baseUrl;
  let adminToken;

  before(async () => {
    await initDatabase();
    app = createApp();
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://localhost:${port}/api`;
        resolve();
      });
    });
  });

  it('GET /api/health should return 200 with storage status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.status, 'healthy');
    assert.ok(body.data.storage);
    assert.equal(body.data.storage.connected, true);
  });

  it('GET /api/site should return company project and PRISM brand info', async () => {
    const res = await fetch(`${baseUrl}/site`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.name, 'company');
    assert.equal(body.data.copyright, '2026 Green Systems Incorporated. All rights reserved.');
  });

  it('GET /api/home should return complete baseline content matching snapshot', async () => {
    const res = await fetch(`${baseUrl}/home`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);

    const { navigation, hero, cards, gallery, footer } = body.data;

    // Verify Navigation (4 items in exact order)
    assert.equal(navigation.length, 4);
    assert.deepEqual(
      navigation.map((n) => n.label),
      ['Architecture', 'Travel', 'Art', 'Food']
    );

    // Verify Hero
    assert.equal(hero.badge, "Editor's Choice");
    assert.equal(hero.author, 'Sebastian Weiss');
    assert.equal(hero.title, 'Urban Strorkes'); // Must preserve exact typo 'Strorkes'
    assert.equal(hero.buttonText, 'Read More');

    // Verify Cards
    assert.equal(cards.length, 2);
    assert.equal(cards[0].title, 'Inspring Reads'); // Must preserve exact typo 'Inspring'
    assert.equal(cards[1].title, 'Reflections');
    assert.equal(
      cards[0].description,
      'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Eum, est doloribus'
    );

    // Verify Gallery
    assert.equal(gallery.length, 4);
    assert.equal(gallery[0].src, '/images/gallery-1.jpg');
    assert.equal(gallery[1].src, '/images/gallery-2.jpg');
    assert.equal(gallery[2].src, '/images/gallery-3.jpg');
    assert.equal(gallery[3].src, '/images/gallery-4.jpg');

    // Verify Footer
    assert.equal(footer.copyright, '2026 Green Systems Incorporated. All rights reserved.');
    assert.equal(
      footer.description,
      'Lorem ipsum dolor sit amet consectetur adipisicing elit. Facere, necessitatibus!'
    );
  });

  it('POST /api/admin/login should reject invalid credentials with 401', async () => {
    const res = await fetch(`${baseUrl}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'wrong_password' })
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'INVALID_CREDENTIALS');
  });

  it('POST /api/admin/login should succeed with valid credentials', async () => {
    const res = await fetch(`${baseUrl}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'AdminSecurePassword2026!' })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.token);
    adminToken = body.data.token;
  });

  it('PATCH /api/admin/articles/:id should reject unauthenticated request with 401', async () => {
    const res = await fetch(`${baseUrl}/admin/articles/hero-urban-strorkes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Test Title' })
    });
    assert.equal(res.status, 401);
  });

  it('PATCH /api/admin/articles/:id should accept authorized update and create audit log', async () => {
    const res = await fetch(`${baseUrl}/admin/articles/hero-urban-strorkes`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ buttonText: 'Explore Series' })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);

    // Verify audit logs
    const logRes = await fetch(`${baseUrl}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(logRes.status, 200);
    const logs = await logRes.json();
    assert.ok(logs.data.length > 0);
    assert.equal(logs.data[0].action, 'UPDATE_ARTICLE');

    // Restore original buttonText to preserve pristine baseline!
    await fetch(`${baseUrl}/admin/articles/hero-urban-strorkes`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ buttonText: 'Read More' })
    });
  });
});
