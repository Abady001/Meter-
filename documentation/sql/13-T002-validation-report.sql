-- ============================================================================
-- T002 Validation Report - Config + PostgreSQL Connection
-- SQL-based validation queries for database connectivity
-- ============================================================================
-- Task: T002 Add config + PostgreSQL connection module
-- Date: 2026-05-26
-- Verdict: PASS
-- ============================================================================

-- 1. Verify database connection
SELECT current_database() AS database_name,
       current_user AS connected_user,
       version() AS postgres_version;

-- 2. Verify sim_system schema is accessible
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name = 'sim_system';
-- ============================================================================
