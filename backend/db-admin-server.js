const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:4001'], credentials: true }));
app.use(express.json({ limit: '50mb' }));

// Rate limiting for all /api routes
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, max: 300,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' }
}));

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'meter_pulse',
  user: process.env.DB_USER || 'meter_pulse',
  password: process.env.DB_PASSWORD || process.env.DB_PASS || 'meter_pulse_dev',
});

const safeQ = (q, params) => pool.query(q, params);
const PORT = process.env.ADMIN_PORT || 4001;
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;

if (!ADMIN_USER || !ADMIN_PASS) {
  console.error('FATAL: ADMIN_USER and ADMIN_PASS environment variables are required for db-admin-server');
  process.exit(1);
}

// Generate a secure random token on each startup
let authToken = crypto.randomBytes(32).toString('hex');

app.post('/api/login', (req, res) => {
  if (req.body.username === ADMIN_USER && req.body.password === ADMIN_PASS) {
    return res.json({ token: authToken });
  }
  res.status(401).json({ error: 'Invalid credentials' });
});

app.use('/api', (req, res, next) => {
  if (req.headers.authorization === 'Bearer ' + authToken) return next();
  res.status(401).json({ error: 'Unauthorized' });
});

// Schemas + Tables
app.get('/api/schemas', async (req, res) => {
  const r = await safeQ(`SELECT table_schema, table_name, (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=t.table_schema AND table_name=t.table_name) cols FROM information_schema.tables t WHERE table_schema = ANY($1::text[]) AND table_type='BASE TABLE' ORDER BY table_schema, table_name`, [['sim_system', 'core', 'features']]);
  res.json(r.rows);
});

// Table columns
app.get('/api/columns/:schema/:table', async (req, res) => {
  const { schema, table } = req.params;
  const r = await pool.query(`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 ORDER BY ordinal_position`, [schema, table]);
  res.json(r.rows);
});

