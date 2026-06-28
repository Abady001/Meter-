const express = require('express');
const router = express.Router();
const db = require('../services/db');
const { z } = require('zod');

const createProjectSchema = z.object({
  areaId: z.string().uuid(),
  projectCode: z.string().min(1).max(50),
  projectName: z.string().min(1).max(200),
  locationJson: z.any().optional(),
  isActive: z.boolean().optional().default(true),
});

router.get('/', async (req, res) => {
  try {
    const { areaId } = req.query;
    let sql = `SELECT p.*, a.area_name FROM core.projects p JOIN core.areas a ON a.id = p.area_id`;
    const params = [];
    if (areaId) { sql += ` WHERE p.area_id = $1`; params.push(areaId); }
    sql += ` ORDER BY a.area_name, p.project_name`;
    const result = await db.query(sql, params);
    res.json({ data: result.rows, total: result.rows.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, a.area_name FROM core.projects p JOIN core.areas a ON a.id = p.area_id WHERE p.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    res.json({ data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const parsed = createProjectSchema.parse(req.body);
    // Verify area exists
    const area = await db.query('SELECT id FROM core.areas WHERE id = $1 AND is_active = true', [parsed.areaId]);
    if (area.rows.length === 0) return res.status(400).json({ error: 'Area not found or inactive' });
    const result = await db.query(
      `INSERT INTO core.projects (area_id, project_code, project_name, location_json, is_active)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [parsed.areaId, parsed.projectCode, parsed.projectName, parsed.locationJson ? JSON.stringify(parsed.locationJson) : null, parsed.isActive]
    );
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, new_values)
       VALUES ($1,'create','project',$2,$3)`,
      [req.user.sub, result.rows[0].id, JSON.stringify(result.rows[0])]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ error: 'Validation failed', details: err.errors });
    if (err.code === '23505') return res.status(409).json({ error: 'Project code already exists in this area' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const current = await db.query('SELECT * FROM core.projects WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    const { projectName, projectCode, locationJson, isActive } = req.body;
    const fields = []; const values = []; let idx = 1;
    if (projectName !== undefined) { fields.push(`project_name = $${idx++}`); values.push(projectName); }
    if (projectCode !== undefined) { fields.push(`project_code = $${idx++}`); values.push(projectCode); }
    if (locationJson !== undefined) { fields.push(`location_json = $${idx++}`); values.push(JSON.stringify(locationJson)); }
    if (isActive !== undefined) { fields.push(`is_active = $${idx++}`); values.push(isActive); }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.params.id);
    const result = await db.query(
      `UPDATE core.projects SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values
    );
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values, new_values)
       VALUES ($1,'update','project',$2,$3,$4)`,
      [req.user.sub, req.params.id, JSON.stringify(current.rows[0]), JSON.stringify(result.rows[0])]
    );
    res.json({ data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch('/:id/toggle-active', async (req, res) => {
  try {
    const current = await db.query('SELECT * FROM core.projects WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    const newStatus = !current.rows[0].is_active;
    const result = await db.query('UPDATE core.projects SET is_active = $1 WHERE id = $2 RETURNING *', [newStatus, req.params.id]);
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values, new_values)
       VALUES ($1,$2,'project',$3,$4,$5)`,
      [req.user.sub, newStatus ? 'activate' : 'deactivate', req.params.id, JSON.stringify(current.rows[0]), JSON.stringify(result.rows[0])]
    );
    res.json({ data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const current = await db.query('SELECT * FROM core.projects WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    await db.query('UPDATE core.projects SET is_active = false WHERE id = $1', [req.params.id]);
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values)
       VALUES ($1,'delete','project',$2,$3)`,
      [req.user.sub, req.params.id, JSON.stringify(current.rows[0])]
    );
    res.json({ message: 'Project archived' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id/hard', async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') return res.status(403).json({ error: 'Super Admin only' });
    const current = await db.query('SELECT * FROM core.projects WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    await db.query('DELETE FROM core.projects WHERE id = $1', [req.params.id]);
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values)
       VALUES ($1,'hard_delete','project',$2,$3)`,
      [req.user.sub, req.params.id, JSON.stringify(current.rows[0])]
    );
    res.json({ message: 'Project permanently deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
