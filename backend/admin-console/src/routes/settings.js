const express = require('express');
const router = express.Router();
const db = require('../services/db');

// Get all settings
router.get('/', async (req, res) => {
  try {
    const result = await db.query('SELECT key, value, updated_at FROM core.settings ORDER BY key');
    const settings = {};
    result.rows.forEach(r => { settings[r.key] = r.value; });
    res.json({ data: settings });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update settings (bulk)
router.put('/', async (req, res) => {
  try {
    const updates = req.body;
    for (const [key, value] of Object.entries(updates)) {
      await db.query(
        `INSERT INTO core.settings (key, value) VALUES ($1,$2)
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, String(value)]
      );
    }
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, new_values)
       VALUES ($1,'update','settings','global',$2)`,
      [req.user.sub, JSON.stringify(updates)]
    );
    res.json({ message: `${Object.keys(updates).length} settings updated` });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get system config (read-only from database)
router.get('/database', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT current_database() as database_name,
             current_schema as schema_name,
             version() as postgres_version,
             (SELECT COUNT(*) FROM core.areas) as area_count,
             (SELECT COUNT(*) FROM core.projects) as project_count,
             (SELECT COUNT(*) FROM core.users) as user_count,
             (SELECT COUNT(*) FROM core.roles) as role_count,
             (SELECT COUNT(*) FROM core.permissions) as permission_count
    `);
    res.json({ data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
