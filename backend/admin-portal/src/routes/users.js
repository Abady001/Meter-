const express = require('express');
const router = express.Router();
const db = require('../services/db');
const bcrypt = require('bcryptjs');

router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = `SELECT u.id, u.username, u.email, u.status, u.last_login_at, u.failed_login_attempts, u.is_mfa_enabled, u.created_at, r.role_code, r.role_name FROM core.users u JOIN core.user_role_assignments ura ON ura.user_id = u.id JOIN core.roles r ON r.id = ura.role_id`;
    const p = [];
    if (status) { sql += ` WHERE u.status = $1`; p.push(status); }
    sql += ` ORDER BY u.username`;
    const r = await db.query(sql, p);
    res.json({ data: r.rows, total: r.rows.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const r = await db.query(`SELECT u.*, r.role_code, r.role_name, r.id as role_id FROM core.users u JOIN core.user_role_assignments ura ON ura.user_id = u.id JOIN core.roles r ON r.id = ura.role_id WHERE u.id = $1`, [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ data: { ...r.rows[0], password_hash: undefined } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { username, email, password, roleCode } = req.body;
    if (!username || !email || !password || !roleCode) return res.status(400).json({ error: 'username, email, password, roleCode required' });
    const hash = await bcrypt.hash(password, 12);
    const role = await db.query('SELECT id FROM core.roles WHERE role_code = $1', [roleCode]);
    if (!role.rows.length) return res.status(400).json({ error: 'Invalid role' });
    const user = await db.query(
      `INSERT INTO core.users (id, username, email, password_hash, status, password_changed_at, created_at, updated_at)
       VALUES ($1,$2,$3,$4,'active',NOW(),NOW(),NOW()) RETURNING id, username, email, status`,
      [require('crypto').randomUUID(), username, email, hash]
    );
    await db.query(`INSERT INTO core.user_role_assignments (id, user_id, role_id, assigned_by) VALUES ($1,$2,$3,$4)`,
      [require('crypto').randomUUID(), user.rows[0].id, role.rows[0].id, req.user.sub]);
    await db.query(`INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, new_values) VALUES ($1,'create','user',$2,$3)`, [req.user.sub, user.rows[0].id, JSON.stringify({ username, email, roleCode })]);
    res.status(201).json({ data: user.rows[0] });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Username or email exists' });
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const cur = await db.query('SELECT id, username, email, status FROM core.users WHERE id = $1', [req.params.id]);
    if (!cur.rows.length) return res.status(404).json({ error: 'User not found' });
    const { email, status, roleCode } = req.body;
    const sets = []; const vals = []; let i = 1;
    if (email !== undefined) { sets.push(`email = $${i++}`); vals.push(email); }
    if (status !== undefined) { sets.push(`status = $${i++}`); vals.push(status); }
    if (sets.length) { vals.push(req.params.id); await db.query(`UPDATE core.users SET ${sets.join(',')} WHERE id = $${i}`, vals); }
    if (roleCode) {
      const role = await db.query('SELECT id FROM core.roles WHERE role_code = $1', [roleCode]);
      if (role.rows.length) await db.query('UPDATE core.user_role_assignments SET role_id = $1 WHERE user_id = $2', [role.rows[0].id, req.params.id]);
    }
    const updated = await db.query('SELECT id, username, email, status FROM core.users WHERE id = $1', [req.params.id]);
    await db.query(`INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values, new_values) VALUES ($1,'update','user',$2,$3,$4)`, [req.user.sub, req.params.id, JSON.stringify(cur.rows[0]), JSON.stringify(updated.rows[0])]);
    res.json({ data: updated.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/:id/reset-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) return res.status(400).json({ error: 'Password min 8 chars' });
    const hash = await bcrypt.hash(newPassword, 12);
    await db.query('UPDATE core.users SET password_hash = $1, password_changed_at = NOW() WHERE id = $2', [hash, req.params.id]);
    await db.query(`INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, new_values) VALUES ($1,'password_reset','user',$2,$3)`, [req.user.sub, req.params.id, JSON.stringify({ reset: true })]);
    res.json({ message: 'Password reset' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id/toggle-lock', async (req, res) => {
  try {
    const cur = await db.query('SELECT status FROM core.users WHERE id = $1', [req.params.id]);
    if (!cur.rows.length) return res.status(404).json({ error: 'User not found' });
    const ns = cur.rows[0].status === 'locked' ? 'active' : 'locked';
    await db.query('UPDATE core.users SET status = $1 WHERE id = $2', [ns, req.params.id]);
    await db.query(`INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, new_values) VALUES ($1,$2,'user',$3,$4)`, [req.user.sub, ns==='locked'?'lock':'unlock', req.params.id, JSON.stringify({ status: ns })]);
    res.json({ message: ns === 'locked' ? 'User locked' : 'User unlocked' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const cur = await db.query('SELECT status FROM core.users WHERE id = $1', [req.params.id]);
    if (!cur.rows.length) return res.status(404).json({ error: 'User not found' });
    const ns = cur.rows[0].status === 'active' ? 'inactive' : 'active';
    await db.query('UPDATE core.users SET status = $1 WHERE id = $2', [ns, req.params.id]);
    await db.query(`INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, new_values) VALUES ($1,$2,'user',$3,$4)`, [req.user.sub, ns==='active'?'activate':'deactivate', req.params.id, JSON.stringify({ status: ns })]);
    res.json({ message: ns === 'active' ? 'User activated' : 'User deactivated' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const cur = await db.query('SELECT * FROM core.users WHERE id = $1', [req.params.id]);
    if (!cur.rows.length) return res.status(404).json({ error: 'User not found' });
    await db.query("UPDATE core.users SET status = 'suspended' WHERE id = $1", [req.params.id]);
    await db.query(`INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values) VALUES ($1,'suspend','user',$2,$3)`, [req.user.sub, req.params.id, JSON.stringify(cur.rows[0])]);
    res.json({ message: 'User suspended' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id/login-history', async (req, res) => {
  try {
    const r = await db.query(`SELECT id, action_type, created_at, ip_address, user_agent FROM core.audit_log WHERE user_id = $1 AND action_type IN ('login','logout') ORDER BY created_at DESC LIMIT 100`, [req.params.id]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
