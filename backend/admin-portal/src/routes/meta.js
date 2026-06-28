const express = require('express');
const router = express.Router();
const db = require('../services/db');

// ==================== CUSTOMER TYPES ====================
router.get('/customer-types', async (req, res) => {
  try {
    const r = await db.query("SELECT id, type_code, type_name, description, is_active, created_at FROM core.customer_types ORDER BY type_name");
    res.json({ data: r.rows, total: r.rows.length });
  } catch (e) {
    // Fallback - table might not exist
    const r = await db.query("SELECT DISTINCT customer_type as type_code, customer_type as type_name FROM sim_system.customers WHERE customer_type IS NOT NULL ORDER BY customer_type");
    res.json({ data: r.rows.map(x => ({ ...x, id: x.type_code, description: '', is_active: true })), total: r.rows.length });
  }
});
router.post('/customer-types', async (req, res) => {
  try {
    const { typeCode, typeName, description } = req.body;
    const r = await db.query(`INSERT INTO core.customer_types (type_code, type_name, description) VALUES ($1,$2,$3) RETURNING *`, [typeCode, typeName, description||null]);
    res.status(201).json({ data: r.rows[0] });
  } catch (e) {
    if (e.code === '42P01') return res.status(400).json({ error: 'Table core.customer_types not yet created, use direct entry in Customers' });
    if (e.code === '23505') return res.status(409).json({ error: 'Type exists' });
    res.status(500).json({ error: e.message });
  }
});
router.put('/customer-types/:id', async (req, res) => {
  try {
    const { typeName, description, isActive } = req.body;
    const sets = []; const vals = []; let i = 1;
    if (typeName !== undefined) { sets.push(`type_name = $${i++}`); vals.push(typeName); }
    if (description !== undefined) { sets.push(`description = $${i++}`); vals.push(description); }
    if (isActive !== undefined) { sets.push(`is_active = $${i++}`); vals.push(isActive); }
    if (!sets.length) return res.status(400).json({ error: 'No fields' });
    vals.push(req.params.id);
    const r = await db.query(`UPDATE core.customer_types SET ${sets.join(',')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ data: r.rows[0] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
router.delete('/customer-types/:id', async (req, res) => { try { await db.query('DELETE FROM core.customer_types WHERE id = $1', [req.params.id]); res.json({ message:'Deleted' }); } catch(e) { res.status(500).json({error:e.message}); } });

// ==================== OWNERSHIP TYPES ====================
router.get('/ownership-types', async (req, res) => {
  try {
    const r = await db.query("SELECT id, type_code, type_name, description, is_active, created_at FROM core.ownership_types ORDER BY type_name");
    res.json({ data: r.rows, total: r.rows.length });
  } catch (e) {
    const r = await db.query("SELECT DISTINCT ownership_type as type_code, ownership_type as type_name FROM sim_system.customers WHERE ownership_type IS NOT NULL ORDER BY ownership_type");
    res.json({ data: r.rows.map(x => ({ ...x, id: x.type_code, description: '', is_active: true })), total: r.rows.length });
  }
});
router.post('/ownership-types', async (req, res) => {
  try {
    const { typeCode, typeName, description } = req.body;
    const r = await db.query(`INSERT INTO core.ownership_types (type_code, type_name, description) VALUES ($1,$2,$3) RETURNING *`, [typeCode, typeName, description||null]);
    res.status(201).json({ data: r.rows[0] });
  } catch (e) { if (e.code === '23505') return res.status(409).json({ error:'Exists' }); res.status(500).json({error:e.message}); }
});
router.put('/ownership-types/:id', async (req, res) => {
  try {
    const { typeName, description, isActive } = req.body;
    const sets = []; const vals = []; let i = 1;
    if (typeName !== undefined) { sets.push(`type_name = $${i++}`); vals.push(typeName); }
    if (description !== undefined) { sets.push(`description = $${i++}`); vals.push(description); }
    if (isActive !== undefined) { sets.push(`is_active = $${i++}`); vals.push(isActive); }
    if (!sets.length) return res.status(400).json({ error:'No fields' });
    vals.push(req.params.id);
    const r = await db.query(`UPDATE core.ownership_types SET ${sets.join(',')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ data: r.rows[0] });
  } catch(e) { res.status(500).json({error:e.message}); }
});
router.delete('/ownership-types/:id', async (req, res) => { try { await db.query('DELETE FROM core.ownership_types WHERE id = $1',[req.params.id]); res.json({message:'Deleted'}); } catch(e) { res.status(500).json({error:e.message}); } });

