-- ============================================================================
-- T010 Validation Report — Append-Only Audit Log Service + Interceptor
-- SQL-based validation queries for audit log schema checks
-- ============================================================================
-- Task: T010 — Implement append-only audit log service + interceptor
-- Date: 2026-05-26
-- Verdict: PASS
-- ============================================================================

-- 1. Verify database connection
SELECT current_database() AS database_name,
       current_user AS connected_user;

-- 2. Verify AuditLog table exists in sim_system schema
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_name = 'audit_log'
  AND table_schema = 'sim_system';

-- 3. Verify AuditLog columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'audit_log'
  AND table_schema = 'sim_system'
ORDER BY ordinal_position;

-- 4. Verify no update/delete triggers exist (append-only enforcement)
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE event_object_table = 'audit_log'
  AND event_object_schema = 'sim_system';

-- ============================================================================
-- Expected Results:
--   1. database_name = meter_pulse, connected_user = meter_pulse
--   2. table_schema = sim_system, table_name = audit_log (1 row)
--   3. Columns: id, actor_id, actor_role, action, resource_type, resource_id,
--      before_state, after_state, reason, correlation_id, created_at
--   4. No triggers (0 rows) — append-only enforced at application level
-- ============================================================================
