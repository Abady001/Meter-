const express = require('express');
const router = express.Router();
const db = require('../services/db');
const { z } = require('zod');

const createAreaSchema = z.object({
  areaCode: z.string().min(1).max(20),
  areaName: z.string().min(1).max(200),
  databaseName: z.string().min(1).max(100).optional(),
  connectionString: z.string().min(1).max(500).optional(),
  isActive: z.boolean().optional().default(true),
});

const updateAreaSchema = z.object({
  areaName: z.string().min(1).max(200).optional(),
  databaseName: z.string().max(100).optional(),
  connectionString: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
});

// List all areas
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.*, (SELECT COUNT(*) FROM core.projects p WHERE p.area_id = a.id) as project_count
       FROM core.areas a ORDER BY a.area_name`
    );
    res.json({ data: result.rows, total: result.rows.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get area by id
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.*, (SELECT COUNT(*) FROM core.projects p WHERE p.area_id = a.id) as project_count
       FROM core.areas a WHERE a.id = $1`, [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Area not found' });
    res.json({ data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create area
router.post('/', async (req, res) => {
  try {
    const parsed = createAreaSchema.parse(req.body);
    const result = await db.query(
      `INSERT INTO core.areas (area_code, area_name, database_name, connection_string, is_active)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [parsed.areaCode, parsed.areaName, parsed.databaseName || null, parsed.connectionString || null, parsed.isActive]
    );
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, new_values)
       VALUES ($1,'create','area',$2,$3)`,
      [req.user.sub, result.rows[0].id, JSON.stringify(result.rows[0])]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'Validation failed', details: err.errors });
    if (err.code === '23505') return res.status(409).json({ error: 'Area code already exists' });
    res.status(500).json({ error: err.message });
  }
});

// Update area
router.put('/:id', async (req, res) => {
  try {
    const parsed = updateAreaSchema.parse(req.body);
    const current = await db.query('SELECT * FROM core.areas WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Area not found' });

    const fields = [];
    const values = [];
    let idx = 1;
    if (parsed.areaName !== undefined) { fields.push(`area_name = $${idx++}`); values.push(parsed.areaName); }
    if (parsed.databaseName !== undefined) { fields.push(`database_name = $${idx++}`); values.push(parsed.databaseName); }
    if (parsed.connectionString !== undefined) { fields.push(`connection_string = $${idx++}`); values.push(parsed.connectionString); }
    if (parsed.isActive !== undefined) { fields.push(`is_active = $${idx++}`); values.push(parsed.isActive); }
    values.push(req.params.id);

    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });

    const result = await db.query(
      `UPDATE core.areas SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values, new_values)
       VALUES ($1,'update','area',$2,$3,$4)`,
      [req.user.sub, req.params.id, JSON.stringify(current.rows[0]), JSON.stringify(result.rows[0])]
    );
    res.json({ data: result.rows[0] });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'Validation failed', details: err.errors });
    res.status(500).json({ error: err.message });
  }
});

// Deactivate / Activate
router.patch('/:id/toggle-active', async (req, res) => {
  try {
    const current = await db.query('SELECT * FROM core.areas WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Area not found' });
    const newStatus = !current.rows[0].is_active;
    const result = await db.query('UPDATE core.areas SET is_active = $1 WHERE id = $2 RETURNING *', [newStatus, req.params.id]);
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values, new_values)
       VALUES ($1,$2,'area',$3,$4,$5)`,
      [req.user.sub, newStatus ? 'activate' : 'deactivate', req.params.id, JSON.stringify(current.rows[0]), JSON.stringify(result.rows[0])]
    );
    res.json({ data: result.rows[0], message: newStatus ? 'Area activated' : 'Area deactivated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Soft delete (archive)
router.delete('/:id', async (req, res) => {
  try {
    const current = await db.query('SELECT * FROM core.areas WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Area not found' });
    await db.query('UPDATE core.areas SET is_active = false WHERE id = $1', [req.params.id]);
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values)
       VALUES ($1,'delete','area',$2,$3)`,
      [req.user.sub, req.params.id, JSON.stringify(current.rows[0])]
    );
    res.json({ message: 'Area archived (soft delete)' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Hard delete (Super Admin only)
router.delete('/:id/hard', async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Super Admin only' });
    const current = await db.query('SELECT * FROM core.areas WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Area not found' });
    const projects = await db.query('SELECT COUNT(*) as cnt FROM core.projects WHERE area_id = $1', [req.params.id]);
    if (parseInt(projects.rows[0].cnt) > 0) {
      return res.status(409).json({ error: `Area has ${projects.rows[0].cnt} projects. Remove them first.` });
    }
    await db.query('DELETE FROM core.areas WHERE id = $1', [req.params.id]);
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values)
       VALUES ($1,'hard_delete','area',$2,$3)`,
      [req.user.sub, req.params.id, JSON.stringify(current.rows[0])]
    );
    res.json({ message: 'Area permanently deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
