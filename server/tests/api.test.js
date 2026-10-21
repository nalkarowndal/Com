import { describe, it, before, after } from 'node:test';
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

  after(() => {
    if (server) server.close();
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

  it('GET /api/categories should return all 4 editorial categories', async () => {
    const res = await fetch(`${baseUrl}/categories`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.length >= 4);
    const slugs = body.data.map((c) => c.slug);
    assert.ok(slugs.includes('architecture'));
    assert.ok(slugs.includes('travel'));
    assert.ok(slugs.includes('art'));
    assert.ok(slugs.includes('food'));
  });

  it('GET /api/categories/:slug should return category details with articles', async () => {
    const res = await fetch(`${baseUrl}/categories/architecture`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.category.slug, 'architecture');
    assert.ok(Array.isArray(body.data.articles));
    assert.ok(body.data.articles.length > 0);
  });

  it('GET /api/search should find articles matching query', async () => {
    const res = await fetch(`${baseUrl}/search?q=Urban`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.results.length >= 1);
    assert.ok(body.data.results.some((a) => a.title.includes('Urban Strorkes')));
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

  it('GET /api/admin/me should return authenticated user info', async () => {
    const res = await fetch(`${baseUrl}/admin/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.username, 'admin');
  });

  it('GET /api/admin/stats should return aggregated system metrics', async () => {
    const res = await fetch(`${baseUrl}/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.totalArticles > 0);
    assert.ok(body.data.totalCategories >= 4);
  });

  it('POST /api/admin/articles and DELETE should manage article lifecycle', async () => {
    // 1. Create article
    const createRes = await fetch(`${baseUrl}/admin/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        title: 'Ephemeral Pavilions of Venice',
        categorySlug: 'architecture',
        author: 'Test Architect',
        content: 'Temporary bamboo and recycled membrane installations along the Grand Canal.',
        imageSrc: '/images/gallery-1.jpg'
      })
    });
    assert.equal(createRes.status, 201);
    const createBody = await createRes.json();
    const newId = createBody.data.id;
    assert.ok(newId);

    // 2. Delete article
    const delRes = await fetch(`${baseUrl}/admin/articles/${newId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(delRes.status, 200);
  });

  it('GET /api/media should return active media assets and support category filtering', async () => {
    const res = await fetch(`${baseUrl}/media`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 12);

    const foodRes = await fetch(`${baseUrl}/media?category=food`);
    assert.equal(foodRes.status, 200);
    const foodBody = await foodRes.json();
    assert.ok(foodBody.data.length >= 2);
    assert.ok(foodBody.data.every((item) => item.categorySlug === 'food'));
  });

  it('GET /api/admin/media should return paginated media list with metadata', async () => {
    const res = await fetch(`${baseUrl}/admin/media`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.pagination.total >= 12);
  });

  it('GET /api/admin/media/recommend should recommend appropriate media based on category and keywords', async () => {
    const res = await fetch(`${baseUrl}/admin/media/recommend?categorySlug=food&title=Sourdough%20Heritage`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length > 0);
    assert.equal(body.data[0].asset.categorySlug, 'food');
  });

  it('POST /api/admin/media/detect-duplicate should detect duplicate image files', async () => {
    const res = await fetch(`${baseUrl}/admin/media/detect-duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ filename: 'hero.jpg', fileSize: 0 })
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.isDuplicate, true);
    assert.ok(body.match);
  });

  it('POST /api/admin/media should create media asset and prevent deleting original assets', async () => {
    // 1. Create a media asset
    const createRes = await fetch(`${baseUrl}/admin/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        src: '/images/uploads/test-sample.jpg',
        title: 'Nordic Timber Architecture',
        categorySlug: 'architecture',
        photographer: 'Editorial Photographer',
        licenseType: 'Unsplash License'
      })
    });
    assert.equal(createRes.status, 201);
    const createBody = await createRes.json();
    assert.equal(createBody.success, true);
    const newMediaId = createBody.data.id;

    // 2. Delete the created non-original asset (should succeed)
    const delRes = await fetch(`${baseUrl}/admin/media/${newMediaId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(delRes.status, 200);

    // 3. Attempt to delete an original protected asset (should return 403)
    const protectedDelRes = await fetch(`${baseUrl}/admin/media/asset-hero`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(protectedDelRes.status, 403);
    const protectedBody = await protectedDelRes.json();
    assert.equal(protectedBody.error.code, 'ORIGINAL_ASSET_PROTECTED');
  });
});
