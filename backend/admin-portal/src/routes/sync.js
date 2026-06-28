const express = require('express');
const router = express.Router();
const http = require('http');
const db = require('../services/db');

const GATEWAYS = [
  { name:'October', port:4001, host:'127.0.0.1', areaCode:'october' },
  { name:'New Cairo', port:4002, host:'127.0.0.1', areaCode:'new_cairo' },
  { name:'Sodic EDNC', port:4003, host:'127.0.0.1', areaCode:'sodic_ednc' },
  { name:'UVenus Mall', port:4004, host:'127.0.0.1', areaCode:'uvenus_mall' },
  { name:'Badya', port:4005, host:'127.0.0.1', areaCode:'badya' },
  { name:'Bo Island', port:4006, host:'127.0.0.1', areaCode:'bo_island' },
  { name:'Estates', port:4007, host:'127.0.0.1', areaCode:'estates' },
  { name:'Sodic VYE', port:4008, host:'127.0.0.1', areaCode:'sodic_vye' },
  { name:'Chillout', port:4009, host:'127.0.0.1', areaCode:'chillout' },
];

function checkGw(host, port, timeout=3000) {
  return new Promise(resolve => {
    const s = Date.now();
    const req = http.get(`http://${host}:${port}/api/health`, { timeout }, r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => { try { JSON.parse(d); resolve({ online:true, latency:Date.now()-s }); } catch { resolve({ online:true, latency:Date.now()-s }); } });
    });
    req.on('error', () => resolve({ online:false, latency:null }));
    req.on('timeout', () => { req.destroy(); resolve({ online:false, latency:null }); });
  });
}

router.get('/', async (req, res) => {
  try {
    const statuses = await Promise.all(GATEWAYS.map(g => checkGw(g.host, g.port)));
    res.json({ data: GATEWAYS.map((g,i) => ({...g, ...statuses[i]})), online: statuses.filter(s=>s.online).length, offline: statuses.filter(s=>!s.online).length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/:areaCode', async (req, res) => {
  const gw = GATEWAYS.find(g => g.areaCode === req.params.areaCode);
  if (!gw) return res.status(404).json({ error: 'Gateway not found' });
  const s = await checkGw(gw.host, gw.port);
  res.json({ data: { ...gw, ...s } });
});
module.exports = router;
