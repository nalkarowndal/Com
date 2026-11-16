import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_FILE = path.resolve(__dirname, '../../db/seeds/002_multipage_content.json');
const PERSISTENT_DB_FILE = path.resolve(__dirname, '../../db/persistent_data.json');

let pgPool = null;
let activeEngine = 'uninitialized';
let dbStatus = {
  engine: 'uninitialized',
  connected: false,
  message: 'Database not initialized'
};

let fileDbCache = null;

export async function loadSeedData() {
  try {
    const raw = await fs.readFile(SEED_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    const fallbackPath = path.resolve(__dirname, '../../db/seeds/001_initial_content.json');
    const raw = await fs.readFile(fallbackPath, 'utf-8');
    return JSON.parse(raw);
  }
}

async function initFileDb() {
  try {
    const raw = await fs.readFile(PERSISTENT_DB_FILE, 'utf-8');
    fileDbCache = JSON.parse(raw);
    // Ensure all collections exist
    if (!fileDbCache.categories || !fileDbCache.mediaAssets || !fileDbCache.users) {
      const seed = await loadSeedData();
      fileDbCache.categories = seed.categories || fileDbCache.categories || [];
      fileDbCache.mediaAssets = seed.mediaAssets || fileDbCache.mediaAssets || [];
      fileDbCache.users = fileDbCache.users || seed.users || [];
      fileDbCache.articles = seed.articles || fileDbCache.articles;
      fileDbCache.gallery = seed.gallery || fileDbCache.gallery;
      await saveFileDb();
    }
    console.info('[Storage] Loaded existing file-backed persistent database.');
  } catch {
    console.info('[Storage] Initializing new file-backed persistent database from seed...');
    fileDbCache = await loadSeedData();
    fileDbCache.auditLogs = [];
    await fs.writeFile(PERSISTENT_DB_FILE, JSON.stringify(fileDbCache, null, 2), 'utf-8');
  }
}

export async function saveFileDb() {
  if (fileDbCache) {
    await fs.writeFile(PERSISTENT_DB_FILE, JSON.stringify(fileDbCache, null, 2), 'utf-8');
  }
}

async function seedPostgres(client, data) {
  // Check if articles exist
  const res = await client.query('SELECT COUNT(*) FROM articles');
  const count = parseInt(res.rows[0].count, 10);
  if (count > 0) {
    console.info('[Storage] PostgreSQL already contains records. Skipping seed.');
    return;
  }

  console.info('[Storage] Seeding initial data into PostgreSQL...');

  // 1. Site settings
  if (data.site) {
    await client.query(
      `INSERT INTO site_settings (key, value, description) VALUES
       ('site_name', $1, 'Site identifier'),
       ('brand_logo_src', $2, 'Logo path'),
       ('brand_logo_alt', $3, 'Logo alt'),
       ('copyright', $4, 'Copyright notice'),
       ('footer_description', $5, 'Footer copy')
       ON CONFLICT (key) DO NOTHING`,
      [
        data.site.name,
        data.site.brandLogoSrc,
        data.site.brandLogoAlt,
        data.footer?.copyright || '',
        data.footer?.description || ''
      ]
    );
  }

  // 2. Navigation
  if (Array.isArray(data.navigation)) {
    for (const item of data.navigation) {
      await client.query(
        `INSERT INTO navigation_items (id, label, href, order_index, is_active)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO NOTHING`,
        [item.id, item.label, item.href, item.order, item.isActive !== false]
      );
    }
  }

  // 3. Categories
  if (Array.isArray(data.categories)) {
    for (const cat of data.categories) {
      await client.query(
        `INSERT INTO categories (id, slug, name, description, hero_image, sort_order, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [cat.id, cat.slug, cat.name, cat.description, cat.heroImage, cat.order, cat.isActive !== false]
      );
    }
  }

  // 4. Articles
  if (Array.isArray(data.articles)) {
    for (const a of data.articles) {
      await client.query(
        `INSERT INTO articles (id, slug, category_slug, badge, author, title, button_text, image_src, excerpt, content, tags, is_featured, is_published, is_demo, views)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (id) DO NOTHING`,
        [
          a.id,
          a.slug,
          a.categorySlug || 'architecture',
          a.badge,
          a.author,
          a.title,
          a.buttonText || 'Read More',
          a.imageSrc,
          a.excerpt || '',
          a.content || '',
          a.tags || '',
          Boolean(a.isFeatured),
          Boolean(a.isPublished),
          Boolean(a.isDemo),
          a.views || 0
        ]
      );
    }
  }

  // 5. Featured Cards
  if (Array.isArray(data.cards)) {
    for (const c of data.cards) {
      await client.query(
        `INSERT INTO featured_contents (id, variant, title, description, button_text, link, order_index)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [c.id, c.variant, c.title, c.description, c.buttonText || 'Read More', c.link || '', c.order || 0]
      );
    }
  }

  // 6. Gallery
  if (Array.isArray(data.gallery)) {
    for (const g of data.gallery) {
      await client.query(
        `INSERT INTO gallery_items (id, src, alt, title, description, category_slug, order_index, is_published, is_demo)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (id) DO NOTHING`,
        [
          g.id,
          g.src,
          g.alt,
          g.title || g.alt,
          g.description || '',
          g.categorySlug || 'architecture',
          g.order || 0,
          g.isPublished !== false,
          Boolean(g.isDemo)
        ]
      );
    }
  }

  // 7. Media Assets
  if (Array.isArray(data.mediaAssets)) {
    for (const m of data.mediaAssets) {
      await client.query(
        `INSERT INTO media_assets (id, src, filename, category_slug, title, alt, photographer, source_name, source_url, license_type, license_url, license_verified_at, width, height, mime_type, file_size, is_original, is_approved)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
         ON CONFLICT (id) DO NOTHING`,
        [
          m.id,
          m.src,
          m.filename || path.basename(m.src),
          m.categorySlug || 'architecture',
          m.title || m.alt,
          m.alt,
          m.photographer || 'HBK Archive',
          m.sourceName || 'Internal',
          m.sourceUrl || m.src,
          m.licenseType || 'Editorial Rights',
          m.licenseUrl || '',
          m.licenseVerifiedAt || null,
          m.width || 0,
          m.height || 0,
          m.mimeType || 'image/jpeg',
          m.fileSize || 0,
          Boolean(m.isOriginal),
          m.isApproved !== false
        ]
      );
    }
  }

  // 8. Users
  if (Array.isArray(data.users)) {
    for (const u of data.users) {
      await client.query(
        `INSERT INTO users (id, username, email, password_hash, name, role, status, avatar, bookmarks, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [
          u.id,
          u.username,
          u.email,
          u.passwordHash || u.password_hash,
          u.name || u.displayName || u.username,
          u.role || 'user',
          u.status || 'active',
          u.avatar || '/images/avatars/user.svg',
          JSON.stringify(u.bookmarks || []),
          u.createdAt || new Date().toISOString()
        ]
      );
    }
  }

  console.info('[Storage] PostgreSQL seeded successfully.');
}

export async function initDatabase() {
  await initFileDb();

  if (env.DATABASE_URL) {
    try {
      console.info(`[Storage] Attempting PostgreSQL connection to: ${env.DATABASE_URL.replace(/:[^:@]*@/, ':****@')}`);
      pgPool = new pg.Pool({
        connectionString: env.DATABASE_URL,
        connectionTimeoutMillis: 2000
      });

      const client = await pgPool.connect();
      try {
        await client.query('SELECT 1');
        console.info('[Storage] PostgreSQL connection established.');

        // Run migrations
        const mig1 = path.resolve(__dirname, '../../db/migrations/001_create_tables.sql');
        const mig1Sql = await fs.readFile(mig1, 'utf-8');
        await client.query(mig1Sql);

        const mig2 = path.resolve(__dirname, '../../db/migrations/002_multipage_extension.sql');
        const mig2Sql = await fs.readFile(mig2, 'utf-8');
        await client.query(mig2Sql);

        const mig3 = path.resolve(__dirname, '../../db/migrations/003_media_system_enhancement.sql');
        const mig3Sql = await fs.readFile(mig3, 'utf-8');
        await client.query(mig3Sql);

        const mig4 = path.resolve(__dirname, '../../db/migrations/004_create_users_table.sql');
        const mig4Sql = await fs.readFile(mig4, 'utf-8');
        await client.query(mig4Sql);
        console.info('[Storage] PostgreSQL migrations 001, 002, 003 & 004 executed.');

        // Seed initial data if empty
        const seedData = await loadSeedData();
        await seedPostgres(client, seedData);

        activeEngine = 'postgres';
        dbStatus = {
          engine: 'postgres',
          connected: true,
          message: 'PostgreSQL database connected and operational'
        };
        return;
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn('[Storage] PostgreSQL connection attempt failed:', err.message);
      console.warn('[Storage] Engaging resilient file-backed persistent storage layer as fallback.');
      if (pgPool) {
        try {
          await pgPool.end();
        } catch {
          // ignore
        }
        pgPool = null;
      }
      activeEngine = 'file_persistence';
      dbStatus = {
        engine: 'file_persistence',
        connected: true,
        postgresNotice: `PostgreSQL connection failed (${err.code || err.message}). Fallback persistent storage active.`,
        message: 'Resilient persistent file storage operational'
      };
    }
  } else {
    activeEngine = 'file_persistence';
    dbStatus = {
      engine: 'file_persistence',
      connected: true,
      message: 'Resilient persistent file storage operational'
    };
  }
}

export function getDbStatus() {
  return { ...dbStatus, activeEngine };
}

export function getFileDbCache() {
  return fileDbCache;
}

export function getPgPool() {
  return pgPool;
}
