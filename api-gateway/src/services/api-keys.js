const db = require('../db');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

function generateApiKey() {
  return 'mv_' + crypto.randomBytes(24).toString('hex');
}

function query(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT') || sql.trim().toUpperCase().startsWith('WITH')) {
      const rows = [];
      while (stmt.step()) rows.push(stmt.getAsObject());
      stmt.free();
      return rows;
    } else {
      const result = stmt.run(params);
      stmt.free();
      require('../db').saveDb();
      return result;
    }
  } catch (e) {
    console.error('DB Error:', e.message, 'SQL:', sql.substring(0, 80));
    return [];
  }
}

function getOne(sql, params = []) {
  const rows = query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function listKeys() {
  return query('SELECT * FROM api_keys ORDER BY created_at DESC');
}

function getKey(id) {
  return getOne('SELECT * FROM api_keys WHERE id = ?', [id]);
}

function getKeyByApiKey(apiKey) {
  return getOne('SELECT * FROM api_keys WHERE api_key = ?', [apiKey]);
}

function createKey({ keyName, allowedMethods, allowedEndpoints, maxUsers, licenseKey, startDate, endDate, neverExpires, rateLimitPerMin, createdBy }) {
  const id = uuidv4();
  const apiKey = generateApiKey();
  query(`INSERT INTO api_keys (id, key_name, api_key, allowed_methods, allowed_endpoints, max_users, license_key, start_date, end_date, never_expires, rate_limit_per_min, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, keyName, apiKey, allowedMethods || 'GET,POST,PATCH,DELETE', allowedEndpoints || '*',
    maxUsers || -1, licenseKey || '', startDate || null, endDate || null,
    neverExpires ? 1 : 0, rateLimitPerMin || 60, createdBy || 'admin']);
  return getKey(id);
}

function updateKey(id, updates) {
  const existing = getKey(id);
  if (!existing) return null;
  const fields = ['key_name', 'allowed_methods', 'allowed_endpoints', 'is_active', 'max_users', 'license_key', 'start_date', 'end_date', 'never_expires', 'rate_limit_per_min'];
  const sets = [];
  const vals = [];
  for (const f of fields) {
    if (updates[f] !== undefined) {
      sets.push(`${f} = ?`);
      vals.push(updates[f]);
    }
  }
  if (sets.length > 0) {
    sets.push("updated_at = datetime('now')");
    query(`UPDATE api_keys SET ${sets.join(', ')} WHERE id = ?`, [...vals, id]);
  }
  return getKey(id);
}

function deleteKey(id) {
  const existing = getKey(id);
  if (!existing) return false;
  query('DELETE FROM api_keys WHERE id = ?', [id]);
  return true;
}

function toggleKey(id, isActive) {
  return updateKey(id, { is_active: isActive ? 1 : 0 });
}

function validateApiKey(apiKey) {
  const key = getKeyByApiKey(apiKey);
  if (!key) return { valid: false, reason: 'INVALID_API_KEY' };
  if (!key.is_active) return { valid: false, reason: 'API_KEY_DISABLED' };
  if (!key.never_expires && key.end_date) {
    const now = new Date();
    const end = new Date(key.end_date);
    if (now > end) return { valid: false, reason: 'API_KEY_EXPIRED' };
  }
  if (key.start_date) {
    const now = new Date();
    const start = new Date(key.start_date);
    if (now < start) return { valid: false, reason: 'API_KEY_NOT_YET_ACTIVE' };
  }
  if (key.max_users > 0 && key.current_users >= key.max_users) {
    return { valid: false, reason: 'MAX_USERS_REACHED' };
  }
  return { valid: true, key };
}

function getLogs(limit = 100, offset = 0, filters = {}) {
  let sql = 'SELECT * FROM api_logs WHERE 1=1';
  const params = [];
  if (filters.apiKeyId) { sql += ' AND api_key_id = ?'; params.push(filters.apiKeyId); }
  if (filters.blocked !== undefined) { sql += ' AND blocked = ?'; params.push(filters.blocked ? 1 : 0); }
  if (filters.method) { sql += ' AND method = ?'; params.push(filters.method); }
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  return query(sql, params);
}

function getLogStats(hours = 24) {
  return {
    total: getOne("SELECT COUNT(*) as c FROM api_logs WHERE created_at > datetime('now', ?)", [`-${hours} hours`])?.c || 0,
    blocked: getOne("SELECT COUNT(*) as c FROM api_logs WHERE blocked = 1 AND created_at > datetime('now', ?)", [`-${hours} hours`])?.c || 0,
    byMethod: query("SELECT method, COUNT(*) as c FROM api_logs WHERE created_at > datetime('now', ?) GROUP BY method", [`-${hours} hours`]),
    byEndpoint: query("SELECT endpoint, COUNT(*) as c FROM api_logs WHERE created_at > datetime('now', ?) GROUP BY endpoint ORDER BY c DESC LIMIT 10", [`-${hours} hours`]),
  };
}

module.exports = { listKeys, getKey, getKeyByApiKey, createKey, updateKey, deleteKey, toggleKey, validateApiKey, getLogs, getLogStats };
