-- 003_media_system_enhancement.sql
-- PostgreSQL migration for PRISM integrated media management system

-- 1. Upgrade media_assets table with complete metadata columns
CREATE TABLE IF NOT EXISTS media_assets (
    id VARCHAR(64) PRIMARY KEY,
    src VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    category_slug VARCHAR(64) DEFAULT 'architecture',
    title VARCHAR(255),
    alt VARCHAR(255),
    photographer VARCHAR(100),
    source_name VARCHAR(64) DEFAULT 'Internal',
    source_url VARCHAR(255),
    license_type VARCHAR(64) DEFAULT 'Editorial Rights',
    license_url VARCHAR(255),
    license_verified_at TIMESTAMP WITH TIME ZONE,
    width INT DEFAULT 0,
    height INT DEFAULT 0,
    mime_type VARCHAR(64) DEFAULT 'image/jpeg',
    file_size INT DEFAULT 0,
    is_original BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ensure all columns exist on previously created media_assets table
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS filename VARCHAR(255);
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS photographer VARCHAR(100);
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS source_name VARCHAR(64) DEFAULT 'Internal';
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS source_url VARCHAR(255);
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS license_type VARCHAR(64) DEFAULT 'Editorial Rights';
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS license_url VARCHAR(255);
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS license_verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS width INT DEFAULT 0;
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS height INT DEFAULT 0;
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS mime_type VARCHAR(64) DEFAULT 'image/jpeg';
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS is_original BOOLEAN DEFAULT FALSE;
ALTER TABLE media_assets ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT TRUE;

-- 2. Add relational foreign key columns to articles, categories, and gallery_items
ALTER TABLE articles ADD COLUMN IF NOT EXISTS cover_image_id VARCHAR(64);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS gallery_image_ids TEXT;

ALTER TABLE categories ADD COLUMN IF NOT EXISTS hero_image_id VARCHAR(64);

ALTER TABLE gallery_items ADD COLUMN IF NOT EXISTS media_asset_id VARCHAR(64);

-- Index for high-performance category filtering and searches
CREATE INDEX IF NOT EXISTS idx_media_category ON media_assets(category_slug);
CREATE INDEX IF NOT EXISTS idx_media_approved ON media_assets(is_approved);
