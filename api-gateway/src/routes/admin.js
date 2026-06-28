const express = require('express');
const store = require('../services/store');
const router = express.Router();

// Health
router.get('/health', (req, res) => {
  const stats = store.getLogStats(24);
  res.json({
    status: 'ok', active_keys: store.listKeys().filter(k => k.is_active).length,
    total_keys: store.listKeys().length, requests_24h: stats.total,
    blocked_24h: stats.blocked, unresolved_alerts: store.getUnresolvedCount(),
  });
});

// API Keys
router.get('/api-keys', (req, res) => res.json(store.listKeys()));
router.get('/api-keys/:id', (req, res) => { const k = store.getKey(req.params.id); if (!k) return res.status(404).json({ error: 'Not found' }); res.json(k); });
router.post('/api-keys', (req, res) => { if (!req.body.keyName) return res.status(400).json({ error: 'keyName required' }); res.status(201).json(store.createKey(req.body)); });
router.patch('/api-keys/:id', (req, res) => { const k = store.updateKey(req.params.id, req.body); if (!k) return res.status(404).json({ error: 'Not found' }); res.json(k); });
router.delete('/api-keys/:id', (req, res) => { if (store.deleteKey(req.params.id)) return res.json({ success: true }); res.status(404).json({ error: 'Not found' }); });
router.post('/api-keys/:id/toggle', (req, res) => { const k = store.toggleKey(req.params.id, req.body.isActive); if (!k) return res.status(404).json({ error: 'Not found' }); res.json(k); });

// Logs
router.get('/logs', (req, res) => {
  const { limit, offset, apiKeyId, blocked, method } = req.query;
  res.json(store.getLogs(parseInt(limit) || 100, parseInt(offset) || 0, { apiKeyId, blocked: blocked !== undefined ? blocked === 'true' : undefined, method }));
});
router.get('/logs/stats', (req, res) => res.json(store.getLogStats(parseInt(req.query.hours) || 24)));

// Alerts
router.get('/alerts', (req, res) => res.json(store.listAlerts(req.query.resolved === 'true', parseInt(req.query.limit) || 50)));
router.post('/alerts/:id/resolve', (req, res) => { store.resolveAlert(parseInt(req.params.id)); res.json({ success: true }); });
router.get('/alerts/count', (req, res) => res.json({ count: store.getUnresolvedCount() }));

// Config
router.get('/config', (req, res) => res.json(store.getConfig()));
router.patch('/config', (req, res) => { store.updateConfig(req.body); res.json({ success: true }); });

module.exports = router;
