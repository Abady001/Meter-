const jwt = require('jsonwebtoken');
module.exports = function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization required', code: 'AUTH_REQUIRED' });
  }
  try {
    req.user = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET || 'admln_portal_2026');
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token', code: 'INVALID_TOKEN' });
  }
};
