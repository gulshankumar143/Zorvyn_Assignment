import request from 'supertest';
import express, { Router } from 'express';
import { initDb } from '../db.js';
import userRoutes from '../routes/users.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireActive } from '../middleware/access.js';

const app = express();
app.use(express.json());
// Create a separate router for login
const loginRouter = Router();
loginRouter.post('/login', async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const loginId = username || email;
    if (!loginId || !password) return res.status(400).json({ error: 'Missing credentials' });
    const db = await import('../db.js').then(m => m.getDb());
    const user = await db.get('SELECT * FROM users WHERE username = ?', [loginId]);
    if (!user || user.password !== password) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.status !== 'active') return res.status(403).json({ error: 'User inactive' });
    const jwt = await import('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'changeme-secret';
    const token = jwt.default.sign({
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
    }, JWT_SECRET, { expiresIn: '2h' });
    res.json({ token });
  } catch (err) { next(err); }
});
app.use('/users', loginRouter);
// Apply authentication and active check for all other routes
app.use(authenticateToken);
app.use(requireActive);
// Mount all other user routes (except /login)
app.use('/users', (req, res, next) => {
  if (req.path === '/login') return next('route');
  return userRoutes(req, res, next);
});

beforeAll(async () => {
  await initDb({ test: true });
});

describe('User API', () => {
  let token;
  it('should login with valid credentials', async () => {
    // Create a user first (direct DB insert for test)
    const db = await import('../db.js').then(m => m.getDb());
    await db.run('INSERT OR IGNORE INTO users (username, password, role, status) VALUES (?, ?, ?, ?)', ['testuser@finance.com', 'testpass', 'admin', 'active']);
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'testuser@finance.com', password: 'testpass' });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('should reject invalid login', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({ username: 'testuser', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });

  it('should list users with valid token', async () => {
    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
