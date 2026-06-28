-- Ensure required tables exist for admin console

-- Settings table (if not exists)
CREATE TABLE IF NOT EXISTS core.settings (
  key VARCHAR(255) PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log archive table (for compressed/archived records)
CREATE TABLE IF NOT EXISTS core.audit_log_archive (
  id BIGSERIAL PRIMARY KEY,
  user_id VARCHAR(255),
  action_type VARCHAR(50),
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(50),
  user_agent TEXT,
  area_id VARCHAR(255),
  original_created_at TIMESTAMP WITH TIME ZONE,
  compressed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_archive_created
  ON core.audit_log_archive (compressed_at);

CREATE INDEX IF NOT EXISTS idx_audit_log_archive_entity
  ON core.audit_log_archive (entity_type, entity_id);

-- Add settings for email/server
INSERT INTO core.settings (key, value) VALUES
  ('system_name', 'Meter Verse')
ON CONFLICT (key) DO NOTHING;
