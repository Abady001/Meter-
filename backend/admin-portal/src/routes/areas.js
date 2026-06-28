const express = require('express');
const router = express.Router();
const db = require('../services/db');
const { z } = require('zod');

const areaSchema = z.object({
  areaCode: z.string().min(1).max(20),
  areaName: z.string().min(1).max(200),
  databaseName: z.string().max(100).optional(),
  connectionString: z.string().max(500).optional(),
  isActive: z.boolean().optional().default(true),
});

// List
router.get('/', async (req, res) => {
  try {
    const r = await db.query(
      `SELECT a.*, (SELECT COUNT(*) FROM core.projects p WHERE p.area_id = a.id) as project_count
       FROM core.areas a ORDER BY a.area_name`
    );
    res.json({ data: r.rows, total: r.rows.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get one
router.get('/:id', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM core.areas WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Area not found' });
    res.json({ data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Create
router.post('/', async (req, res) => {
  try {
    const d = areaSchema.parse(req.body);
    const r = await db.query(
      `INSERT INTO core.areas (area_code, area_name, database_name, connection_string, is_active)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [d.areaCode, d.areaName, d.databaseName||null, d.connectionString||null, d.isActive]
    );
    await db.query(`INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, new_values)
       VALUES ($1,'create','area',$2,$3)`, [req.user.sub, r.rows[0].id, JSON.stringify(r.rows[0])]);
    res.status(201).json({ data: r.rows[0] });
  } catch (e) {
    if (e instanceof z.ZodError) return res.status(400).json({ error: 'Validation failed', details: e.errors });
    if (e.code === '23505') return res.status(409).json({ error: 'Area code exists' });
    res.status(500).json({ error: e.message });
  }
});

// Update
router.put('/:id', async (req, res) => {
  try {
    const cur = await db.query('SELECT * FROM core.areas WHERE id = $1', [req.params.id]);
    if (!cur.rows.length) return res.status(404).json({ error: 'Area not found' });
    const { areaName, databaseName, connectionString, isActive } = req.body;
    const sets = []; const vals = []; let i = 1;
    if (areaName !== undefined) { sets.push(`area_name = $${i++}`); vals.push(areaName); }
    if (databaseName !== undefined) { sets.push(`database_name = $${i++}`); vals.push(databaseName); }
    if (connectionString !== undefined) { sets.push(`connection_string = $${i++}`); vals.push(connectionString); }
    if (isActive !== undefined) { sets.push(`is_active = $${i++}`); vals.push(isActive); }
    if (!sets.length) return res.status(400).json({ error: 'No fields' });
    vals.push(req.params.id);
    const r = await db.query(`UPDATE core.areas SET ${sets.join(',')} WHERE id = $${i} RETURNING *`, vals);
    await db.query(`INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values, new_values)
       VALUES ($1,'update','area',$2,$3,$4)`, [req.user.sub, req.params.id, JSON.stringify(cur.rows[0]), JSON.stringify(r.rows[0])]);
    res.json({ data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Toggle active
router.patch('/:id/toggle-active', async (req, res) => {
  try {
    const cur = await db.query('SELECT * FROM core.areas WHERE id = $1', [req.params.id]);
    if (!cur.rows.length) return res.status(404).json({ error: 'Area not found' });
    const nv = !cur.rows[0].is_active;
    const r = await db.query('UPDATE core.areas SET is_active = $1 WHERE id = $2 RETURNING *', [nv, req.params.id]);
    await db.query(`INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values, new_values)
       VALUES ($1,$2,'area',$3,$4,$5)`, [req.user.sub, nv?'activate':'deactivate', req.params.id, JSON.stringify(cur.rows[0]), JSON.stringify(r.rows[0])]);
    res.json({ data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Soft delete
router.delete('/:id', async (req, res) => {
  try {
    const cur = await db.query('SELECT * FROM core.areas WHERE id = $1', [req.params.id]);
    if (!cur.rows.length) return res.status(404).json({ error: 'Area not found' });
    await db.query('UPDATE core.areas SET is_active = false WHERE id = $1', [req.params.id]);
    await db.query(`INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values)
       VALUES ($1,'delete','area',$2,$3)`, [req.user.sub, req.params.id, JSON.stringify(cur.rows[0])]);
    res.json({ message: 'Area archived' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Hard delete
router.delete('/:id/hard', async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Super Admin only' });
    const cur = await db.query('SELECT * FROM core.areas WHERE id = $1', [req.params.id]);
    if (!cur.rows.length) return res.status(404).json({ error: 'Area not found' });
    const cnt = await db.query('SELECT COUNT(*) as c FROM core.projects WHERE area_id = $1', [req.params.id]);
    if (parseInt(cnt.rows[0].c) > 0) return res.status(409).json({ error: 'Has projects, remove first' });
    await db.query('DELETE FROM core.areas WHERE id = $1', [req.params.id]);
    await db.query(`INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values)
       VALUES ($1,'hard_delete','area',$2,$3)`, [req.user.sub, req.params.id, JSON.stringify(cur.rows[0])]);
    res.json({ message: 'Area permanently deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
