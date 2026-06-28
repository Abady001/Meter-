const express = require('express');
const router = express.Router();
const db = require('../services/db');

// System health overview
router.get('/health', async (req, res) => {
  try {
    // DB connection check
    const dbResult = await db.query('SELECT 1 as connected');
    // Table counts
    const counts = await db.query(`
      SELECT 'areas' as name, COUNT(*)::int as cnt FROM core.areas
      UNION ALL SELECT 'projects', COUNT(*)::int FROM core.projects
      UNION ALL SELECT 'users', COUNT(*)::int FROM core.users
      UNION ALL SELECT 'roles', COUNT(*)::int FROM core.roles
      UNION ALL SELECT 'permissions', COUNT(*)::int FROM core.permissions
      UNION ALL SELECT 'audit_logs', COUNT(*)::int FROM core.audit_log
    `);
    res.json({
      status: 'healthy',
      database: dbResult.rows.length > 0 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      counts: counts.rows
    });
  } catch (err) {
    res.status(503).json({ status: 'unhealthy', error: err.message });
  }
});

// List database schemas and tables
router.get('/schemas', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT table_schema, table_name,
             (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_schema = t.table_schema AND c.table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema IN ('core', 'sim_system', 'features', 'area')
      ORDER BY table_schema, table_name
    `);
    // Group by schema
    const schemas = {};
    result.rows.forEach(r => {
      if (!schemas[r.table_schema]) schemas[r.table_schema] = [];
      schemas[r.table_schema].push({ name: r.table_name, columns: r.column_count });
    });
    res.json({ data: schemas });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Disk/storage info
router.get('/storage', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT schemaname, tablename,
             pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) as total_size,
             pg_total_relation_size(schemaname || '.' || tablename) as bytes
      FROM pg_tables
      WHERE schemaname IN ('core', 'sim_system', 'features', 'area')
      ORDER BY bytes DESC
    `);
    const total = result.rows.reduce((sum, r) => sum + parseInt(r.bytes || '0'), 0);
    res.json({
      data: result.rows.map(r => ({ ...r, bytes: parseInt(r.bytes || '0') })),
      totalSize: total,
      totalSizePretty: require('pg-bytes')(total)
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Roles list
router.get('/roles', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.*,
        (SELECT COUNT(*) FROM core.user_role_assignments ura WHERE ura.role_id = r.id) as assigned_users
      FROM core.roles r ORDER BY r.role_name
    `);
    res.json({ data: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
