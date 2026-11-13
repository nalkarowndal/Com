-- Migration 005: Create Social Identities Table for Federated OAuth (Google, Kakao)
-- PRISM Editorial Authentication System

CREATE TABLE IF NOT EXISTS social_identities (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  profile_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_social_provider_uid UNIQUE (provider, provider_user_id)
);

CREATE INDEX IF NOT EXISTS idx_social_identities_user_id ON social_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_social_identities_provider ON social_identities(provider, provider_user_id);
