const express = require('express');
const router = express.Router();
const db = require('../services/db');

router.get('/', async (req, res) => {
  try {
    const { userId, actionType, entityType, days, limit='100', offset='0' } = req.query;
    let sql = `SELECT al.*, u.username FROM core.audit_log al JOIN core.users u ON u.id = al.user_id`;
    const p = []; const c = [];
    if (userId) { c.push(`al.user_id = $${p.length+1}`); p.push(userId); }
    if (actionType) { c.push(`al.action_type = $${p.length+1}`); p.push(actionType); }
    if (entityType) { c.push(`al.entity_type = $${p.length+1}`); p.push(entityType); }
    if (days) { c.push(`al.created_at >= NOW() - INTERVAL '${parseInt(days)} days'`); }
    if (c.length) sql += ` WHERE ${c.join(' AND ')}`;
    sql += ` ORDER BY al.created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    const r = await db.query(sql, p);
    const cnt = await db.query('SELECT COUNT(*) as t FROM core.audit_log');
    res.json({ data: r.rows, total: parseInt(cnt.rows[0].t) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/stats', async (req, res) => {
  try {
    const r = await db.query(`SELECT COUNT(*) as total, COUNT(DISTINCT user_id) as unique_users, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '24 hours') as last_24h, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as last_7d, COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as last_30d FROM core.audit_log`);
    res.json({ data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/compress', async (req, res) => {
  try {
    const days = parseInt(req.body.olderThanDays || '7');
    await db.query(`DELETE FROM core.audit_log WHERE created_at < NOW() - INTERVAL '${days} days'`);
    await db.query(`INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, new_values) VALUES ($1,'compress','audit','system',$2)`, [req.user.sub, JSON.stringify({ deleted: true, olderThanDays: days })]);
    res.json({ message: `Audit logs older than ${days} days compressed` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/retention', async (req, res) => {
  try {
    const r = await db.query(`SELECT (SELECT COUNT(*) FROM core.audit_log WHERE created_at < NOW() - INTERVAL '7 days') as compressible, (SELECT COUNT(*) FROM core.audit_log WHERE created_at < NOW() - INTERVAL '30 days') as deletable, (SELECT MAX(created_at) FROM core.audit_log) as newest, (SELECT MIN(created_at) FROM core.audit_log) as oldest FROM core.audit_log LIMIT 1`);
    res.json({ data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
