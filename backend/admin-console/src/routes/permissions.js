const express = require('express');
const router = express.Router();
const db = require('../services/db');

// List all permissions
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, array_agg(r.role_code) FILTER (WHERE r.role_code IS NOT NULL) as assigned_roles
       FROM core.permissions p
       LEFT JOIN core.role_permissions rp ON rp.permission_id = p.id
       LEFT JOIN core.roles r ON r.id = rp.role_id
       GROUP BY p.id ORDER BY p.module, p.display_name`
    );
    res.json({ data: result.rows, total: result.rows.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// List roles with their permissions
router.get('/matrix', async (req, res) => {
  try {
    const roles = await db.query('SELECT id, role_code, role_name FROM core.roles ORDER BY role_name');
    const permissions = await db.query(
      `SELECT p.*, rp.role_id as assigned_role_id
       FROM core.permissions p
       LEFT JOIN core.role_permissions rp ON rp.permission_id = p.id
       ORDER BY p.module, p.display_name`
    );
    // Build matrix
    const matrix = roles.rows.map(role => ({
      role: { id: role.id, code: role.role_code, name: role.role_name },
      permissions: permissions.rows
        .filter(p => p.assigned_role_id === role.id)
        .map(p => ({ id: p.id, code: p.permission_code, name: p.display_name, module: p.module }))
    }));
    res.json({ roles: roles.rows, permissions: [...new Map(permissions.rows.map(p => [p.id, p])).values()], matrix });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Tree view
router.get('/tree', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.module, json_agg(json_build_object('id', p.id, 'code', p.permission_code, 'name', p.display_name) ORDER BY p.display_name) as permissions
       FROM core.permissions p GROUP BY p.module ORDER BY p.module`
    );
    res.json({ data: result.rows });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Create permission
router.post('/', async (req, res) => {
  try {
    const { permissionCode, displayName, module } = req.body;
    if (!permissionCode || !displayName || !module) return res.status(400).json({ error: 'permissionCode, displayName, module required' });
    const result = await db.query(
      `INSERT INTO core.permissions (permission_code, display_name, module) VALUES ($1,$2,$3) RETURNING *`,
      [permissionCode, displayName, module]
    );
    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Permission code already exists' });
    res.status(500).json({ error: err.message });
  }
});

// Assign permission to role
router.post('/assign', async (req, res) => {
  try {
    const { permissionId, roleId } = req.body;
    if (!permissionId || !roleId) return res.status(400).json({ error: 'permissionId and roleId required' });
    await db.query(
      `INSERT INTO core.role_permissions (role_id, permission_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`,
      [roleId, permissionId]
    );
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, new_values)
       VALUES ($1,'assign','permission',$2,$3)`,
      [req.user.sub, permissionId, JSON.stringify({ roleId })]
    );
    res.json({ message: 'Permission assigned to role' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Remove permission from role
router.post('/unassign', async (req, res) => {
  try {
    const { permissionId, roleId } = req.body;
    if (!permissionId || !roleId) return res.status(400).json({ error: 'permissionId and roleId required' });
    await db.query('DELETE FROM core.role_permissions WHERE role_id = $1 AND permission_id = $2', [roleId, permissionId]);
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, old_values)
       VALUES ($1,'unassign','permission',$2,$3)`,
      [req.user.sub, permissionId, JSON.stringify({ roleId })]
    );
    res.json({ message: 'Permission removed from role' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete permission
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM core.role_permissions WHERE permission_id = $1', [req.params.id]);
    await db.query('DELETE FROM core.permissions WHERE id = $1', [req.params.id]);
    res.json({ message: 'Permission deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
