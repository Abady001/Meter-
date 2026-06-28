const express = require('express');
const router = express.Router();
const db = require('../services/db');

// List audit logs with filtering
router.get('/', async (req, res) => {
  try {
    const { userId, actionType, entityType, entityId, areaId, days, limit, offset } = req.query;
    let sql = `SELECT al.*, u.username FROM core.audit_log al JOIN core.users u ON u.id = al.user_id`;
    const params = []; const conds = [];
    if (userId) { conds.push(`al.user_id = $${params.length + 1}`); params.push(userId); }
    if (actionType) { conds.push(`al.action_type = $${params.length + 1}`); params.push(actionType); }
    if (entityType) { conds.push(`al.entity_type = $${params.length + 1}`); params.push(entityType); }
    if (entityId) { conds.push(`al.entity_id = $${params.length + 1}`); params.push(entityId); }
    if (areaId) { conds.push(`al.area_id = $${params.length + 1}`); params.push(areaId); }
    if (days) { conds.push(`al.created_at >= NOW() - INTERVAL '${parseInt(days)} days'`); }
    if (conds.length) sql += ` WHERE ${conds.join(' AND ')}`;
    sql += ` ORDER BY al.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit || '100'), parseInt(offset || '0'));
    const result = await db.query(sql, params);
    // Count
    const countResult = await db.query('SELECT COUNT(*) as total FROM core.audit_log');
    res.json({ data: result.rows, total: parseInt(countResult.rows[0].total), page: { limit: parseInt(limit || '100'), offset: parseInt(offset || '0') } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Audit summary stats
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT
        COUNT(*) as total_entries,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24h,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7d,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30d,
        (SELECT json_object_agg(action_type, cnt) FROM (SELECT action_type, COUNT(*) as cnt FROM core.audit_log GROUP BY action_type) sub) as action_breakdown,
        (SELECT json_object_agg(entity_type, cnt) FROM (SELECT entity_type, COUNT(*) as cnt FROM core.audit_log GROUP BY entity_type) sub) as entity_breakdown
      FROM core.audit_log
    `);
    // Size estimate
    const size = await db.query(`
      SELECT pg_total_relation_size('core.audit_log') as bytes,
             pg_size_pretty(pg_total_relation_size('core.audit_log')) as size_pretty
    `);
    res.json({ data: { ...stats.rows[0], storage: size.rows[0] } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Compress logs older than N days (archive old records)
router.post('/compress', async (req, res) => {
  try {
    const { olderThanDays } = req.body;
    const days = olderThanDays || 7;
    const result = await db.query(
      `INSERT INTO core.audit_log_archive (user_id, action_type, entity_type, entity_id, old_values, new_values, ip_address, user_agent, area_id, original_created_at, compressed_at)
       SELECT user_id, action_type, entity_type, entity_id, old_values, new_values, ip_address, user_agent, area_id, created_at, NOW()
       FROM core.audit_log
       WHERE created_at < NOW() - INTERVAL '${parseInt(days)} days'
       RETURNING id`
    );
    // Delete compressed originals
    const deleted = await db.query(
      `DELETE FROM core.audit_log WHERE created_at < NOW() - INTERVAL '${parseInt(days)} days'`
    );
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, new_values)
       VALUES ($1,'compress','audit','system',$2)`,
      [req.user.sub, JSON.stringify({ compressedCount: result.rows.length, deletedCount: deleted.rowCount })]
    );
    res.json({ message: `Compressed ${result.rows.length} records older than ${days} days` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get retention status
router.get('/retention', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM core.audit_log WHERE created_at < NOW() - INTERVAL '7 days') as compressible_7d,
        (SELECT COUNT(*) FROM core.audit_log WHERE created_at < NOW() - INTERVAL '30 days') as deletable_30d,
        (SELECT MAX(created_at) FROM core.audit_log) as newest,
        (SELECT MIN(created_at) FROM core.audit_log) as oldest,
        (SELECT COUNT(*) FROM core.audit_log_archive) as archived_count
    `);
    res.json({ data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
