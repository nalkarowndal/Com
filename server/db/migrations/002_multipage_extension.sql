-- 002_multipage_extension.sql
-- Extension migration for PRISM multi-page architecture

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    hero_image VARCHAR(255),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Alter articles table to support category, excerpt, tags, is_demo
ALTER TABLE articles ADD COLUMN IF NOT EXISTS category_slug VARCHAR(64) DEFAULT 'architecture';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS excerpt TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS views INT DEFAULT 0;

-- Alter gallery_items table to support category and description
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS category_slug VARCHAR(64) DEFAULT 'architecture';
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS is_demo BOOLEAN DEFAULT FALSE;

-- Media assets catalog table
CREATE TABLE IF NOT EXISTS media_assets (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    src VARCHAR(255) NOT NULL,
    alt VARCHAR(255),
    category_slug VARCHAR(64) DEFAULT 'architecture',
    file_size INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
