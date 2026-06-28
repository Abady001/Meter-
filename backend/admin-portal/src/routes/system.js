const express = require('express');
const router = express.Router();
const db = require('../services/db');

router.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    const c = await db.query(`SELECT 'areas' as n, COUNT(*)::int as c FROM core.areas UNION ALL SELECT 'projects', COUNT(*)::int FROM core.projects UNION ALL SELECT 'users', COUNT(*)::int FROM core.users UNION ALL SELECT 'roles', COUNT(*)::int FROM core.roles UNION ALL SELECT 'permissions', COUNT(*)::int FROM core.permissions`);
    res.json({ status:'healthy', db:'connected', counts: c.rows });
  } catch (e) { res.status(503).json({ status:'unhealthy', error:e.message }); }
});
router.get('/schemas', async (req, res) => {
  try {
    const r = await db.query(`SELECT table_schema, table_name, (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_schema=t.table_schema AND c.table_name=t.table_name) as cols FROM information_schema.tables t WHERE table_schema IN ('core','sim_system','features','area') ORDER BY table_schema, table_name`);
    const s = {}; r.rows.forEach(x => { if (!s[x.table_schema]) s[x.table_schema] = []; s[x.table_schema].push({ name: x.table_name, cols: x.cols }); });
    res.json({ data: s });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/storage', async (req, res) => {
  try {
    const r = await db.query(`SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size, pg_total_relation_size(schemaname||'.'||tablename) as bytes FROM pg_tables WHERE schemaname IN ('core','sim_system','features','area') ORDER BY bytes DESC`);
    const total = r.rows.reduce((a,b) => a + parseInt(b.bytes||'0'), 0);
    res.json({ data: r.rows.map(x => ({...x, bytes: parseInt(x.bytes||'0')})), totalSize: total });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/roles', async (req, res) => {
  try {
    const r = await db.query(`SELECT r.*, (SELECT COUNT(*) FROM core.user_role_assignments ura WHERE ura.role_id = r.id) as assigned_users FROM core.roles r ORDER BY r.role_name`);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