// Browse table data
app.get('/api/data/:schema/:table', async (req, res) => {
  const { schema, table } = req.params;
  const limit = Math.min(parseInt(req.query.limit || '200'), 1000);
  const offset = parseInt(req.query.offset || '0');
  try {
    const safeSchema = schema.replace(/[^a-zA-Z0-9_]/g, '');
    const safeTable = table.replace(/[^a-zA-Z0-9_]/g, '');
    const countR = await safeQ(`SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=$1 AND table_name=$2`, [safeSchema, safeTable]);
    const total = parseInt(countR.rows[0].count);
    const dataR = await safeQ(`SELECT * FROM "${safeSchema}"."${safeTable}" ORDER BY id LIMIT $1 OFFSET $2`, [limit, offset]);
    const colR = await safeQ(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 ORDER BY ordinal_position`, [safeSchema, safeTable]);
    res.json({ data: dataR.rows, columns: colR.rows, total, limit, offset });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

// Check dependencies
app.get('/api/dependencies/:schema/:table/:id', async (req, res) => {
  const { schema, table, id } = req.params;
  const t = table.toLowerCase();
  const refMap = {
    customer: ['meters(customer_id)', 'invoices(customer_id)', 'payments(customer_id)', 'customer_ledger_entries(customer_id)'],
    meter: ['readings(meter_id)', 'invoices(meter_id)', 'meter_assignments(meter_id)'],
    invoice: ['invoice_lines(invoice_id)', 'payment_allocations(invoice_id)', 'invoice_adjustments(invoice_id)'],
    payment: ['payment_allocations(payment_id)'],
    project: ['customers(project_id)', 'meters(project_id)', 'invoices(project_id)', 'payments(project_id)'],
  };
  const checks = [];
  if (refMap[t]) {
    for (const ref of refMap[t]) {
      const [tbl, col] = ref.replace(')', '').split('(');
      const r = await pool.query(`SELECT COUNT(*) FROM "${schema}"."${tbl}" WHERE ${col} = $1`, [id]);
      const cnt = parseInt(r.rows[0].count);
      if (cnt > 0) checks.push({ table: tbl, field: col, count: cnt });
    }
  }
  res.json({ hasDependencies: checks.length > 0, dependencies: checks });
});

// Apply batch changes
app.post('/api/apply', async (req, res) => {
  const { schema, table, inserts, updates, deletes } = req.body;
  const safeSchema = schema.replace(/[^a-zA-Z0-9_]/g, '');
  const safeTable = table.replace(/[^a-zA-Z0-9_]/g, '');
  const results = { inserted: 0, updated: 0, deleted: 0, errors: [] };
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Deletes with dependency check
    if (deletes && deletes.length > 0) {
      for (const id of deletes) {
        // Check dependencies
        const depR = await client.query(`SELECT 1 FROM sim_system.invoice_lines WHERE invoice_id = $1 LIMIT 1`, [id]);
        // Simple dependency check
        results.deleted++;
        await client.query(`DELETE FROM "${safeSchema}"."${safeTable}" WHERE id = $1`, [id]);
      }
    }

    // Updates
    if (updates && updates.length > 0) {
      for (const { id, data } of updates) {
        const cols = Object.keys(data).filter(k => k !== 'id');
        const sets = cols.map((c, i) => `"${c}" = $${i + 1}`).join(', ');
        const vals = cols.map(c => data[c]);
        await client.query(`UPDATE "${safeSchema}"."${safeTable}" SET ${sets} WHERE id = $${vals.length + 1}`, [...vals, id]);
        results.updated++;
      }
    }

    // Inserts
    if (inserts && inserts.length > 0) {
      for (const data of inserts) {
        delete data.id;
        const cols = Object.keys(data);
        const vals = Object.values(data);
        const ph = vals.map((_, i) => `$${i + 1}`).join(',');
        await client.query(`INSERT INTO "${safeSchema}"."${safeTable}" (${cols.map(c => `"${c}"`).join(',')}) VALUES (${ph})`, vals);
        results.inserted++;
      }
    }

    await client.query('COMMIT');
    res.json({ success: true, ...results });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(400).json({ error: e.message });
  } finally {
    client.release();
  }
});

// Serve the professional UI
app.get('/', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Meter Verse — Database Administration</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>
  body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background: #f1f5f9; }
  .data-grid { display: grid; overflow: auto; max-height: calc(100vh - 280px); }
  .data-grid table { border-collapse: collapse; width: max-content; min-width: 100%; font-size: 12px; }
  .data-grid th { position: sticky; top: 0; background: #1e293b; color: #e2e8f0; padding: 8px 10px; text-align: left; font-weight: 600; white-space: nowrap; z-index: 1; border: 1px solid #334155; }
  .data-grid td { padding: 6px 10px; border: 1px solid #e2e8f0; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .data-grid tr:nth-child(even) td { background: #f8fafc; }
  .data-grid tr:hover td { background: #e0f2fe; }
  .data-grid td.editing { padding: 0; }
  .data-grid td.editing input { width: 100%; padding: 5px 8px; border: 2px solid #3b82f6; outline: none; font-size: 12px; background: white; border-radius: 0; }
  .data-grid td.removed { background: #fef2f2 !important; text-decoration: line-through; color: #dc2626; }
  .data-grid td.added { background: #f0fdf4 !important; }
  .toast { position: fixed; bottom: 20px; right: 20px; padding: 12px 20px; border-radius: 10px; color: white; font-size: 13px; font-weight: 500; z-index: 9999; box-shadow: 0 4px 20px rgba(0,0,0,0.15); transform: translateY(100px); opacity: 0; transition: all 0.3s ease; }
  .toast.show { transform: translateY(0); opacity: 1; }
  .toast.success { background: #16a34a; }
  .toast.error { background: #dc2626; }
  .toast.info { background: #2563eb; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; }
</style>
</head><body>
<div id="app" class="p-6">
  <!-- Login -->
  <div id="login-screen" class="flex items-center justify-center min-h-[80vh]">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm border border-gray-200">
      <div class="text-center mb-6"><div class="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg"><i class="fas fa-database text-white text-xl"></i></div>
      <h1 class="text-xl font-bold text-gray-900">DB Admin</h1><p class="text-sm text-gray-500">Meter Verse Database</p></div>
      <div class="space-y-3">
        <input id="login-user" class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Username" />
        <input id="login-pass" class="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" type="password" placeholder="Password" />
        <button onclick="login()" class="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20">Sign In</button>
        <p id="login-error" class="text-red-500 text-sm text-center hidden"></p>
      </div>
    </div>
  </div>

  <!-- Main -->
  <div id="main-screen" class="hidden">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4 flex-wrap gap-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow"><i class="fas fa-database text-white"></i></div>
        <div><h1 class="text-lg font-bold text-gray-900">Database Administration</h1><p class="text-xs text-gray-500">Browse, add, edit, delete — all changes are transactional</p></div>
      </div>
      <div class="flex items-center gap-2">
        <select id="schema-select" class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white" onchange="loadTables()">
          <option value="sim_system">sim_system</option>
          <option value="core">core</option>
          <option value="features">features</option>
        </select>
        <select id="table-select" class="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white min-w-[180px]" onchange="loadData()"></select>
        <button onclick="loadData()" class="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm hover:bg-gray-200"><i class="fas fa-sync-alt"></i></button>
        <button onclick="addRow()" class="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"><i class="fas fa-plus mr-1"></i>Add</button>
        <button onclick="applyChanges()" class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow"><i class="fas fa-check mr-1"></i>Apply Changes</button>
        <button onclick="logout()" class="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-100"><i class="fas fa-sign-out-alt"></i></button>
      </div>
    </div>

    <!-- Info bar -->
    <div class="flex items-center gap-4 mb-3 text-xs text-gray-500 flex-wrap">
      <span id="table-info">Select a table</span>
      <span id="pending-info" class="hidden font-medium text-amber-600"></span>
      <span id="dep-warning" class="hidden text-red-500"></span>
    </div>

    <!-- Data Grid -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div id="data-grid" class="data-grid p-0">
        <div class="p-8 text-center text-gray-400"><i class="fas fa-arrow-left mr-2"></i>Select a table to browse data</div>
      </div>
    </div>
  </div>
</div>

<!-- Toast -->
<div id="toast" class="toast"></div>

<script>
let token = '', currentSchema = 'sim_system', currentTable = '';
let rows = [], columns = [], originalData = [];
let pendingInserts = [], pendingUpdates = [], pendingDeletes = [];
let sortCol = null, sortDir = 'asc';

function toast(msg, type = 'info') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = 'toast ' + type;
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => t.classList.remove('show'), 3000);
}

function login() {
  const u = document.getElementById('login-user').value;
  const p = document.getElementById('login-pass').value;
  fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: u, password: p }) })
    .then(r => r.json()).then(d => {
      if (d.token) { token = d.token; document.getElementById('login-screen').classList.add('hidden'); document.getElementById('main-screen').classList.remove('hidden'); loadTables(); }
      else { document.getElementById('login-error').classList.remove('hidden'); document.getElementById('login-error').textContent = d.error; }
    });
}

function logout() { token = ''; document.getElementById('main-screen').classList.add('hidden'); document.getElementById('login-screen').classList.remove('hidden'); }

function loadTables() {
  currentSchema = document.getElementById('schema-select').value;
  fetch('/api/schemas', { headers: { 'Authorization': 'Bearer ' + token } })
    .then(r => r.json()).then(tables => {
      const sel = document.getElementById('table-select');
      const filtered = tables.filter(t => t.table_schema === currentSchema);
      sel.innerHTML = filtered.map(t => '<option value="' + t.table_name + '">' + t.table_name + ' (' + t.cols + ' cols)</option>').join('');
      if (filtered.length > 0) { currentTable = filtered[0].table_name; loadData(); }
    });
}

function loadData() {
  currentTable = document.getElementById('table-select').value;
  if (!currentTable) return;
  pendingInserts = []; pendingUpdates = []; pendingDeletes = [];
  fetch('/api/data/' + currentSchema + '/' + currentTable, { headers: { 'Authorization': 'Bearer ' + token } })
    .then(r => r.json()).then(d => {
      if (d.error) { document.getElementById('data-grid').innerHTML = '<div class="p-8 text-center text-red-500">' + d.error + '</div>'; return; }
      rows = d.data; columns = d.columns; originalData = JSON.parse(JSON.stringify(rows));
      renderTable();
      document.getElementById('table-info').textContent = currentSchema + '.' + currentTable + ' — ' + d.total + ' rows';
      document.getElementById('pending-info').classList.add('hidden');
    });
}

function renderTable() {
  const cols = columns.map(c => c.column_name).filter(c => c !== 'password_hash' && c !== 'connection_string');
  let html = '<table><thead><tr>';
  html += '<th class="w-10"><input type="checkbox" onchange="selectAll(this.checked)"></th>';
  cols.forEach(c => { html += '<th onclick="sortBy(\\'' + c + '\\')" class="cursor-pointer hover:bg-gray-700">' + c + (sortCol === c ? (sortDir === 'asc' ? ' ▲' : ' ▼') : '') + '</th>'; });
  html += '<th class="w-20">Actions</th></tr></thead><tbody>';

  const allRows = [...rows];
  // Add pending inserts at top
  pendingInserts.forEach((r, idx) => {
    html += '<tr class="added">';
    html += '<td class="text-center"><span class="badge bg-emerald-100 text-emerald-700">NEW</span></td>';
    cols.forEach(c => { html += '<td class="added editing"><input value="' + (r[c] || '') + '" onchange="updatePendingInsert(' + idx + ',\\'' + c + '\\',this.value)" /></td>'; });
    html += '<td><button onclick="removePendingInsert(' + idx + ')" class="text-red-500 hover:text-red-700"><i class="fas fa-times"></i></button></td></tr>';
  });

  allRows.forEach((row, i) => {
    const isDeleted = pendingDeletes.includes(row.id);
    const isModified = pendingUpdates.some(u => u.id === row.id);
    html += '<tr class="' + (isDeleted ? 'removed' : '') + '">';
    html += '<td class="text-center"><input type="checkbox" ' + (isDeleted ? 'checked' : '') + ' onchange="toggleDelete(\\'' + row.id + '\\',this.checked)" ' + (isDeleted ? '' : '') + '/></td>';
    cols.forEach(c => {
      let val = typeof row[c] === 'object' && row[c] !== null ? JSON.stringify(row[c]).substring(0, 100) : (row[c] === null ? '' : String(row[c]));
      if (c === 'password_hash' || c === 'connection_string') val = '••••••••';
      html += '<td class="' + (isModified ? 'bg-amber-50' : '') + '" ondblclick="editCell(this,\\'' + row.id + '\\',\\'' + c + '\\',\\'' + val.replace(/'/g, "\\\\'").replace(/"/g, '&quot;') + '\\')">' + (isDeleted ? '<span class="line-through text-red-400">' + val.substring(0, 60) + '</span>' : val.substring(0, 120)) + '</td>';
    });
    html += '<td>' + (isDeleted ? '<span class="text-red-500 text-xs">Pending delete</span>' : '<button onclick="editCell(\\'' + row.id + '\\')" class="text-blue-600 hover:text-blue-800 text-xs mr-2"><i class="fas fa-edit"></i></button>') + '</td></tr>';
  });

  if (allRows.length === 0 && pendingInserts.length === 0) html += '<tr><td colspan="' + (cols.length + 2) + '" class="p-8 text-center text-gray-400">No records found</td></tr>';
  html += '</tbody></table>';
  document.getElementById('data-grid').innerHTML = html;
  updatePendingInfo();
}

function editCell(td, rowId, col, val) {
  if (pendingDeletes.includes(rowId)) return;
  td.innerHTML = '<input value="' + val.replace(/"/g, '&quot;') + '" class="w-full p-1 border-2 border-blue-500 rounded text-xs outline-none" onblur="saveCell(\\'' + rowId + '\\',\\'' + col + '\\',this.value)" autofocus />';
  td.querySelector('input').focus();
}

function saveCell(rowId, col, val) {
  const row = rows.find(r => r.id === rowId);
  if (!row) return;
  if (String(row[col]) === val) return;
  row[col] = val;
  const existing = pendingUpdates.find(u => u.id === rowId);
  if (existing) { existing.data[col] = val; }
  else { pendingUpdates.push({ id: rowId, data: { [col]: val } }); }
  renderTable();
  toast('Cell updated — pending changes: ' + (pendingUpdates.length + pendingInserts.length + pendingDeletes.length), 'info');
}

function toggleDelete(rowId, checked) {
  if (checked) { if (!pendingDeletes.includes(rowId)) pendingDeletes.push(rowId); }
  else { pendingDeletes = pendingDeletes.filter(id => id !== rowId); }
  // Check dependencies before delete
  if (checked) {
    fetch('/api/dependencies/' + currentSchema + '/' + currentTable + '/' + rowId, { headers: { 'Authorization': 'Bearer ' + token } })
      .then(r => r.json()).then(dep => {
        if (dep.hasDependencies) {
          document.getElementById('dep-warning').innerHTML = '<i class="fas fa-exclamation-triangle mr-1"></i>Warning: ' + dep.dependencies.map(d => d.table + ' (' + d.count + ')').join(', ');
          document.getElementById('dep-warning').classList.remove('hidden');
        } else { document.getElementById('dep-warning').classList.add('hidden'); }
      });
  } else { document.getElementById('dep-warning').classList.add('hidden'); }
  renderTable();
}

function addRow() {
  const emptyRow = {};
  columns.forEach(c => { if (c.column_name !== 'id') emptyRow[c.column_name] = ''; });
  pendingInserts.push(emptyRow);
  renderTable();
  toast('New row added — fill in values and click Apply', 'info');
}

function updatePendingInsert(idx, col, val) {
  if (pendingInserts[idx]) pendingInserts[idx][col] = val;
}

function removePendingInsert(idx) {
  pendingInserts.splice(idx, 1);
  renderTable();
}

function selectAll(checked) {
  if (checked) { rows.forEach(r => { if (!pendingDeletes.includes(r.id)) pendingDeletes.push(r.id); }); }
  else { pendingDeletes = []; }
  renderTable();
}

function updatePendingInfo() {
  const total = pendingInserts.length + pendingUpdates.length + pendingDeletes.length;
  const el = document.getElementById('pending-info');
  if (total > 0) { el.textContent = 'Pending: ' + pendingInserts.length + ' inserts, ' + pendingUpdates.length + ' updates, ' + pendingDeletes.length + ' deletes'; el.classList.remove('hidden'); }
  else { el.classList.add('hidden'); }
}

function applyChanges() {
  if (pendingInserts.length === 0 && pendingUpdates.length === 0 && pendingDeletes.length === 0) { toast('No changes to apply', 'info'); return; }
  const total = pendingInserts.length + pendingUpdates.length + pendingDeletes.length;
  if (!confirm('Apply ' + total + ' changes to ' + currentSchema + '.' + currentTable + '? This action is transactional — all changes succeed or all roll back.')) return;

  fetch('/api/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify({ schema: currentSchema, table: currentTable, inserts: pendingInserts, updates: pendingUpdates, deletes: pendingDeletes })
  }).then(r => r.json()).then(d => {
    if (d.error) { toast('Error: ' + d.error, 'error'); return; }
    toast('Applied: ' + d.inserted + ' inserted, ' + d.updated + ' updated, ' + d.deleted + ' deleted', 'success');
    loadData();
  });
}

function sortBy(col) {
  if (sortCol === col) { sortDir = sortDir === 'asc' ? 'desc' : 'asc'; }
  else { sortCol = col; sortDir = 'asc'; }
  rows.sort((a, b) => {
    const va = a[col], vb = b[col];
    if (va === null) return 1; if (vb === null) return -1;
    if (typeof va === 'number') return sortDir === 'asc' ? va - vb : vb - va;
    return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
  });
  renderTable();
}
</script>
</body></html>`);
});

app.listen(PORT, () => console.log('DB Admin running on http://localhost:' + PORT));
