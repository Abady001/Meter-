const express = require('express');
const router = express.Router();
const db = require('../services/db');

router.get('/', async (req, res) => {
  try {
    const r = await db.query('SELECT key, value, updated_at FROM core.settings ORDER BY key');
    const s = {}; r.rows.forEach(x => s[x.key] = x.value);
    res.json({ data: s });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.put('/', async (req, res) => {
  try {
    for (const [k, v] of Object.entries(req.body)) {
      await db.query(`INSERT INTO core.settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`, [k, String(v)]);
    }
    res.json({ message: `${Object.keys(req.body).length} settings updated` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/database', async (req, res) => {
  try {
    const r = await db.query(`SELECT current_database() as db, version() as pg_version, (SELECT COUNT(*) FROM core.areas) as areas, (SELECT COUNT(*) FROM core.projects) as projects, (SELECT COUNT(*) FROM core.users) as users, (SELECT COUNT(*) FROM core.roles) as roles, (SELECT COUNT(*) FROM core.permissions) as permissions`);
    res.json({ data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
module.exports = router;
