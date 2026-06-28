const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const store = require('./services/store');
const adminRoutes = require('./routes/admin');
const { authMiddleware, methodMiddleware, endpointMiddleware, rateLimitMiddleware, auditMiddleware } = require('./middleware/gateway');

const app = express();
const PORT = process.env.GATEWAY_PORT || 4000;
const CORE_API_URL = store.getConfig().core_api_url || 'http://localhost:3001/api/v1';

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Global rate limiting for all routes
app.use(rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

// Admin API (internal, no gateway auth)
app.use('/admin', adminRoutes);

// Bypass auth for login/dev-login (no API key needed)
app.use('/api/v1/auth', (req, res, next) => {
  if (req.path === '/dev-login' || req.path === '/login' || req.path === '/csrf-token') {
    return next();
  }
  authMiddleware(req, res, () => { next(); });
}, createProxyMiddleware({
  target: CORE_API_URL, changeOrigin: true, pathRewrite: { '^/api/v1': '/' },
}));

// Gateway proxy — all external requests go through security checks
app.use('/api/v1', (req, res, next) => {
  authMiddleware(req, res, () => {
    methodMiddleware(req, res, () => {
      endpointMiddleware(req, res, () => {
        rateLimitMiddleware(req, res, () => {
          auditMiddleware(req, res, () => {
            next();
          });
        });
      });
    });
  });
}, createProxyMiddleware({
  target: CORE_API_URL,
  changeOrigin: true,
  pathRewrite: { '^/api/v1': '/' },
}));

// Health (no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', gateway: 'Meter Verse API Gateway v1.0.0', proxying: CORE_API_URL });
});

app.listen(PORT, () => {
  console.log(`\n🔐 Meter Verse API Gateway`);
  console.log(`   Port: ${PORT}`);
  console.log(`   Proxying: ${CORE_API_URL}`);
  console.log(`   Admin UI: http://localhost:${PORT}\n`);
});
