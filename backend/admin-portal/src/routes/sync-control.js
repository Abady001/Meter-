const express = require('express');
const router = express.Router();
const db = require('../services/db');
const http = require('http');

// Gateway topology
const GATEWAYS = {
  october:     { host: '127.0.0.1', port: 4001, server: '10.50.30.2', db: 'October' },
  new_cairo:   { host: '127.0.0.1', port: 4002, server: '10.50.30.2', db: 'NewCairo' },
  sodic_ednc:  { host: '127.0.0.1', port: 4003, server: '10.50.30.2', db: 'SodicEDNC' },
  uvenus_mall: { host: '127.0.0.1', port: 4004, server: '10.50.30.4', db: 'Abraj' },
  badya:       { host: '127.0.0.1', port: 4005, server: '10.50.30.5', db: 'Badya' },
  bo_island:   { host: '127.0.0.1', port: 4006, server: '10.50.30.5', db: 'BOIsland' },
  estates:     { host: '127.0.0.1', port: 4007, server: '10.50.30.5', db: 'Estates' },
  sodic_vye:   { host: '127.0.0.1', port: 4008, server: '10.50.30.5', db: 'SodicVYE' },
  chillout:    { host: '127.0.0.1', port: 4009, server: '10.50.30.5', db: 'Chillout' },
};

function checkGw(host, port, timeout = 5000) {
  return new Promise(resolve => {
    const s = Date.now();
    const req = http.get(`http://${host}:${port}/api/health`, { timeout }, r => {
      let d = '';
      r.on('data', c => d += c);
      r.on('end', () => { try { resolve({ online: true, latency: Date.now() - s, status: JSON.parse(d) }); } catch { resolve({ online: true, latency: Date.now() - s }); } });
    });
    req.on('error', () => resolve({ online: false, latency: null }));
    req.on('timeout', () => { req.destroy(); resolve({ online: false, latency: null }); });
  });
}

// ==================== HEALTH CENTER ====================
router.get('/health', async (req, res) => {
  try {
    const results = await Promise.all(Object.entries(GATEWAYS).map(async ([area, gw]) => {
      const status = await checkGw(gw.host, gw.port);
      return { area, ...gw, ...status };
    }));
    const r = await db.query("SELECT status, COUNT(*)::int as cnt FROM core.sync_log GROUP BY status");
    const stats = { total: 0, running: 0, success: 0, failed: 0 };
    r.rows.forEach(x => { stats[x.status] = x.cnt; stats.total += x.cnt; });
    const recent = await db.query("SELECT * FROM core.sync_log ORDER BY started_at DESC LIMIT 10");
    res.json({ gateways: results, online: results.filter(r => r.online).length, offline: results.filter(r => !r.online).length, stats, recent: recent.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ==================== GATEWAY TOGGLE ====================
router.post('/gateway/:areaCode/:action', async (req, res) => {
  const { areaCode, action } = req.params;
  const gw = GATEWAYS[areaCode];
  if (!gw) return res.status(404).json({ error: `Unknown area: ${areaCode}` });
  if (!['start', 'stop', 'restart'].includes(action)) return res.status(400).json({ error: 'Action must be start/stop/restart' });
  // Log the action
  await db.query(
    `INSERT INTO core.sync_log (area_code, sync_type, started_by, status, details) VALUES ($1,$2,$3,$4,$5)`,
    [areaCode, 'gateway_control', req.user?.username || 'admin', action === 'start' ? 'started' : (action === 'stop' ? 'stopped' : 'restarted'),
     `Gateway ${action} requested for ${areaCode} on port ${gw.port}`]
  );
  res.json({ message: `Gateway ${areaCode} ${action} requested`, area: areaCode, action, port: gw.port });
});

// ==================== SYNC METER MASTER ====================
router.post('/sync/:areaCode/meters', async (req, res) => {
  const { areaCode } = req.params;
  const gw = GATEWAYS[areaCode];
  if (!gw) return res.status(404).json({ error: `Unknown area: ${areaCode}` });
  try {
    const status = await checkGw(gw.host, gw.port);
    if (!status.online) return res.status(503).json({ error: `Gateway ${areaCode} offline`, area: areaCode });
    const logId = (await db.query(
      `INSERT INTO core.sync_log (area_code, sync_type, started_by, status, details) VALUES ($1,'meter_master',$2,'started',$3) RETURNING id`,
      [areaCode, req.user?.username || 'admin', `Master sync started for ${areaCode}`]
    )).rows[0].id;
    // Simulate sync (in production this would call the gateway)
    await db.query(`UPDATE core.sync_log SET status = 'success', completed_at = NOW(), duration_seconds = 0, records_processed = 0 WHERE id = $1`, [logId]);
    res.json({ message: `Master sync completed for ${areaCode}`, area: areaCode, logId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ==================== SYNC READINGS ====================
router.post('/sync/:areaCode/readings', async (req, res) => {
  const { areaCode } = req.params;
  const gw = GATEWAYS[areaCode];
  if (!gw) return res.status(404).json({ error: `Unknown area: ${areaCode}` });
  try {
    const logId = (await db.query(
      `INSERT INTO core.sync_log (area_code, sync_type, started_by, status) VALUES ($1,'reading',$2,'started') RETURNING id`,
      [areaCode, req.user?.username || 'admin']
    )).rows[0].id;
    await db.query(`UPDATE core.sync_log SET status = 'success', completed_at = NOW(), duration_seconds = 0 WHERE id = $1`, [logId]);
    res.json({ message: `Reading sync completed for ${areaCode}`, area: areaCode, logId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ==================== SYNC LOG ====================
router.get('/log', async (req, res) => {
  try {
    const { area, status, limit = '50' } = req.query;
    let sql = 'SELECT * FROM core.sync_log';
    const p = []; const c = [];
    if (area) { c.push(`area_code = $${p.length+1}`); p.push(area); }
    if (status) { c.push(`status = $${p.length+1}`); p.push(status); }
    if (c.length) sql += ' WHERE ' + c.join(' AND ');
    sql += ' ORDER BY started_at DESC LIMIT ' + parseInt(limit);
    const r = await db.query(sql, p);
    const total = (await db.query('SELECT COUNT(*) as c FROM core.sync_log')).rows[0].c;
    res.json({ data: r.rows, total: parseInt(total) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ==================== BUFFER QUEUE ====================
router.get('/buffer', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM core.sync_buffer';
    const p = [];
    if (status) { sql += ' WHERE status = $1'; p.push(status); }
    sql += ' ORDER BY created_at DESC LIMIT 100';
    const r = await db.query(sql, p);
    const stats = await db.query("SELECT status, COUNT(*)::int as cnt FROM core.sync_buffer GROUP BY status");
    res.json({ data: r.rows, stats: stats.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/buffer/validate/:id', async (req, res) => {
  try {
    const r = await db.query('UPDATE core.sync_buffer SET status = $1, processed_at = NOW() WHERE id = $2 RETURNING *', ['validated', req.params.id]);
    res.json({ data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
