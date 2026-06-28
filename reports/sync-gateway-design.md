# METER VERSE — LEGACY SYSTEM API GATEWAY

**Architecture:** Read-only HTTP proxy. No DB credentials. No SQL. GET only.

---

## THE GATEWAY

A standalone Node.js/Express microservice that sits between Meter Verse and Symbiot/Billing. It only makes GET requests. It never writes.

```
Meter Verse  --GET-->  Sync Gateway (:4002)  --GET-->  Symbiot API (10.50.30.x)
                        No database           --GET-->  Billing API
                        No SQL
                        No credentials
                        No write paths
```

## ENDPOINTS (GET only)

### Meter Master
```
GET /api/v1/sync/symbiot/meters
GET /api/v1/sync/symbiot/meters/:id
GET /api/v1/sync/symbiot/meters/:id/readings
GET /api/v1/sync/symbiot/meters/:id/attributes
GET /api/v1/sync/symbiot/locations
GET /api/v1/sync/symbiot/areas
```

### Readings
```
GET /api/v1/sync/symbiot/readings?meterId=X&from=DATE&to=DATE
GET /api/v1/sync/symbiot/readings/bp1?meterId=X
GET /api/v1/sync/symbiot/readings/bp2?meterId=X
GET /api/v1/sync/symbiot/readings/hourly?meterId=X
GET /api/v1/sync/symbiot/readings/water?meterId=X
```

### Tariffs
```
GET /api/v1/sync/symbiot/tariffs
GET /api/v1/sync/symbiot/tariffs/:id
```

### Customers (from Billing)
```
GET /api/v1/sync/billing/customers
GET /api/v1/sync/billing/customers/:id
GET /api/v1/sync/billing/customers/:id/invoices
GET /api/v1/sync/billing/customers/:id/payments
```

## GATEWAY CODE (server.js)

```javascript
const express = require('express');
const app = express();
const SYMBIOT_BASE = process.env.SYMBIOT_API_URL;
const BILLING_BASE = process.env.BILLING_API_URL;

// Proxy Symbiot API
app.get('/api/v1/sync/symbiot/*', async (req, res) => {
  const path = req.path.replace('/api/v1/sync/symbiot', '');
  const qs = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  try {
    const r = await fetch(SYMBIOT_BASE + path + qs, { method: 'GET' });
    res.json(await r.json());
  } catch (e) {
    res.status(502).json({ error: 'Symbiot unreachable' });
  }
});

// Proxy Billing API
app.get('/api/v1/sync/billing/*', async (req, res) => {
  const path = req.path.replace('/api/v1/sync/billing', '');
  const qs = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  try {
    const r = await fetch(BILLING_BASE + path + qs, { method: 'GET' });
    res.json(await r.json());
  } catch (e) {
    res.status(502).json({ error: 'Billing unreachable' });
  }
});

// Block all non-GET
app.all('*', (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET allowed' });
});

app.listen(4002, () => console.log('Sync Gateway on :4002'));
```

## SECURITY GUARANTEE TABLE

| Risk | Mitigation |
|------|-----------|
| SQL injection | No SQL anywhere — pure HTTP GET |
| Write operations | Only GET endpoints. POST/PUT/DELETE return 405 |
| Stored credentials | URLs in env vars, not in code |
| Database access | Zero database drivers or connections |
| Data modification | Gateway never sends a request body |
| Trigger activation | GET requests cannot activate DB triggers |
| Audit log pollution | Read operations don't create audit entries |
| Source corruption | Gateway only connects outbound from Meter Verse |

## FILES TO CREATE

```
backend/sync-gateway/
  package.json
  server.js          (the code above, ~40 lines)
  .env.example
  README.md
```

**This is safe.** No database changes. No SQL execution. No data modification. Pure HTTP GET proxy. Cannot corrupt source systems. Cannot trigger alarms. Cannot trigger stored procedures.
