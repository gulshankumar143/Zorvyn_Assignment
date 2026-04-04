// Script to add users to the SQLite database for login testing
import { initDb, getDb } from './src/db.js';

const users = [
  { username: 'admin', password: 'admin123', role: 'admin', status: 'active' },
  { username: 'analyst', password: 'analyst123', role: 'analyst', status: 'active' },
  { username: 'viewer', password: 'viewer123', role: 'viewer', status: 'active' },
  { username: 'gulshan', password: 'gullu567', role: 'admin', status: 'active' },
];

const run = async () => {
  await initDb();
  const db = getDb();
  for (const user of users) {
    try {
      await db.run(
        'INSERT INTO users (username, password, role, status) VALUES (?, ?, ?, ?)',
        [user.username, user.password, user.role, user.status]
      );
      console.log('User created:', user.username);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        console.log('User already exists:', user.username);
      } else {
        console.error('Error inserting user:', err);
      }
    }
  }
  process.exit();
};

run();
