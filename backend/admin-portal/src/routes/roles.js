const express = require('express');
const router = express.Router();
const db = require('../services/db');

router.get('/', async (req, res) => {
  try {
    const r = await db.query(`SELECT r.*, (SELECT COUNT(*) FROM core.user_role_assignments ura WHERE ura.role_id = r.id) as assigned_users FROM core.roles r ORDER BY r.role_name`);
    res.json({ data: r.rows, total: r.rows.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM core.roles WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Role not found' });
    res.json({ data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { roleName, roleCode, description } = req.body;
    if (!roleName || !roleCode) return res.status(400).json({ error: 'roleName, roleCode required' });
    const r = await db.query(`INSERT INTO core.roles (role_name, role_code, description) VALUES ($1,$2,$3) RETURNING *`, [roleName, roleCode, description||null]);
    res.status(201).json({ data: r.rows[0] });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Role code exists' });
    res.status(500).json({ error: e.message });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const { roleName, description } = req.body;
    const sets = []; const vals = []; let i = 1;
    if (roleName !== undefined) { sets.push(`role_name = $${i++}`); vals.push(roleName); }
    if (description !== undefined) { sets.push(`description = $${i++}`); vals.push(description); }
    if (!sets.length) return res.status(400).json({ error: 'No fields' });
    vals.push(req.params.id);
    const r = await db.query(`UPDATE core.roles SET ${sets.join(',')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM core.user_role_assignments WHERE role_id = $1', [req.params.id]);
    await db.query('DELETE FROM core.role_permissions WHERE role_id = $1', [req.params.id]);
    await db.query('DELETE FROM core.roles WHERE id = $1', [req.params.id]);
    res.json({ message: 'Role deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
