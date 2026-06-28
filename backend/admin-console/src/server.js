require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.ADMIN_PORT || 4002;

// Security
app.use(helmet({ contentSecurityPolicy: { directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'", "'unsafe-inline'"], styleSrc: ["'self'", "'unsafe-inline'"], imgSrc: ["'self'", "data:"], connectSrc: ["'self'"] } } }));
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'], credentials: true }));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' }
});
app.use('/api/', limiter);

// Static files for admin dashboard UI
app.use(express.static(path.join(__dirname, '../public')));

// DB
const db = require('./services/db');

// Auth middleware
const auth = require('./middleware/auth');

// Routes
const areasRouter = require('./routes/areas');
const projectsRouter = require('./routes/projects');
const usersRouter = require('./routes/users');
const groupsRouter = require('./routes/groups');
const permissionsRouter = require('./routes/permissions');
const auditRouter = require('./routes/audit');
const syncRouter = require('./routes/sync');
const settingsRouter = require('./routes/settings');
const systemRouter = require('./routes/system');

app.use('/api/admin/areas', auth, areasRouter);
app.use('/api/admin/projects', auth, projectsRouter);
app.use('/api/admin/users', auth, usersRouter);
app.use('/api/admin/groups', auth, groupsRouter);
app.use('/api/admin/permissions', auth, permissionsRouter);
app.use('/api/admin/audit', auth, auditRouter);
app.use('/api/admin/sync', auth, syncRouter);
app.use('/api/admin/settings', auth, settingsRouter);
app.use('/api/admin/system', auth, systemRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'meter-verse-admin-console', version: '1.0.0', port: PORT });
});

// Login endpoint
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const result = await db.query(
      `SELECT u.*, r.role_code, r.role_name
       FROM core.users u
       JOIN core.user_role_assignments ura ON ura.user_id = u.id
       JOIN core.roles r ON r.id = ura.role_id
       WHERE u.username = $1 AND u.status = 'active'`,
      [username]
    );

    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const bcrypt = require('bcryptjs');
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      await db.query('UPDATE core.users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1', [user.id]);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check super_admin role
    if (user.role_code !== 'super_admin' && user.role_code !== 'admin') {
      return res.status(403).json({ error: 'Only administrators can access the admin console' });
    }

    await db.query(
      'UPDATE core.users SET failed_login_attempts = 0, last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { sub: user.id, username: user.username, role: user.role_code },
      process.env.JWT_SECRET || 'admln_sec_2026',
      { expiresIn: '4h' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role_code, roleName: user.role_name }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  Meter Verse Administration Center`);
  console.log(`  Enterprise Governance Console`);
  console.log(`  Port: ${PORT}`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Dashboard: http://localhost:${PORT}/`);
  console.log(`  API: http://localhost:${PORT}/api/admin/`);
  console.log(`========================================\n`);
});
