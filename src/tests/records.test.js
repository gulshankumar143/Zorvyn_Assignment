import request from 'supertest';
import express, { Router } from 'express';
import { initDb } from '../db.js';
import recordRoutes from '../routes/records.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireActive } from '../middleware/access.js';

import userRoutes from '../routes/users.js';

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
app.use('/records', recordRoutes);

beforeAll(async () => {
  await initDb({ test: true });
});

describe('Records API', () => {
  let token;
  beforeAll(async () => {
    // Create a user and get token
    const db = await import('../db.js').then(m => m.getDb());
    await db.run('INSERT OR IGNORE INTO users (username, password, role, status) VALUES (?, ?, ?, ?)', ['recorduser@finance.com', 'recordpass', 'admin', 'active']);
    const res = await request(app)
      .post('/users/login')
      .send({ email: 'recorduser@finance.com', password: 'recordpass' });
    token = res.body.token;
  });

  it('should create a record', async () => {
    const res = await request(app)
      .post('/records')
      .set('Authorization', `Bearer ${token}`)
      .send({ amount: 100, type: 'income', category: 'salary', date: '2024-01-01', notes: 'Test' });
    expect(res.statusCode).toBe(201);
  });

  it('should list records with pagination', async () => {
    const res = await request(app)
      .get('/records?limit=2&offset=0')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.records).toBeDefined();
    expect(res.body.total).toBeDefined();
  });

  it('should soft delete a record', async () => {
    // Create a record
    const db = await import('../db.js').then(m => m.getDb());
    await db.run('INSERT INTO records (userId, amount, type, category, date, notes) VALUES (?, ?, ?, ?, ?, ?)', [1, 50, 'expense', 'food', '2024-01-02', 'Lunch']);
    // Get record id
    const rec = await db.get('SELECT id FROM records WHERE notes = ?', ['Lunch']);
    const res = await request(app)
      .delete(`/records/${rec.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toMatch(/soft/);
  });
});
