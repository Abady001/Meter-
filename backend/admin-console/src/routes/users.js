const express = require('express');
const router = express.Router();
const db = require('../services/db');
const bcrypt = require('bcryptjs');

// List users
router.get('/', async (req, res) => {
  try {
    const { status, role, search } = req.query;
    let sql = `SELECT u.id, u.username, u.email, u.status, u.last_login_at, u.failed_login_attempts,
              u.is_mfa_enabled, u.created_at, u.updated_at,
              r.role_code, r.role_name,
              array_agg(DISTINCT ura.area_id) FILTER (WHERE ura.area_id IS NOT NULL) as area_ids
              FROM core.users u
              JOIN core.user_role_assignments ura ON ura.user_id = u.id
              JOIN core.roles r ON r.id = ura.role_id`;
    const params = []; const conds = [];
    if (status) { conds.push(`u.status = $${params.length + 1}`); params.push(status); }
    if (role) { conds.push(`r.role_code = $${params.length + 1}`); params.push(role); }
    if (search) { conds.push(`(u.username ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 1})`); params.push(`%${search}%`); }
    if (conds.length) sql += ` WHERE ${conds.join(' AND ')}`;
    sql += ` GROUP BY u.id, u.username, u.email, u.status, u.last_login_at, u.failed_login_attempts,
              u.is_mfa_enabled, u.created_at, u.updated_at, r.role_code, r.role_name
              ORDER BY u.username`;
    const result = await db.query(sql, params);
    res.json({ data: result.rows, total: result.rows.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT u.*, r.role_code, r.role_name, r.id as role_id
       FROM core.users u
       JOIN core.user_role_assignments ura ON ura.user_id = u.id
       JOIN core.roles r ON r.id = ura.role_id
       WHERE u.id = $1`, [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    // Get area assignments
    const areas = await db.query(
      `SELECT a.id, a.area_name, a.area_code FROM core.areas a
       JOIN core.user_role_assignments ura ON ura.area_id = a.id
       WHERE ura.user_id = $1 AND ura.area_id IS NOT NULL`, [req.params.id]
    );
    // Get project assignments
    const projects = await db.query(
      `SELECT p.id, p.project_name, p.project_code, a.area_name
       FROM core.projects p JOIN core.areas a ON a.id = p.area_id
       JOIN core.user_role_assignments ura ON ura.area_id = p.area_id
       WHERE ura.user_id = $1 AND ura.area_id IS NOT NULL`, [req.params.id]
    );
    res.json({ data: { ...result.rows[0], areas: areas.rows, projects: projects.rows } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { username, email, password, roleCode, areaIds } = req.body;
    if (!username || !email || !password || !roleCode) return res.status(400).json({ error: 'username, email, password, roleCode required' });

    const hash = await bcrypt.hash(password, 12);
    const role = await db.query('SELECT id FROM core.roles WHERE role_code = $1', [roleCode]);
    if (role.rows.length === 0) return res.status(400).json({ error: 'Invalid role code' });

    const user = await db.query(
      `INSERT INTO core.users (username, email, password_hash, status, password_changed_at)
       VALUES ($1,$2,$3,'active',NOW()) RETURNING *`,
      [username, email, hash]
    );

    // Assign role
    if (areaIds && Array.isArray(areaIds)) {
      for (const areaId of areaIds) {
        await db.query(
          `INSERT INTO core.user_role_assignments (user_id, role_id, area_id, assigned_by)
           VALUES ($1,$2,$3,$4)`,
          [user.rows[0].id, role.rows[0].id, areaId, req.user.sub]
        );
      }
    } else {
      await db.query(
        `INSERT INTO core.user_role_assignments (user_id, role_id, assigned_by)
         VALUES ($1,$2,$3)`,
        [user.rows[0].id, role.rows[0].id, req.user.sub]
      );
    }

    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, new_values)
       VALUES ($1,'create','user',$2,$3)`,
      [req.user.sub, user.rows[0].id, JSON.stringify({ username, email, roleCode })]
    );

    res.status(201).json({ data: { id: user.rows[0].id, username, email, roleCode } });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Username or email already exists' });
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const current = await db.query('SELECT * FROM core.users WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const { email, status, roleCode } = req.body;
    const fields = []; const values = []; let idx = 1;
    if (email !== undefined) { fields.push(`email = $${idx++}`); values.push(email); }
    if (status !== undefined) { fields.push(`status = $${idx++}`); values.push(status); }
    if (fields.length) {
      values.push(req.params.id);
      await db.query(`UPDATE core.users SET ${fields.join(', ')} WHERE id = $${idx}`, values);
    }
    if (roleCode) {
      const role = await db.query('SELECT id FROM core.roles WHERE role_code = $1', [roleCode]);
      if (role.rows.length) {
        await db.query('UPDATE core.user_role_assignments SET role_id = $1 WHERE user_id = $2', [role.rows[0].id, req.params.id]);
      }
    }
    const updated = await db.query('SELECT id, username, email, status FROM core.users WHERE id = $1', [req.params.id]);
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values, new_values)
       VALUES ($1,'update','user',$2,$3,$4)`,
      [req.user.sub, req.params.id, JSON.stringify(current.rows[0]), JSON.stringify(updated.rows[0])]
    );
    res.json({ data: updated.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Reset password
router.post('/:id/reset-password', async (req, res) => {
  try {
    const { newPassword, forceChange } = req.body;
    if (!newPassword || newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    const hash = await bcrypt.hash(newPassword, 12);
    await db.query(
      `UPDATE core.users SET password_hash = $1, password_changed_at = ${forceChange ? 'NULL' : 'NOW()'} WHERE id = $2`,
      [hash, req.params.id]
    );
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, new_values)
       VALUES ($1,'password_reset','user',$2,$3)`,
      [req.user.sub, req.params.id, JSON.stringify({ forced: !!forceChange })]
    );
    res.json({ message: 'Password reset successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Toggle lock
router.patch('/:id/toggle-lock', async (req, res) => {
  try {
    const user = await db.query('SELECT status FROM core.users WHERE id = $1', [req.params.id]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const newStatus = user.rows[0].status === 'locked' ? 'active' : 'locked';
    await db.query('UPDATE core.users SET status = $1 WHERE id = $2', [newStatus, req.params.id]);
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, new_values)
       VALUES ($1,$2,'user',$3,$4)`,
      [req.user.sub, newStatus === 'locked' ? 'lock' : 'unlock', req.params.id, JSON.stringify({ status: newStatus })]
    );
    res.json({ message: `User ${newStatus === 'locked' ? 'locked' : 'unlocked'}` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete (soft)
router.delete('/:id', async (req, res) => {
  try {
    const current = await db.query('SELECT * FROM core.users WHERE id = $1', [req.params.id]);
    if (current.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    await db.query('UPDATE core.users SET status = $1 WHERE id = $2', ['suspended', req.params.id]);
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values)
       VALUES ($1,'delete','user',$2,$3)`,
      [req.user.sub, req.params.id, JSON.stringify(current.rows[0])]
    );
    res.json({ message: 'User suspended (soft delete)' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Login history
router.get('/:id/login-history', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, action_type, created_at, ip_address, user_agent, old_values
       FROM core.audit_log
       WHERE user_id = $1 AND action_type IN ('login','logout')
       ORDER BY created_at DESC LIMIT 100`,
      [req.params.id]
    );
    res.json({ data: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
