const express = require('express');
const router = express.Router();
const db = require('../services/db');

// List groups
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT g.*,
        (SELECT COUNT(*) FROM core.user_role_assignments ura
         JOIN core.users u ON u.id = ura.user_id
         WHERE ura.area_id IS NULL AND u.status = 'active') as member_count
       FROM core.user_groups g ORDER BY g.group_name`
    );
    res.json({ data: result.rows, total: result.rows.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get group
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM core.user_groups WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Group not found' });
    res.json({ data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create group
router.post('/', async (req, res) => {
  try {
    const { groupName, description, permissions } = req.body;
    if (!groupName) return res.status(400).json({ error: 'groupName required' });
    const result = await db.query(
      `INSERT INTO core.user_groups (group_name, description, permissions)
       VALUES ($1,$2,$3) RETURNING *`,
      [groupName, description || null, permissions ? JSON.stringify(permissions) : null]
    );
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, new_values)
       VALUES ($1,'create','user_group',$2,$3)`,
      [req.user.sub, result.rows[0].id, JSON.stringify(result.rows[0])]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Group name already exists' });
    res.status(500).json({ error: err.message });
  }
});

// Update group
router.put('/:id', async (req, res) => {
  try {
    const current = await db.query('SELECT * FROM core.user_groups WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Group not found' });
    const { groupName, description, permissions, isActive } = req.body;
    const fields = []; const values = []; let idx = 1;
    if (groupName !== undefined) { fields.push(`group_name = $${idx++}`); values.push(groupName); }
    if (description !== undefined) { fields.push(`description = $${idx++}`); values.push(description); }
    if (permissions !== undefined) { fields.push(`permissions = $${idx++}`); values.push(JSON.stringify(permissions)); }
    if (isActive !== undefined) { fields.push(`is_active = $${idx++}`); values.push(isActive); }
    if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
    values.push(req.params.id);
    const result = await db.query(
      `UPDATE core.user_groups SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`, values
    );
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values, new_values)
       VALUES ($1,'update','user_group',$2,$3,$4)`,
      [req.user.sub, req.params.id, JSON.stringify(current.rows[0]), JSON.stringify(result.rows[0])]
    );
    res.json({ data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete group
router.delete('/:id', async (req, res) => {
  try {
    const current = await db.query('SELECT * FROM core.user_groups WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'Group not found' });
    await db.query('DELETE FROM core.user_groups WHERE id = $1', [req.params.id]);
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values)
       VALUES ($1,'delete','user_group',$2,$3)`,
      [req.user.sub, req.params.id, JSON.stringify(current.rows[0])]
    );
    res.json({ message: 'Group deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
