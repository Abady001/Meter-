-- ============================================================================
-- T004 Validation Report — Prisma ORM Initialization
-- SQL-based validation queries for database connectivity & schema checks
-- ============================================================================
-- Task: T004 [P] Initialize Prisma ORM in backend/prisma/
-- Date: 2026-05-26
-- Verdict: PASS
-- ============================================================================

-- 1. Verify database connection to meter_pulse
SELECT current_database() AS database_name,
       current_user AS connected_user;

-- 2. Verify sim_system schema exists
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name = 'sim_system';

-- 3. Verify no tables exist yet (T004 = Prisma bootstrap, no models)
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_catalog = 'meter_pulse'
  AND table_schema = 'sim_system'
ORDER BY table_name;

-- 4. Verify PostgreSQL version compatibility with Prisma 6
SELECT version() AS postgres_version;

-- ============================================================================
-- Expected Results:
--   1. database_name = meter_pulse, connected_user = meter_pulse_dev
--   2. schema_name = sim_system (1 row)
--   3. (0 rows — no tables yet, T004 is bootstrap only)
--   4. PostgreSQL 16.x
-- ============================================================================

-- ============================================================================
-- REUSABLE VALIDATION SQL TEMPLATE (for future tasks)
-- ============================================================================
-- Copy this section for each new task and fill in the task-specific checks.
--
-- Task: [TXXX] — [Task Name]
-- Date: [YYYY-MM-DD]
--
-- -- 1. [Check description]
-- SELECT [expected result];
--
-- -- 2. [Check description]
-- SELECT [expected result];
-- ============================================================================
