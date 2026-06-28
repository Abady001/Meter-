const express = require('express');
const router = express.Router();
const db = require('../services/db');

router.get('/', async (req, res) => {
  try {
    const { areaId } = req.query;
    let sql = `SELECT p.*, a.area_name FROM core.projects p JOIN core.areas a ON a.id = p.area_id`;
    const p = [];
    if (areaId) { sql += ` WHERE p.area_id = $1`; p.push(areaId); }
    sql += ` ORDER BY a.area_name, p.project_name`;
    const r = await db.query(sql, p);
    res.json({ data: r.rows, total: r.rows.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await db.query('SELECT p.*, a.area_name FROM core.projects p JOIN core.areas a ON a.id = p.area_id WHERE p.id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Project not found' });
    res.json({ data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { areaId, projectCode, projectName } = req.body;
    if (!areaId || !projectCode || !projectName) return res.status(400).json({ error: 'areaId, projectCode, projectName required' });
    const a = await db.query('SELECT id FROM core.areas WHERE id = $1 AND is_active = true', [areaId]);
    if (!a.rows.length) return res.status(400).json({ error: 'Area not found/inactive' });
    const r = await db.query(`INSERT INTO core.projects (area_id, project_code, project_name) VALUES ($1,$2,$3) RETURNING *`, [areaId, projectCode, projectName]);
    await db.query(`INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, new_values) VALUES ($1,'create','project',$2,$3)`, [req.user.sub, r.rows[0].id, JSON.stringify(r.rows[0])]);
    res.status(201).json({ data: r.rows[0] });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Project code exists in this area' });
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const cur = await db.query('SELECT * FROM core.projects WHERE id = $1', [req.params.id]);
    if (!cur.rows.length) return res.status(404).json({ error: 'Project not found' });
    const { projectName, projectCode } = req.body;
    const sets = []; const vals = []; let i = 1;
    if (projectName !== undefined) { sets.push(`project_name = $${i++}`); vals.push(projectName); }
    if (projectCode !== undefined) { sets.push(`project_code = $${i++}`); vals.push(projectCode); }
    if (!sets.length) return res.status(400).json({ error: 'No fields' });
    vals.push(req.params.id);
    const r = await db.query(`UPDATE core.projects SET ${sets.join(',')} WHERE id = $${i} RETURNING *`, vals);
    await db.query(`INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values, new_values) VALUES ($1,'update','project',$2,$3,$4)`, [req.user.sub, req.params.id, JSON.stringify(cur.rows[0]), JSON.stringify(r.rows[0])]);
    res.json({ data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id/toggle-active', async (req, res) => {
  try {
    const cur = await db.query('SELECT * FROM core.projects WHERE id = $1', [req.params.id]);
    if (!cur.rows.length) return res.status(404).json({ error: 'Project not found' });
    const nv = !cur.rows[0].is_active;
    const r = await db.query('UPDATE core.projects SET is_active = $1 WHERE id = $2 RETURNING *', [nv, req.params.id]);
    await db.query(`INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values, new_values) VALUES ($1,$2,'project',$3,$4,$5)`, [req.user.sub, nv?'activate':'deactivate', req.params.id, JSON.stringify(cur.rows[0]), JSON.stringify(r.rows[0])]);
    res.json({ data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const cur = await db.query('SELECT * FROM core.projects WHERE id = $1', [req.params.id]);
    if (!cur.rows.length) return res.status(404).json({ error: 'Project not found' });
    await db.query('UPDATE core.projects SET is_active = false WHERE id = $1', [req.params.id]);
    await db.query(`INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values) VALUES ($1,'delete','project',$2,$3)`, [req.user.sub, req.params.id, JSON.stringify(cur.rows[0])]);
    res.json({ message: 'Project archived' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
