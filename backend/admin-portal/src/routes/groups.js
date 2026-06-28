const express = require('express');
const router = express.Router();
const db = require('../services/db');

router.get('/', async (req, res) => {
  try {
    const r = await db.query('SELECT g.* FROM core.user_groups g ORDER BY g.group_name');
    res.json({ data: r.rows, total: r.rows.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/:id', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM core.user_groups WHERE id = $1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'Group not found' });
    res.json({ data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { groupName, description } = req.body;
    if (!groupName) return res.status(400).json({ error: 'groupName required' });
    const r = await db.query(`INSERT INTO core.user_groups (group_name, description) VALUES ($1,$2) RETURNING *`, [groupName, description||null]);
    res.status(201).json({ data: r.rows[0] });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Group exists' });
    res.status(500).json({ error: e.message });
  }
});
router.put('/:id', async (req, res) => {
  try {
    const cur = await db.query('SELECT * FROM core.user_groups WHERE id = $1', [req.params.id]);
    if (!cur.rows.length) return res.status(404).json({ error: 'Group not found' });
    const { groupName, description, isActive } = req.body;
    const sets = []; const vals = []; let i = 1;
    if (groupName !== undefined) { sets.push(`group_name = $${i++}`); vals.push(groupName); }
    if (description !== undefined) { sets.push(`description = $${i++}`); vals.push(description); }
    if (isActive !== undefined) { sets.push(`is_active = $${i++}`); vals.push(isActive); }
    if (!sets.length) return res.status(400).json({ error: 'No fields' });
    vals.push(req.params.id);
    const r = await db.query(`UPDATE core.user_groups SET ${sets.join(',')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.patch('/:id/toggle-active', async (req, res) => {
  try {
    const cur = await db.query('SELECT * FROM core.user_groups WHERE id = $1', [req.params.id]);
    if (!cur.rows.length) return res.status(404).json({ error: 'Group not found' });
    const nv = !cur.rows[0].is_active;
    const r = await db.query('UPDATE core.user_groups SET is_active = $1 WHERE id = $2 RETURNING *', [nv, req.params.id]);
    res.json({ data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    const cur = await db.query('SELECT * FROM core.user_groups WHERE id = $1', [req.params.id]);
    if (!cur.rows.length) return res.status(404).json({ error: 'Group not found' });
    await db.query('DELETE FROM core.user_groups WHERE id = $1', [req.params.id]);
    res.json({ message: 'Group deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
