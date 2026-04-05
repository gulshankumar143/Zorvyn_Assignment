// User controller: Handles user CRUD logic
import { getDb } from '../db.js';
import { UserStatus } from '../models/user.js';
import jwt from 'jsonwebtoken';

// ================= USERS =================

export async function listUsers(req, res, next) {
  try {
    const db = await getDb();
    const users = await db.all(
      'SELECT id, username, role, status FROM users'
    );
    res.json(users);
  } catch (err) {
    next(err);
  }
}

export async function createUser(req, res, next) {
  try {
    const db = await getDb();
    const { username, email, password, role } = req.body;
    const userIdentifier = username || email;
    const status = UserStatus.ACTIVE;

    await db.run(
      'INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)',
      [userIdentifier, password, role, status]
    );

    res.status(201).json({ message: 'User created' });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT') {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    next(err);
  }
}

export async function updateUser(req, res, next) {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { password, role, status } = req.body;

    await db.run(
      'UPDATE users SET password = ?, role = ?, status = ? WHERE id = ?',
      [password, role, status, id]
    );

    res.json({ message: 'User updated' });
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req, res, next) {
  try {
    const db = await getDb();
    const { id } = req.params;

    await db.run('DELETE FROM users WHERE id = ?', [id]);

    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
}

// ================= LOGIN =================

export async function loginUser(req, res, next) {
  try {
    const db = await getDb();
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Find user
    const user = await db.get(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password (plain text for now)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if active
    if (user.status !== UserStatus.ACTIVE) {
      return res.status(403).json({ error: 'User is inactive' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET || 'secret123',
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
    });

  } catch (err) {
    next(err);
  }
}