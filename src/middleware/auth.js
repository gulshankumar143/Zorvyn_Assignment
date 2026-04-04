// JWT authentication middleware
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret';

// Issue JWT token (call in login route)
export function issueToken(user) {
  return jwt.sign({
    id: user.id,
    username: user.username,
    role: user.role,
    status: user.status,
  }, JWT_SECRET, { expiresIn: '2h' });
}

// Authenticate JWT token
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Missing token' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}
