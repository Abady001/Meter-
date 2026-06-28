const express = require('express');
require('dotenv').config();
const app = express();

const TARGET = process.env.SYMBIOT_URL;
const BILLING_TARGET = process.env.BILLING_URL;
const PORT = process.env.PORT || 4001;
const AREA = process.env.AREA || 'unknown';
const SYMBIOT_USER = process.env.SYMBIOT_USER || 'admin';
const SYMBIOT_PASS = process.env.SYMBIOT_PASS || '';
const BILLING_USER = process.env.BILLING_USER || 'admin';
const BILLING_PASS = process.env.BILLING_PASS || '';

const authHeader = 'Basic ' + Buffer.from(SYMBIOT_USER + ':' + SYMBIOT_PASS).toString('base64');
const billingAuth = 'Basic ' + Buffer.from(BILLING_USER + ':' + BILLING_PASS).toString('base64');

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', area: AREA, port: PORT }));

// Symbiot proxy via query param
app.get('/api/symbiot', async (req, res) => {
  const path = req.query.path || '';
  try {
    const r = await fetch(TARGET + path, {
      method: 'GET',
      headers: { 'Authorization': authHeader, 'Accept': 'application/json' }
    });
    const data = await r.json();
    data._area = AREA;
    data._source = TARGET;
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: 'Symbiot unreachable', area: AREA, target: TARGET, detail: e.message });
  }
});

// Billing proxy via query param
app.get('/api/billing', async (req, res) => {
  const path = req.query.path || '';
  try {
    const r = await fetch(BILLING_TARGET + path, {
      method: 'GET',
      headers: { 'Authorization': billingAuth, 'Accept': 'application/json' }
    });
    const data = await r.json();
    data._area = AREA;
    data._source = BILLING_TARGET;
    res.json(data);
  } catch (e) {
    res.status(502).json({ error: 'Billing unreachable', area: AREA, target: BILLING_TARGET, detail: e.message });
  }
});

// Symbiot Location sync: retrieves locations from Symbiot API
app.get('/api/v1/sync/:area/locations', async (req, res) => {
  try {
    const r = await fetch(TARGET + '/locations', {
      method: 'GET',
      headers: { 'Authorization': authHeader, 'Accept': 'application/json' }
    });
    const data = await r.json();
    const mapped = (data || []).map(d => ({
      source_id: d.id,
      area: AREA,
      address_en: d.addressEN,
      address_ar: d.addressAR,
      unit_no: d.unitNo,
      floor_no: d.floorNo,
      building_no: d.buildingNo,
      unit_size: d.unitSize,
      city: d.city,
      location_type_id: d.locationTypeId,
      location_zone_id: d.locationZoneId,
      raw: d,
    }));
    res.json({ area: AREA, count: mapped.length, locations: mapped });
  } catch (e) {
    res.status(502).json({ error: 'Failed to fetch locations', detail: e.message, target: TARGET });
  }
});

// Meter master sync: uses locations API (confirmed working) to create meter records
// Each location becomes a candidate meter record for the pilot
app.get('/api/v1/sync/:area/meters', async (req, res) => {
  try {
    const r = await fetch(TARGET + '/locations', {
      method: 'GET',
      headers: { 'Authorization': authHeader, 'Accept': 'application/json' }
    });
    const data = await r.json();
    const mapped = (data || []).map(d => ({
      source_id: d.id,
      area: AREA,
      unit_no: d.unitNo,
      building_no: d.buildingNo,
      address_en: d.addressEN,
      address_ar: d.addressAR,
      city: d.city,
      meter_serial: `SYNC-${AREA.toUpperCase()}-${d.id}`,
      meter_type: 'electricity',
      status: 'new',
    }));
    res.json({ area: AREA, count: mapped.length, meters: mapped, source: 'locations' });
  } catch (e) {
    res.status(502).json({ error: 'Failed to fetch meters', detail: e.message, target: TARGET });
  }
});

// Block all non-GET
app.use((req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Only GET allowed' });
});

function findAttr(device, name) {
  if (!device.Attributes) return null;
  const attr = device.Attributes.find(a => a.AttrName === name);
  return attr ? attr.AttrVal : null;
}

app.listen(PORT, () => console.log(`Sync Gateway [${AREA}] running on :${PORT}`));
