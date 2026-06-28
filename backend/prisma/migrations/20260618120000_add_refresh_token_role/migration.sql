-- Add role column to refresh_tokens table
ALTER TABLE sim_system.refresh_tokens ADD COLUMN IF NOT EXISTS "role" VARCHAR(50) NOT NULL DEFAULT 'customer';
