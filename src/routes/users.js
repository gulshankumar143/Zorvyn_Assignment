import express from 'express';
import { requireRole } from '../middleware/access.js';
import { Roles, UserStatus } from '../models/user.js';
import { validateUserInput } from '../utils/validation.js';
import { listUsers, createUser, updateUser, deleteUser } from '../controllers/users.js';
import { issueToken, authenticateToken } from '../middleware/auth.js';
import { requireActive } from '../middleware/access.js';
import { getDb } from '../db.js';

const router = express.Router();

// ================= PUBLIC ROUTE =================

// 🔐 LOGIN (no auth required)
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;

    console.log("LOGIN BODY:", req.body);

    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const db = await getDb();

    const user = await db.get(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    console.log("USER FROM DB:", user);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status !== UserStatus.ACTIVE) {
      return res.status(403).json({ error: 'User inactive' });
    }

    // 🎟 Generate JWT
    const token = issueToken({
      id: user.id,
      role: user.role,
      username: user.username,
      status: user.status
    });

    return res.json({
      message: 'Login successful',
      token
    });

  } catch (err) {
    next(err);
  }
});

// ================= PROTECTED ROUTES =================

// 👥 Get users (admin + analyst)
router.get('/', authenticateToken, requireActive, requireRole(Roles.ADMIN, Roles.ANALYST), listUsers);

// ➕ Create user (admin only)
router.post('/', authenticateToken, requireActive, requireRole(Roles.ADMIN), (req, res, next) => {
  const error = validateUserInput(req.body);

  console.log("VALIDATION ERROR:", error);

  if (error) {
    return res.status(400).json({ error });
  }

  createUser(req, res, next);
});

// ✏️ Update user (admin only)
router.put('/:id', authenticateToken, requireActive, requireRole(Roles.ADMIN), updateUser);

// ❌ Delete user (admin only)
router.delete('/:id', authenticateToken, requireActive, requireRole(Roles.ADMIN), deleteUser);

export default router;