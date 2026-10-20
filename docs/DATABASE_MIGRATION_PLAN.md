# PRISM Database Architecture & Migration Plan

## 1. Schema Evolution & Strategy

To support multi-page operations, full-text search, and audit trails without violating baseline data integrity, the PostgreSQL database is structured through staged SQL migrations with a synchronized JSON fallback engine.

---

## 2. Migration Registry

### 2.1 Migration 001: Initial Core Schema (`001_initial_schema.sql`)
- Creates core baseline tables: `site_settings`, `navigation_items`, `hero_section`, `featured_cards`, `gallery_items`, `footer_section`, and `audit_logs`.
- Seeds original snapshot values.

### 2.2 Migration 002: Multi-Page Extension (`002_multipage_extension.sql`)
- Extends the platform for multi-page editorial hierarchies:

```sql
-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(64) UNIQUE NOT NULL,
  name VARCHAR(128) NOT NULL,
  description TEXT,
  hero_image VARCHAR(255),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Master Articles Table
CREATE TABLE IF NOT EXISTS articles (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(128) UNIQUE NOT NULL,
  category_slug VARCHAR(64) REFERENCES categories(slug) ON UPDATE CASCADE,
  badge VARCHAR(64),
  author VARCHAR(128),
  title VARCHAR(255) NOT NULL,
  button_text VARCHAR(64) DEFAULT 'Read More',
  image_src VARCHAR(255),
  excerpt TEXT,
  content TEXT NOT NULL,
  tags VARCHAR(255),
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  is_demo BOOLEAN DEFAULT false,
  views INT DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Media Assets Table
CREATE TABLE IF NOT EXISTS media_assets (
  id VARCHAR(64) PRIMARY KEY,
  src VARCHAR(255) UNIQUE NOT NULL,
  alt VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  description TEXT,
  category_slug VARCHAR(64),
  mime_type VARCHAR(64) DEFAULT 'image/jpeg',
  file_size INT,
  is_locked BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Audit Trail Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  actor VARCHAR(64) NOT NULL,
  action VARCHAR(64) NOT NULL,
  entity VARCHAR(64) NOT NULL,
  entity_id VARCHAR(64),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. Dual-Storage Resilient Engine

In `server/src/repositories/content.repository.js`:
- If PostgreSQL is available, queries execute natively using parameterized SQL statements (`$1`, `$2`), preventing SQL injection.
- If PostgreSQL is unavailable (e.g. local offline development or environments without PostgreSQL client binaries), the repository automatically engages the persistent JSON storage engine (`server/db/persistent_data.json`).
- All repository methods (`findArticles`, `findArticleBySlug`, `createArticle`, `updateArticle`, `deleteArticle`, `searchArticles`, `getStats`, `logAction`) are dual-implemented, guaranteeing 100% operational consistency.
