let initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'gateway.db');
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

let db = null;

// Initialize database
(async function init() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`CREATE TABLE IF NOT EXISTS api_keys (
    id TEXT PRIMARY KEY, key_name TEXT NOT NULL, api_key TEXT UNIQUE NOT NULL,
    allowed_methods TEXT DEFAULT 'GET,POST,PATCH,DELETE', allowed_endpoints TEXT DEFAULT '*',
    is_active INTEGER DEFAULT 1, max_users INTEGER DEFAULT -1, current_users INTEGER DEFAULT 0,
    license_key TEXT, start_date TEXT, end_date TEXT, never_expires INTEGER DEFAULT 0,
    rate_limit_per_min INTEGER DEFAULT 60, created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS api_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, api_key_id TEXT, api_key_name TEXT,
    method TEXT, endpoint TEXT, status_code INTEGER, ip_address TEXT, user_agent TEXT,
    response_time_ms INTEGER, blocked INTEGER DEFAULT 0, block_reason TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS api_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT, alert_type TEXT NOT NULL, severity TEXT DEFAULT 'medium',
    message TEXT NOT NULL, api_key_id TEXT, resolved INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')), resolved_at TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS api_config (
    key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT DEFAULT (datetime('now'))
  )`);

  // Seed defaults
  const seed = db.prepare('INSERT OR IGNORE INTO api_config (key, value) VALUES (?, ?)');
  seed.run(['gateway_name', 'Meter Verse API Gateway']);
  seed.run(['core_api_url', 'http://localhost:3001/api/v1']);
  seed.run(['auto_disable_error_threshold', '10']);
  seed.run(['auto_disable_window_minutes', '5']);
  seed.run(['alert_email', 'admin@meter-verse.com']);
  seed.free();
  save();
})();

function save() {
  if (db) {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

function query(sql, params = []) {
  if (!db) return [];
  try {
    const stmt = db.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('WITH')) {
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows;
    } else {
      stmt.run(params);
      stmt.free();
      save();
      return [];
    }
  } catch (e) {
    console.error('DB Error:', e.message.substring(0, 100));
    return [];
  }
}

function getOne(sql, params = []) {
  const rows = query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

// Set timeout to wait for async init
let ready = false;
const checkReady = setInterval(() => {
  if (db !== null) {
    ready = true;
    clearInterval(checkReady);
  }
}, 10);

// Export functions that work after async init
module.exports = {
  get query() { return query; },
  get getOne() { return getOne; },
  get db() { return db; },
  get ready() { return ready; },
  saveDb: save,
  waitForInit: function() {
    return new Promise(resolve => {
      const check = () => { if (db) { resolve(); } else { setTimeout(check, 10); } };
      check();
    });
  }
};