// ==================== PAYMENT OPTIONS ====================
router.get('/payment-options', async (req, res) => {
  try {
    const r = await db.query("SELECT id, option_code, option_name, payment_type, is_active, description, created_at FROM core.payment_options ORDER BY option_name");
    res.json({ data: r.rows, total: r.rows.length });
  } catch (e) {
    const r = await db.query("SELECT DISTINCT payment_method as option_code, payment_method as option_name, payment_method as payment_type FROM sim_system.payments WHERE payment_method IS NOT NULL ORDER BY payment_method");
    res.json({ data: r.rows.map(x => ({ ...x, id: x.option_code, is_active: true, description: '' })), total: r.rows.length });
  }
});
router.post('/payment-options', async (req, res) => {
  try {
    const { optionCode, optionName, paymentType, description } = req.body;
    const r = await db.query(`INSERT INTO core.payment_options (option_code, option_name, payment_type, description) VALUES ($1,$2,$3,$4) RETURNING *`, [optionCode, optionName, paymentType||'cash', description||null]);
    res.status(201).json({ data: r.rows[0] });
  } catch(e) { if(e.code==='23505') return res.status(409).json({error:'Exists'}); res.status(500).json({error:e.message}); }
});
router.put('/payment-options/:id', async (req, res) => {
  try {
    const { optionName, paymentType, description, isActive } = req.body;
    const sets = []; const vals = []; let i = 1;
    if (optionName !== undefined) { sets.push(`option_name = $${i++}`); vals.push(optionName); }
    if (paymentType !== undefined) { sets.push(`payment_type = $${i++}`); vals.push(paymentType); }
    if (description !== undefined) { sets.push(`description = $${i++}`); vals.push(description); }
    if (isActive !== undefined) { sets.push(`is_active = $${i++}`); vals.push(isActive); }
    if (!sets.length) return res.status(400).json({error:'No fields'});
    vals.push(req.params.id);
    const r = await db.query(`UPDATE core.payment_options SET ${sets.join(',')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ data: r.rows[0] });
  } catch(e) { res.status(500).json({error:e.message}); }
});
router.delete('/payment-options/:id', async (req, res) => { try { await db.query('DELETE FROM core.payment_options WHERE id = $1',[req.params.id]); res.json({message:'Deleted'}); } catch(e) { res.status(500).json({error:e.message}); } });

// ==================== HOLIDAYS ====================
router.get('/holidays', async (req, res) => {
  try {
    const r = await db.query("SELECT h.*, a.area_name FROM core.holidays h LEFT JOIN core.areas a ON a.id = h.area_id ORDER BY h.holiday_date DESC");
    res.json({ data: r.rows, total: r.rows.length });
  } catch(e) { res.status(500).json({error:e.message}); }
});
router.post('/holidays', async (req, res) => {
  try {
    const { holidayName, holidayDate, areaId, isRecurring } = req.body;
    if (!holidayName || !holidayDate) return res.status(400).json({error:'holidayName, holidayDate required'});
    const r = await db.query(`INSERT INTO core.holidays (holiday_name, holiday_date, area_id, is_recurring) VALUES ($1,$2,$3,$4) RETURNING *`, [holidayName, holidayDate, areaId||null, isRecurring||false]);
    res.status(201).json({ data: r.rows[0] });
  } catch(e) { res.status(500).json({error:e.message}); }
});
router.delete('/holidays/:id', async (req, res) => { try { await db.query('DELETE FROM core.holidays WHERE id = $1',[req.params.id]); res.json({message:'Deleted'}); } catch(e) { res.status(500).json({error:e.message}); } });

// ==================== UNIT ZONES ====================
router.get('/unit-zones', async (req, res) => {
  try {
    const r = await db.query("SELECT * FROM core.unit_zones ORDER BY zone_name");
    res.json({ data: r.rows, total: r.rows.length });
  } catch(e) {
    const r = await db.query("SELECT DISTINCT zone as zone_code, zone as zone_name FROM sim_system.units WHERE zone IS NOT NULL ORDER BY zone");
    res.json({ data: r.rows.map(x => ({...x, id: x.zone_code, is_active: true})), total: r.rows.length });
  }
});
router.post('/unit-zones', async (req, res) => {
  try {
    const { zoneCode, zoneName, areaId } = req.body;
    const r = await db.query(`INSERT INTO core.unit_zones (zone_code, zone_name, area_id) VALUES ($1,$2,$3) RETURNING *`, [zoneCode, zoneName, areaId||null]);
    res.status(201).json({ data: r.rows[0] });
  } catch(e) { if(e.code==='23505') return res.status(409).json({error:'Exists'}); res.status(500).json({error:e.message}); }
});
router.put('/unit-zones/:id', async (req, res) => {
  try {
    const { zoneName, isActive } = req.body;
    const sets = []; const vals = []; let i = 1;
    if (zoneName !== undefined) { sets.push(`zone_name = $${i++}`); vals.push(zoneName); }
    if (isActive !== undefined) { sets.push(`is_active = $${i++}`); vals.push(isActive); }
    if (!sets.length) return res.status(400).json({error:'No fields'});
    vals.push(req.params.id);
    const r = await db.query(`UPDATE core.unit_zones SET ${sets.join(',')} WHERE id = $${i} RETURNING *`, vals);
    res.json({ data: r.rows[0] });
  } catch(e) { res.status(500).json({error:e.message}); }
});
router.delete('/unit-zones/:id', async (req, res) => { try { await db.query('DELETE FROM core.unit_zones WHERE id = $1',[req.params.id]); res.json({message:'Deleted'}); } catch(e) { res.status(500).json({error:e.message}); } });

// ==================== READINGS MANAGEMENT ====================
router.get('/readings', async (req, res) => {
  try {
    const { meterId, limit='100', offset='0' } = req.query;
    let sql = `SELECT r.*, m.serial_number as meter_serial FROM area.readings r JOIN sim_system.meters m ON m.id = r.meter_id`;
    const p = [];
    if (meterId) { sql += ` WHERE r.meter_id = $1`; p.push(meterId); }
    sql += ` ORDER BY r.reading_date DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`;
    const r = await db.query(sql, p);
    res.json({ data: r.rows, total: r.rows.length });
  } catch(e) {
    try {
      const r = await db.query(`SELECT r.*, m.serial_number as meter_serial FROM sim_system.readings r LEFT JOIN sim_system.meters m ON m.id = r.meter_id ORDER BY COALESCE(r.reading_date, r.created_at) DESC LIMIT 100`);
      res.json({ data: r.rows, total: r.rows.length });
    } catch(e2) { res.status(500).json({error:e2.message}); }
  }
});
router.delete('/readings/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM area.readings WHERE id = $1', [req.params.id]);
    res.json({ message: 'Reading deleted' });
  } catch(e) {
    try {
      await db.query('DELETE FROM sim_system.readings WHERE id = $1', [req.params.id]);
      res.json({ message: 'Reading deleted' });
    } catch(e2) { res.status(500).json({error:e2.message}); }
  }
});
router.post('/readings/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) return res.status(400).json({error:'No IDs provided'});
    let deleted = 0;
    for (const id of ids) {
      try { await db.query('DELETE FROM area.readings WHERE id = $1', [id]); deleted++; }
      catch { try { await db.query('DELETE FROM sim_system.readings WHERE id = $1', [id]); deleted++; } catch {} }
    }
    res.json({ message: `${deleted} readings deleted`, deleted });
  } catch(e) { res.status(500).json({error:e.message}); }
});

module.exports = router;
