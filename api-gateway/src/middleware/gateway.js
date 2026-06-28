const store = require('../services/store');

function authMiddleware(req, res, next) {
  // Allow JWT-authenticated requests (from frontend users) to bypass API key check
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next(); // JWT validation happens in the core API
  }

  // For third-party/external requests, require API key
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  if (!apiKey) { req.blockReason = 'MISSING_API_KEY'; return res.status(401).json({ error: 'Missing API key', code: 'MISSING_API_KEY' }); }
  const validation = store.validateApiKey(apiKey);
  if (!validation.valid) { req.blockReason = validation.reason; return res.status(403).json({ error: validation.reason, code: validation.reason }); }
  req.apiKeyData = validation.key;
  next();
}

function methodMiddleware(req, res, next) {
  const allowed = (req.apiKeyData?.allowed_methods || 'GET,POST,PATCH,DELETE').split(',').map(m => m.trim().toUpperCase());
  if (!allowed.includes(req.method)) { req.blockReason = 'METHOD_NOT_ALLOWED'; return res.status(405).json({ error: `Method ${req.method} not allowed` }); }
  next();
}

function endpointMiddleware(req, res, next) {
  const allowed = req.apiKeyData?.allowed_endpoints || '*';
  if (allowed === '*') return next();
  const patterns = allowed.split(',').map(e => e.trim());
  const matches = patterns.some(p => p === req.path || (p.endsWith('*') && req.path.startsWith(p.slice(0, -1))));
  if (!matches) { req.blockReason = 'ENDPOINT_NOT_ALLOWED'; return res.status(403).json({ error: 'Endpoint not allowed' }); }
  next();
}

function rateLimitMiddleware(req, res, next) {
  const maxReqs = req.apiKeyData?.rate_limit_per_min || 60;
  if (!global.rateLimitStore) global.rateLimitStore = {};
  const now = Date.now();
  const keyId = req.apiKeyData?.id || 'unknown';
  if (!global.rateLimitStore[keyId]) global.rateLimitStore[keyId] = [];
  global.rateLimitStore[keyId] = global.rateLimitStore[keyId].filter(t => now - t < 60000);
  if (global.rateLimitStore[keyId].length >= maxReqs) {
    req.blockReason = 'RATE_LIMIT_EXCEEDED';
    return res.status(429).json({ error: 'Rate limit exceeded', limit: maxReqs, remaining: 0 });
  }
  global.rateLimitStore[keyId].push(now);
  res.setHeader('X-RateLimit-Limit', maxReqs);
  res.setHeader('X-RateLimit-Remaining', maxReqs - global.rateLimitStore[keyId].length);
  next();
}

function auditMiddleware(req, res, next) {
  const start = Date.now();
  const originalEnd = res.end.bind(res);
  res.end = function (...args) {
    const responseTime = Date.now() - start;
    store.addLog({
      api_key_id: req.apiKeyData?.id || null, api_key_name: req.apiKeyData?.key_name || 'unknown',
      method: req.method, endpoint: req.path, status_code: res.statusCode,
      ip_address: req.ip || '', user_agent: req.headers['user-agent'] || '',
      response_time_ms: responseTime, blocked: req.blockReason ? 1 : 0, block_reason: req.blockReason || null,
    });
    if (res.statusCode >= 400) store.checkAndAlert(req.apiKeyData?.id, req.apiKeyData?.key_name, res.statusCode, req.path, req.method);
    originalEnd(...args);
  };
  next();
}

module.exports = { authMiddleware, methodMiddleware, endpointMiddleware, rateLimitMiddleware, auditMiddleware };
