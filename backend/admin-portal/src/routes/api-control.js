const express = require('express');
const router = express.Router();
const db = require('../services/db');

// All API endpoints with their status
const API_CATALOG = [
  { id: 'auth', name: 'Authentication', module: 'System', methods: 'POST, GET', route: '/api/v1/auth/*' },
  { id: 'customers', name: 'Customers', module: 'CRM', methods: 'GET, POST, PUT, DELETE', route: '/api/v1/customers/*' },
  { id: 'projects', name: 'Projects', module: 'CRM', methods: 'GET, POST, PUT, DELETE', route: '/api/v1/projects/*' },
  { id: 'meters', name: 'Meters', module: 'Metering', methods: 'GET, POST, PUT, DELETE', route: '/api/v1/meters/*' },
  { id: 'readings', name: 'Readings', module: 'Metering', methods: 'GET, POST, PATCH, DELETE', route: '/api/v1/readings/*' },
  { id: 'invoices', name: 'Invoices', module: 'Billing', methods: 'GET, POST, PUT', route: '/api/v1/invoices/*' },
  { id: 'payments', name: 'Payments', module: 'Billing', methods: 'GET, POST', route: '/api/v1/payments/*' },
  { id: 'billing', name: 'Billing Engine', module: 'Billing', methods: 'POST', route: '/api/v1/billing/*' },
  { id: 'bill-cycle', name: 'Bill Cycle', module: 'Billing', methods: 'GET, POST', route: '/api/v1/bill-cycle/*' },
  { id: 'wallet', name: 'Wallet', module: 'Financial', methods: 'GET, POST', route: '/api/v1/wallet/*' },
  { id: 'kpi', name: 'KPI Dashboards', module: 'Analytics', methods: 'GET', route: '/api/v1/kpi/*' },
  { id: 'reports', name: 'Reports', module: 'Analytics', methods: 'GET', route: '/api/v1/reports/*' },
  { id: 'collections', name: 'Collections', module: 'Financial', methods: 'GET, POST', route: '/api/v1/collections/*' },
  { id: 'search', name: 'Smart Search', module: 'System', methods: 'GET', route: '/api/v1/search/*' },
  { id: 'sync', name: 'Sync Gateways', module: 'Integration', methods: 'GET, POST', route: '/api/v1/sync/*' },
  { id: 'areas', name: 'Areas', module: 'Admin', methods: 'GET, POST, PUT, DELETE', route: '/api/v1/areas/*' },
  { id: 'users', name: 'Users', module: 'Admin', methods: 'GET, POST, PUT, DELETE', route: '/api/v1/users/*' },
  { id: 'roles', name: 'Roles', module: 'Admin', methods: 'GET, POST', route: '/api/v1/roles/*' },
  { id: 'permissions', name: 'Permissions', module: 'Admin', methods: 'GET, POST, DELETE', route: '/api/v1/permissions/*' },
  { id: 'settings', name: 'Settings', module: 'Admin', methods: 'GET, PATCH', route: '/api/v1/settings/*' },
  { id: 'upload', name: 'Upload Center', module: 'System', methods: 'POST', route: '/api/v1/upload/*' },
  { id: 'downloads', name: 'Downloads', module: 'System', methods: 'GET', route: '/api/v1/downloads/*' },
  { id: 'tickets', name: 'Tickets', module: 'Support', methods: 'GET, POST, PUT', route: '/api/v1/tickets/*' },
  { id: 'support', name: 'Support', module: 'Support', methods: 'GET, POST', route: '/api/v1/support/*' },
  { id: 'solar', name: 'Solar', module: 'Utilities', methods: 'GET, POST', route: '/api/v1/solar/*' },
  { id: 'settlements', name: 'Settlements', module: 'Utilities', methods: 'GET, POST', route: '/api/v1/settlements/*' },
  { id: 'chilled-water', name: 'Chilled Water', module: 'Utilities', methods: 'GET, POST', route: '/api/v1/chilled-water/*' },
  { id: 'admin', name: 'DB Admin Console', module: 'Admin', methods: 'GET, POST, PUT, DELETE', route: '/api/v1/admin/*' },
  { id: 'registration', name: 'Registration', module: 'System', methods: 'POST', route: '/api/v1/registration/*' },
  { id: 'tariffs', name: 'Tariff Studio', module: 'Billing', methods: 'GET, POST, PATCH, DELETE', route: '/api/v1/tariffs/*' },
  { id: 'locations', name: 'Locations/Units', module: 'CRM', methods: 'GET, POST, PUT, DELETE', route: '/api/v1/locations/*' },
  { id: 'ownership', name: 'Ownership Transfer', module: 'CRM', methods: 'POST', route: '/api/v1/*/customers/*/transfer-ownership' },
  { id: 'auth-dev', name: 'Dev Login (DEBUG)', module: 'System', methods: 'POST', route: '/api/v1/auth/dev-login' },
];

// List all APIs with their enabled/disabled status
router.get('/', async (req, res) => {
  try {
    const stored = await db.query("SELECT key, value FROM core.settings WHERE key LIKE 'api_enabled_%'");
    const statusMap = {};
    stored.rows.forEach(r => { statusMap[r.key.replace('api_enabled_', '')] = r.value === 'true'; });
    const data = API_CATALOG.map(api => ({
      ...api,
      enabled: statusMap[api.id] !== false, // default to enabled
    }));
    const enabled = data.filter(a => a.enabled).length;
    const disabled = data.filter(a => !a.enabled).length;
    res.json({ data, total: data.length, enabled, disabled });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Toggle API on/off
router.post('/:id/toggle', async (req, res) => {
  try {
    const api = API_CATALOG.find(a => a.id === req.params.id);
    if (!api) return res.status(404).json({ error: 'API not found' });
    const key = 'api_enabled_' + api.id;
    const current = await db.query("SELECT value FROM core.settings WHERE key = $1", [key]);
    const newState = current.rows.length === 0 ? false : current.rows[0].value !== 'true';
    await db.query(
      "INSERT INTO core.settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()",
      [key, String(newState)]
    );
    await db.query(
      `INSERT INTO core.audit_log (user_id, action_type, entity_type, entity_id, new_values)
       VALUES ($1,'update','api_toggle',$2,$3)`,
      [req.user.sub, api.id, JSON.stringify({ api: api.id, enabled: newState })]
    );
    res.json({ id: api.id, enabled: newState, message: `${api.name} ${newState ? 'enabled' : 'disabled'}` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Toggle multiple at once
router.post('/batch', async (req, res) => {
  try {
    const { toggles } = req.body; // { [apiId]: true/false }
    let count = 0;
    for (const [id, enabled] of Object.entries(toggles)) {
      const api = API_CATALOG.find(a => a.id === id);
      if (api) {
        await db.query(
          "INSERT INTO core.settings (key, value) VALUES ($1,$2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()",
          ['api_enabled_' + id, String(enabled)]
        );
        count++;
      }
    }
    res.json({ message: `${count} APIs updated`, count });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
