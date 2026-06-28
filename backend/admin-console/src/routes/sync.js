const express = require('express');
const router = express.Router();
const http = require('http');
const db = require('../services/db');

// Known gateways
const GATEWAYS = [
  { name: 'October', port: 4001, host: '127.0.0.1', areaCode: 'october' },
  { name: 'New Cairo', port: 4002, host: '127.0.0.1', areaCode: 'new_cairo' },
  { name: 'Sodic EDNC', port: 4003, host: '127.0.0.1', areaCode: 'sodic_ednc' },
  { name: 'UVenus Mall', port: 4004, host: '127.0.0.1', areaCode: 'uvenus_mall' },
  { name: 'Badya', port: 4005, host: '127.0.0.1', areaCode: 'badya' },
  { name: 'Bo Island', port: 4006, host: '127.0.0.1', areaCode: 'bo_island' },
  { name: 'Estates', port: 4007, host: '127.0.0.1', areaCode: 'estates' },
  { name: 'Sodic VYE', port: 4008, host: '127.0.0.1', areaCode: 'sodic_vye' },
  { name: 'Chillout', port: 4009, host: '127.0.0.1', areaCode: 'chillout' },
];

// Check gateway health
function checkGateway(host, port, timeout = 3000) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get(`http://${host}:${port}/api/health`, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const body = JSON.parse(data);
          resolve({ online: true, latency: Date.now() - start, status: res.statusCode, message: body.message || 'OK' });
        } catch { resolve({ online: true, latency: Date.now() - start, status: res.statusCode, message: 'OK' }); }
      });
    });
    req.on('error', () => resolve({ online: false, latency: null, status: null, message: 'Connection refused' }));
    req.on('timeout', () => { req.destroy(); resolve({ online: false, latency: null, status: null, message: 'Timeout' }); });
  });
}

// List all gateways with status
router.get('/', async (req, res) => {
  try {
    const statuses = await Promise.all(GATEWAYS.map(gw => checkGateway(gw.host, gw.port)));
    const result = GATEWAYS.map((gw, i) => ({ ...gw, ...statuses[i] }));
    res.json({ data: result, total: result.length, online: result.filter(r => r.online).length, offline: result.filter(r => !r.online).length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Get specific gateway status
router.get('/:areaCode', async (req, res) => {
  try {
    const gw = GATEWAYS.find(g => g.areaCode === req.params.areaCode);
    if (!gw) return res.status(404).json({ error: 'Gateway not found' });
    const status = await checkGateway(gw.host, gw.port);
    res.json({ data: { ...gw, ...status } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Gateway configuration
router.get('/config/:areaCode', async (req, res) => {
  try {
    const gw = GATEWAYS.find(g => g.areaCode === req.params.areaCode);
    if (!gw) return res.status(404).json({ error: 'Gateway not found' });
    res.json({ data: gw });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
