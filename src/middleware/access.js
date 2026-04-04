// Role-based access control middleware
import { Roles, UserStatus } from '../models/user.js';

// Mock authentication (for demo, replace with real auth in prod)
export function mockAuth(req, res, next) {
  // In real apps, extract user from JWT/session
  // Here, allow role/status override via headers for demo/testing
  req.user = {
    id: 1,
    username: 'demo',
    role: req.headers['x-role'] || Roles.ADMIN,
    status: req.headers['x-status'] || UserStatus.ACTIVE,
  };
  next();
}

// Require user to have one of the roles
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    // Debug log for test troubleshooting
    if (process.env.NODE_ENV === 'test') {
      // eslint-disable-next-line no-console
      console.log('requireRole:', { user: req.user, allowedRoles });
    }
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role', user: req.user, allowedRoles });
    }
    next();
  };
}

// Require user to be active
export function requireActive(req, res, next) {
  if (!req.user || req.user.status !== UserStatus.ACTIVE) {
    return res.status(403).json({ error: 'Forbidden: inactive user' });
  }
  next();
}
