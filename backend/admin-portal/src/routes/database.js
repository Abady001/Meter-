const express = require('express');
const router = express.Router();
const db = require('../services/db');

// List schemas and tables
router.get('/schemas', async (req, res) => {
  try {
    const r = await db.query(`SELECT table_schema, table_name, (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=t.table_schema AND table_name=t.table_name) as cols FROM information_schema.tables t WHERE table_type='BASE TABLE' ORDER BY table_schema, table_name`);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Get columns
router.get('/columns/:schema/:table', async (req, res) => {
  try {
    const { schema, table } = req.params;
    const safeS = schema.replace(/[^a-zA-Z0-9_]/g, '');
    const safeT = table.replace(/[^a-zA-Z0-9_]/g, '');
    const r = await db.query(`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 ORDER BY ordinal_position`, [safeS, safeT]);
    res.json({ data: r.rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Browse table data
router.get('/data/:schema/:table', async (req, res) => {
  try {
    const { schema, table } = req.params;
    const limit = Math.min(parseInt(req.query.limit || '200'), 1000);
    const offset = parseInt(req.query.offset || '0');
    const safeS = schema.replace(/[^a-zA-Z0-9_]/g, '');
    const safeT = table.replace(/[^a-zA-Z0-9_]/g, '');
    const cnt = await db.query(`SELECT COUNT(*) FROM "${safeS}"."${safeT}"`);
    const total = parseInt(cnt.rows[0].count);
    const data = await db.query(`SELECT * FROM "${safeS}"."${safeT}" ORDER BY 1 LIMIT $1 OFFSET $2`, [limit, offset]);
    const cols = await db.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 ORDER BY ordinal_position`, [safeS, safeT]);
    res.json({ data: data.rows, columns: cols.rows, total, limit, offset });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Check dependencies
router.get('/dependencies/:schema/:table/:id', async (req, res) => {
  try {
    const { schema, table, id } = req.params;
    const t = table.toLowerCase();
    const refMap = {
      customer: ['meters(customer_id)','invoices(customer_id)','payments(customer_id)','customer_ledger_entries(customer_id)'],
      meter: ['readings(meter_id)','invoices(meter_id)','meter_assignments(meter_id)'],
      invoice: ['invoice_lines(invoice_id)','payment_allocations(invoice_id)'],
      payment: ['payment_allocations(payment_id)'],
      project: ['customers(project_id)','meters(project_id)','invoices(project_id)','payments(project_id)'],
    };
    const deps = [];
    if (refMap[t]) {
      for (const ref of refMap[t]) {
        const [tbl, col] = ref.replace(')','').split('(');
        const r = await db.query(`SELECT COUNT(*) as c FROM "${schema}"."${tbl}" WHERE ${col} = $1`, [id]);
        const c = parseInt(r.rows[0].c);
        if (c > 0) deps.push({ table: tbl, field: col, count: c });
      }
    }
    res.json({ hasDependencies: deps.length > 0, dependencies: deps });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Apply batch changes
router.post('/apply', async (req, res) => {
  const { schema, table, inserts, updates, deletes } = req.body;
  const safeS = schema.replace(/[^a-zA-Z0-9_]/g, '');
  const safeT = table.replace(/[^a-zA-Z0-9_]/g, '');
  const results = { inserted:0, updated:0, deleted:0, errors:[] };
  const client = await db.getClient();
  try {
    await client.query('BEGIN');
    if (deletes && deletes.length) {
      for (const id of deletes) {
        await client.query(`DELETE FROM "${safeS}"."${safeT}" WHERE id = $1`, [id]);
        results.deleted++;
      }
    }
    if (updates && updates.length) {
      for (const { id, data } of updates) {
        const cols = Object.keys(data).filter(k => k !== 'id');
        const sets = cols.map((c,i) => `"${c}" = $${i+1}`).join(',');
        const vals = cols.map(c => data[c]);
        await client.query(`UPDATE "${safeS}"."${safeT}" SET ${sets} WHERE id = $${vals.length+1}`, [...vals, id]);
        results.updated++;
      }
    }
    if (inserts && inserts.length) {
      for (const data of inserts) {
        delete data.id;
        const cols = Object.keys(data);
        const vals = Object.values(data);
        const ph = vals.map((_,i) => `$${i+1}`).join(',');
        await client.query(`INSERT INTO "${safeS}"."${safeT}" (${cols.map(c => `"${c}"`).join(',')}) VALUES (${ph})`, vals);
        results.inserted++;
      }
    }
    await client.query('COMMIT');
    res.json({ success: true, ...results });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: e.message });
  } finally { client.release(); }
});

// Execute SQL query (SELECT only)
router.post('/query', async (req, res) => {
  try {
    const { sql } = req.body;
    if (!sql || typeof sql !== 'string') return res.status(400).json({ error: 'SQL required' });
    const upper = sql.trim().toUpperCase();
    if (!upper.startsWith('SELECT') && !upper.startsWith('EXPLAIN') && !upper.startsWith('WITH')) 
      return res.status(403).json({ error: 'Only SELECT queries allowed' });
    const r = await db.pool.query(sql, []);
    res.json({ data: r.rows, total: r.rows.length, fields: r.fields ? r.fields.map(f => ({ name: f.name, dataTypeID: f.dataTypeID })) : [] });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

module.exports = router;
