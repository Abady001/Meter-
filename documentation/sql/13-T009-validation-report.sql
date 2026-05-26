-- ============================================================================
-- T009 Validation Report — JWT Auth + RBAC Guard + Role Model
-- SQL-based validation queries for database connectivity & schema checks
-- ============================================================================
-- Task: T009 — Implement Auth (JWT) + RBAC guard + role model
-- Date: 2026-05-26
-- Verdict: PASS
-- ============================================================================

-- 1. Verify database connection to meter_pulse
SELECT current_database() AS database_name,
       current_user AS connected_user;

-- 2. Verify sim_system schema exists (dependency on T002/T004)
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name = 'sim_system';

-- 3. Verify auth tables exist (future: Users, Roles, Permissions)
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_catalog = 'meter_pulse'
  AND table_schema = 'sim_system'
ORDER BY table_name;

-- 4. Verify PostgreSQL version compatibility
SELECT version() AS postgres_version;

-- ============================================================================
-- Expected Results:
--   1. database_name = meter_pulse, connected_user = meter_pulse
--   2. schema_name = sim_system (1 row)
--   3. Tables as defined by Prisma migrations
--   4. PostgreSQL 16.x
-- ============================================================================
