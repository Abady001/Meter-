const { query, getOne } = require('../db');

function queryDb(sql, params = []) {
  const rows = [];
  try {
    const stmt = global.db.prepare(sql);
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      while (stmt.step()) rows.push(stmt.getAsObject());
    } else {
      stmt.run(params);
      require('../db').saveDb();
    }
    stmt.free();
  } catch (e) { console.error('Alert DB error:', e.message); }
  return rows;
}

function getOneDb(sql, params = []) {
  const rows = queryDb(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function createAlert(type, severity, message, apiKeyId = null) {
  queryDb('INSERT INTO api_alerts (alert_type, severity, message, api_key_id) VALUES (?, ?, ?, ?)',
    [type, severity, message, apiKeyId]);
}

function listAlerts(resolved = false, limit = 50) {
  return queryDb('SELECT * FROM api_alerts WHERE resolved = ? ORDER BY created_at DESC LIMIT ?', [resolved ? 1 : 0, limit]);
}

function resolveAlert(id) {
  queryDb("UPDATE api_alerts SET resolved = 1, resolved_at = datetime('now') WHERE id = ?", [id]);
}

function getUnresolvedCount() {
  return getOneDb('SELECT COUNT(*) as c FROM api_alerts WHERE resolved = 0')?.c || 0;
}

function checkAndAlert(apiKeyId, apiKeyName, statusCode, endpoint, method) {
  const config = {
    auto_disable_window_minutes: parseInt(getOneDb("SELECT value FROM api_config WHERE key = 'auto_disable_window_minutes'")?.value || '5'),
    auto_disable_error_threshold: parseInt(getOneDb("SELECT value FROM api_config WHERE key = 'auto_disable_error_threshold'")?.value || '10'),
  };

  if (statusCode >= 400) {
    const recentErrors = getOneDb(
      "SELECT COUNT(*) as c FROM api_logs WHERE api_key_id = ? AND blocked = 1 AND created_at > datetime('now', ?)",
      [apiKeyId, `-${config.auto_disable_window_minutes} minutes`]
    )?.c || 0;

    if (recentErrors >= config.auto_disable_error_threshold) {
      queryDb('UPDATE api_keys SET is_active = 0, updated_at = datetime(\'now\') WHERE id = ?', [apiKeyId]);
      createAlert('auto_disable', 'critical',
        `API key "${apiKeyName}" auto-disabled: ${recentErrors} errors in ${config.auto_disable_window_minutes} minutes`, apiKeyId);
      return { disabled: true, reason: `Auto-disabled: ${recentErrors} errors in ${config.auto_disable_window_minutes} min` };
    }

    if (statusCode >= 500) {
      createAlert('server_error', 'high', `Server error on ${method} ${endpoint} for key "${apiKeyName}"`, apiKeyId);
    } else if (statusCode === 429) {
      createAlert('rate_limit', 'medium', `Rate limit hit on ${method} ${endpoint} for key "${apiKeyName}"`, apiKeyId);
    } else if (statusCode === 401 || statusCode === 403) {
      createAlert('auth_error', 'high', `Auth error ${statusCode} on ${method} ${endpoint} for key "${apiKeyName}"`, apiKeyId);
    }
  }
  return { disabled: false };
}

module.exports = { createAlert, listAlerts, resolveAlert, getUnresolvedCount, checkAndAlert };
