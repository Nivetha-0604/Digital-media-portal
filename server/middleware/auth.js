const jwt = require('jsonwebtoken');

const read = req => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  return token ? jwt.verify(token, process.env.JWT_SECRET) : null;
};

exports.auth = (req, res, next) => {
  try { req.user = read(req); } catch { return res.status(401).json({ msg: 'Session expired, please login again' }); }
  if (!req.user) return res.status(401).json({ msg: 'Login required' });
  next();
};

exports.optionalAuth = (req, res, next) => {
  try { req.user = read(req); } catch { req.user = null; }
  next();
};

exports.role = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ msg: 'Not allowed for your role' });
