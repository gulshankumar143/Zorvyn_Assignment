// Script to add users to the SQLite database for login testing
import { initDb, getDb } from './src/db.js';

const users = [
  { username: 'admin@finance.com', password: 'admin123', role: 'admin', status: 'active' },
  { username: 'analyst@finance.com', password: 'analyst123', role: 'analyst', status: 'active' },
  { username: 'viewer@finance.com', password: 'viewer123', role: 'viewer', status: 'active' },
  { username: 'gulshan@finance.com', password: 'gullu567', role: 'admin', status: 'active' },
];

const run = async () => {
  await initDb();
  const db = getDb();
  for (const user of users) {
    try {
      const result = db.run(
        'INSERT OR IGNORE INTO users (username, password, role, status) VALUES (?, ?, ?, ?)',
        [user.username, user.password, user.role, user.status]
      );
      if (result.changes > 0) {
        console.log('User created:', user.username);
      } else {
        console.log('User already exists:', user.username);
      }
    } catch (err) {
      console.error('Error inserting user:', err);
    }
  }
  process.exit();
};

run();
