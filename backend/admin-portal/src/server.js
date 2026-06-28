require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.ADMIN_PORT || 6262;

// Security
app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'", "'unsafe-inline'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", "data:"], connectSrc: ["'self'"] } }, crossOriginEmbedderPolicy: false }));
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'], credentials: true }));
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));

// Rate limiting
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, max: 300,
  standardHeaders: true, legacyHeaders: false,
  message: { error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' }
}));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// DB service
const db = require('./services/db');
const auth = require('./middleware/auth');

// ======================== LOGIN ========================
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
    const bcrypt = require('bcryptjs');
    const result = await db.query(
      `SELECT u.*, r.role_code, r.role_name, r.id as role_id
       FROM core.users u
       JOIN core.user_role_assignments ura ON ura.user_id = u.id
       JOIN core.roles r ON r.id = ura.role_id
       WHERE u.username = $1 AND u.status = 'active'`, [username]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      await db.query('UPDATE core.users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1', [user.id]);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    await db.query('UPDATE core.users SET failed_login_attempts = 0, last_login_at = NOW() WHERE id = $1', [user.id]);
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { sub: user.id, username: user.username, email: user.email, role: user.role_code, roleName: user.role_name },
      process.env.JWT_SECRET || 'admln_portal_2026', { expiresIn: '8h' }
    );
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role_code, roleName: user.role_name } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ======================== ROUTES ========================
app.use('/api/areas', auth, require('./routes/areas'));
app.use('/api/projects', auth, require('./routes/projects'));
app.use('/api/users', auth, require('./routes/users'));
app.use('/api/groups', auth, require('./routes/groups'));
app.use('/api/roles', auth, require('./routes/roles'));
app.use('/api/permissions', auth, require('./routes/permissions'));
app.use('/api/audit', auth, require('./routes/audit'));
app.use('/api/sync', auth, require('./routes/sync'));
app.use('/api/settings', auth, require('./routes/settings'));
app.use('/api/system', auth, require('./routes/system'));
app.use('/api/db', auth, require('./routes/database'));
app.use('/api/meta', auth, require('./routes/meta'));
app.use('/api/sync-control', auth, require('./routes/sync-control'));
app.use('/api/api-control', auth, require('./routes/api-control'));

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'meter-verse-admin-portal', version: '1.0.0', port: PORT });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n============================================`);
  console.log(`  Meter Verse Administration Portal`);
  console.log(`  Merged: DB Admin + Governance Console`);
  console.log(`  Port: ${PORT}`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`============================================\n`);
});
