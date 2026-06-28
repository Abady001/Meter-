const express = require('express');
const router = express.Router();
const db = require('../services/db');

router.get('/', async (req, res) => {
  try {
    const r = await db.query(
      `SELECT p.*, array_agg(r.role_code) FILTER (WHERE r.role_code IS NOT NULL) as assigned_roles
       FROM core.permissions p LEFT JOIN core.role_permissions rp ON rp.permission_id = p.id
       LEFT JOIN core.roles r ON r.id = rp.role_id GROUP BY p.id ORDER BY p.module, p.display_name`
    );
    res.json({ data: r.rows, total: r.rows.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/matrix', async (req, res) => {
  try {
    const roles = await db.query('SELECT id, role_code, role_name FROM core.roles ORDER BY role_name');
    const perms = await db.query(`SELECT p.*, rp.role_id FROM core.permissions p LEFT JOIN core.role_permissions rp ON rp.permission_id = p.id ORDER BY p.module, p.display_name`);
    const matrix = roles.rows.map(r => ({
      role: { id: r.id, code: r.role_code, name: r.role_name },
      permissions: perms.rows.filter(p => p.role_id === r.id).map(p => ({ id: p.id, code: p.permission_code, name: p.display_name, module: p.module }))
    }));
    res.json({ roles: roles.rows, permissions: [...new Map(perms.rows.map(p => [p.id, p])).values()], matrix });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/tree', async (req, res) => {
  try {
    const r = await db.query(`SELECT p.module, json_agg(json_build_object('id',p.id,'code',p.permission_code,'name',p.display_name) ORDER BY p.display_name) as permissions FROM core.permissions p GROUP BY p.module ORDER BY p.module`);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/', async (req, res) => {
  try {
    const { permissionCode, displayName, module } = req.body;
    if (!permissionCode || !displayName || !module) return res.status(400).json({ error: 'All fields required' });
    const r = await db.query(`INSERT INTO core.permissions (permission_code, display_name, module) VALUES ($1,$2,$3) RETURNING *`, [permissionCode, displayName, module]);
    res.status(201).json({ data: r.rows[0] });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Permission code exists' });
    res.status(500).json({ error: e.message });
  }
});
router.post('/assign', async (req, res) => {
  try {
    const { permissionId, roleId } = req.body;
    if (!permissionId || !roleId) return res.status(400).json({ error: 'permissionId and roleId required' });
    await db.query(`INSERT INTO core.role_permissions (role_id, permission_id) VALUES ($1,$2) ON CONFLICT DO NOTHING`, [roleId, permissionId]);
    res.json({ message: 'Assigned' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.post('/unassign', async (req, res) => {
  try {
    const { permissionId, roleId } = req.body;
    if (!permissionId || !roleId) return res.status(400).json({ error: 'permissionId and roleId required' });
    await db.query('DELETE FROM core.role_permissions WHERE role_id = $1 AND permission_id = $2', [roleId, permissionId]);
    res.json({ message: 'Unassigned' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM core.role_permissions WHERE permission_id = $1', [req.params.id]);
    await db.query('DELETE FROM core.permissions WHERE id = $1', [req.params.id]);
    res.json({ message: 'Permission deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
