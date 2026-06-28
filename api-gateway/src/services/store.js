const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_PATH, 'gateway.json');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

if (!fs.existsSync(DATA_PATH)) fs.mkdirSync(DATA_PATH, { recursive: true });

// Initialize data store
let data = { apiKeys: [], apiLogs: [], apiAlerts: [], apiConfig: {} };
if (fs.existsSync(DB_FILE)) {
  try { data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch (e) { console.error('Data file corrupt, resetting'); }
}

function save() {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// Seed defaults
if (!data.apiConfig.gateway_name) {
  data.apiConfig = {
    gateway_name: 'Meter Verse API Gateway',
    core_api_url: 'http://localhost:3001/api/v1',
    auto_disable_error_threshold: '10',
    auto_disable_window_minutes: '5',
    alert_email: 'admin@meter-verse.com',
  };
  save();
}

function generateApiKey() {
  return 'mv_' + crypto.randomBytes(24).toString('hex');
}

// API Keys CRUD
function listKeys() { return [...data.apiKeys].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); }

function getKey(id) { return data.apiKeys.find(k => k.id === id) || null; }

function getKeyByApiKey(apiKey) { return data.apiKeys.find(k => k.api_key === apiKey) || null; }

function createKey({ keyName, allowedMethods, allowedEndpoints, maxUsers, licenseKey, startDate, endDate, neverExpires, rateLimitPerMin, createdBy }) {
  const key = {
    id: uuidv4(), key_name: keyName, api_key: generateApiKey(),
    allowed_methods: allowedMethods || 'GET,POST,PATCH,DELETE', allowed_endpoints: allowedEndpoints || '*',
    is_active: 1, max_users: maxUsers || -1, current_users: 0,
    license_key: licenseKey || '', start_date: startDate || null, end_date: endDate || null,
    never_expires: neverExpires ? 1 : 0, rate_limit_per_min: rateLimitPerMin || 60,
    created_by: createdBy || 'admin',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  data.apiKeys.push(key);
  save();
  return key;
}

function updateKey(id, updates) {
  const idx = data.apiKeys.findIndex(k => k.id === id);
  if (idx === -1) return null;
  const fields = ['key_name', 'allowed_methods', 'allowed_endpoints', 'is_active', 'max_users', 'license_key', 'start_date', 'end_date', 'never_expires', 'rate_limit_per_min'];
  for (const f of fields) {
    if (updates[f] !== undefined) data.apiKeys[idx][f] = updates[f];
  }
  data.apiKeys[idx].updated_at = new Date().toISOString();
  save();
  return data.apiKeys[idx];
}

function deleteKey(id) {
  const idx = data.apiKeys.findIndex(k => k.id === id);
  if (idx === -1) return false;
  data.apiKeys.splice(idx, 1);
  save();
  return true;
}

function toggleKey(id, isActive) { return updateKey(id, { is_active: isActive ? 1 : 0 }); }

function validateApiKey(apiKey) {
  const key = getKeyByApiKey(apiKey);
  if (!key) return { valid: false, reason: 'INVALID_API_KEY' };
  if (!key.is_active) return { valid: false, reason: 'API_KEY_DISABLED' };
  if (!key.never_expires && key.end_date && new Date() > new Date(key.end_date)) return { valid: false, reason: 'API_KEY_EXPIRED' };
  if (key.start_date && new Date() < new Date(key.start_date)) return { valid: false, reason: 'API_KEY_NOT_YET_ACTIVE' };
  if (key.max_users > 0 && key.current_users >= key.max_users) return { valid: false, reason: 'MAX_USERS_REACHED' };
  return { valid: true, key };
}

// Audit Logs
function addLog(entry) {
  data.apiLogs.push({ id: data.apiLogs.length + 1, ...entry, created_at: new Date().toISOString() });
  if (data.apiLogs.length > 10000) data.apiLogs = data.apiLogs.slice(-5000);
  save();
}

function getLogs(limit = 100, offset = 0, filters = {}) {
  let logs = [...data.apiLogs].reverse();
  if (filters.apiKeyId) logs = logs.filter(l => l.api_key_id === filters.apiKeyId);
  if (filters.blocked !== undefined) logs = logs.filter(l => l.blocked === (filters.blocked ? 1 : 0));
  if (filters.method) logs = logs.filter(l => l.method === filters.method);
  return logs.slice(offset, offset + limit);
}

function getLogStats(hours = 24) {
  const cutoff = new Date(Date.now() - hours * 3600000).toISOString();
  const recent = data.apiLogs.filter(l => l.created_at > cutoff);
  return {
    total: recent.length,
    blocked: recent.filter(l => l.blocked).length,
    byMethod: Object.entries(recent.reduce((acc, l) => { acc[l.method] = (acc[l.method] || 0) + 1; return acc; }, {})).map(([method, c]) => ({ method, c })),
    byEndpoint: Object.entries(recent.reduce((acc, l) => { acc[l.endpoint] = (acc[l.endpoint] || 0) + 1; return acc; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([endpoint, c]) => ({ endpoint, c })),
  };
}

// Alerts
function createAlert(type, severity, message, apiKeyId = null) {
  data.apiAlerts.push({ id: data.apiAlerts.length + 1, alert_type: type, severity, message, api_key_id: apiKeyId, resolved: 0, created_at: new Date().toISOString(), resolved_at: null });
  if (data.apiAlerts.length > 1000) data.apiAlerts = data.apiAlerts.slice(-500);
  save();
}

function listAlerts(resolved = false, limit = 50) {
  return data.apiAlerts.filter(a => a.resolved === (resolved ? 1 : 0)).reverse().slice(0, limit);
}

function resolveAlert(id) {
  const a = data.apiAlerts.find(a => a.id === id);
  if (a) { a.resolved = 1; a.resolved_at = new Date().toISOString(); save(); }
}

function getUnresolvedCount() { return data.apiAlerts.filter(a => !a.resolved).length; }

function checkAndAlert(apiKeyId, apiKeyName, statusCode, endpoint, method) {
  const windowMin = parseInt(data.apiConfig.auto_disable_window_minutes || '5');
  const threshold = parseInt(data.apiConfig.auto_disable_error_threshold || '10');
  const cutoff = new Date(Date.now() - windowMin * 60000).toISOString();
  const recentErrors = data.apiLogs.filter(l => l.api_key_id === apiKeyId && l.blocked && l.created_at > cutoff).length;

  if (recentErrors >= threshold) {
    const key = getKey(apiKeyId);
    if (key) { key.is_active = 0; key.updated_at = new Date().toISOString(); save(); }
    createAlert('auto_disable', 'critical', `API key "${apiKeyName}" auto-disabled: ${recentErrors} errors in ${windowMin} minutes`, apiKeyId);
    return { disabled: true, reason: `Auto-disabled: ${recentErrors} errors in ${windowMin} min` };
  }

  if (statusCode >= 500) createAlert('server_error', 'high', `Server error on ${method} ${endpoint} for key "${apiKeyName}"`, apiKeyId);
  else if (statusCode === 429) createAlert('rate_limit', 'medium', `Rate limit on ${method} ${endpoint} for key "${apiKeyName}"`, apiKeyId);
  else if ([401, 403].includes(statusCode)) createAlert('auth_error', 'high', `Auth error ${statusCode} on ${method} ${endpoint} for key "${apiKeyName}"`, apiKeyId);
  return { disabled: false };
}

module.exports = {
  listKeys, getKey, getKeyByApiKey, createKey, updateKey, deleteKey, toggleKey, validateApiKey,
  addLog, getLogs, getLogStats,
  createAlert, listAlerts, resolveAlert, getUnresolvedCount, checkAndAlert,
  getConfig: () => ({ ...data.apiConfig }),
  updateConfig: (cfg) => { Object.assign(data.apiConfig, cfg); save(); },
  getData: () => data,
};
