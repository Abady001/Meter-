const express = require('express');
const app = express();

const GATEWAYS = {
  october:      'http://localhost:4001',
  new_cairo:    'http://localhost:4002',
  sodic_ednc:   'http://localhost:4003',
  uvenus_mall:  'http://localhost:4004',
  badya:        'http://localhost:4005',
  bo_island:    'http://localhost:4006',
  estates:      'http://localhost:4007',
  sodic_vye:    'http://localhost:4008',
  chillout:     'http://localhost:4009',
};

function sanitizePath(p) {
  return p.replace(/[^a-zA-Z0-9\/\-_.~%]/g, '').replace(/\.\./g, '');
}
function sanitizeQs(q) {
  return q.replace(/[^a-zA-Z0-9\/\-_.~%&=?]/g, '');
}

// Route by area name in URL
app.get('/api/v1/sync/:area/*', async (req, res) => {
  const gw = GATEWAYS[req.params.area];
  if (!gw) return res.status(404).json({ error: 'Unknown area', areas: Object.keys(GATEWAYS) });
  
  const path = sanitizePath(req.path.replace(`/api/v1/sync/${req.params.area}`, ''));
  const qs = req.url.includes('?') ? sanitizeQs(req.url.substring(req.url.indexOf('?'))) : '';
  
  try {
    const r = await fetch(gw + '/api/v1/sync/symbiot' + path + qs, { method: 'GET' });
    res.json(await r.json());
  } catch (e) {
    res.status(502).json({ error: `Gateway ${req.params.area} unreachable` });
  }
});

// Billing route (shared gateway)
app.get('/api/v1/sync/billing/*', async (req, res) => {
  const path = req.path.replace('/api/v1/sync/billing', '');
  const qs = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  try {
    const r = await fetch('http://localhost:4010/api/v1/sync/billing' + path + qs, { method: 'GET' });
    res.json(await r.json());
  } catch (e) {
    res.status(502).json({ error: 'Billing gateway unreachable' });
  }
});

// Remapped meters endpoint
app.get('/api/v1/sync/:area/meters', async (req, res) => {
  const area = req.params.area.replace(/[^a-zA-Z0-9_-]/g, '');
  const gw = GATEWAYS[area];
  if (!gw) return res.status(404).json({ error: 'Unknown area' });
  try {
    const r = await fetch(gw + '/api/v1/sync/' + area + '/meters', { method: 'GET' });
    res.json(await r.json());
  } catch (e) {
    res.status(502).json({ error: `Gateway ${area} unreachable` });
  }
});

// List available areas
app.get('/api/v1/sync/areas', (req, res) => {
  res.json({ areas: Object.keys(GATEWAYS), gateways: Object.entries(GATEWAYS).map(([k, v]) => ({ area: k, url: v })) });
});

app.get('/health', (req, res) => res.json({ status: 'ok', gateways: Object.keys(GATEWAYS).length }));

// Gateway status endpoint — checks all 9 gateways
app.get('/api/v1/sync/status', async (req, res) => {
  const results = [];
  for (const [area, url] of Object.entries(GATEWAYS)) {
    try {
      const start = Date.now();
      const r = await fetch(url + '/health', { signal: AbortSignal.timeout(3000) });
      const data = await r.json();
      results.push({ area, port: data.port, status: 'online', latency: Date.now() - start, data });
    } catch {
      results.push({ area, status: 'offline' });
    }
  }
  res.json({ orchestrator: 'ok', gateways: results, online: results.filter(r => r.status === 'online').length, total: results.length });
});

app.listen(4000, () => console.log('Orchestrator on :4000 — 9 areas routed'));
