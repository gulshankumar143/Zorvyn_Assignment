import Database from 'better-sqlite3';

let db;
let dbFile = './finance.db';

export function initDb({ test = false } = {}) {
  if (test) {
    dbFile = './test.db';
    if (db) {
      db.close();
      db = undefined;
    }
  }

  if (db) return db;

  db = new Database(dbFile);
  db.run = function (sql, params = []) {
    return this.prepare(sql).run(...(Array.isArray(params) ? params : [params]));
  };
  db.get = function (sql, params = []) {
    return this.prepare(sql).get(...(Array.isArray(params) ? params : [params]));
  };
  db.all = function (sql, params = []) {
    return this.prepare(sql).all(...(Array.isArray(params) ? params : [params]));
  };

  // Drop tables in test mode
  if (test) {
    db.exec('PRAGMA foreign_keys = OFF');
    db.exec('DROP TABLE IF EXISTS records');
    db.exec('DROP TABLE IF EXISTS users');
    db.exec('PRAGMA foreign_keys = ON');
  }

  // User table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT DEFAULT 'active'
    )
  `);

  if (!test) {
    seedDefaultUsers();
  }

  // Financial records table
  db.exec(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER,
      amount REAL NOT NULL,
      type TEXT NOT NULL,
      category TEXT,
      date TEXT NOT NULL,
      notes TEXT,
      deleted INTEGER DEFAULT 0,
      FOREIGN KEY(userId) REFERENCES users(id)
    )
  `);

  return db;
}

const defaultUsers = [
  { username: 'admin@finance.com', password: 'admin123', role: 'admin', status: 'active' },
  { username: 'analyst@finance.com', password: 'analyst123', role: 'analyst', status: 'active' },
  { username: 'viewer@finance.com', password: 'viewer123', role: 'viewer', status: 'active' },
];

function seedDefaultUsers() {
  const countRow = db.get('SELECT COUNT(*) AS count FROM users');
  if (!countRow || countRow.count > 0) {
    return;
  }

  const insertSql = 'INSERT OR IGNORE INTO users (username, password, role, status) VALUES (?, ?, ?, ?)';
  for (const user of defaultUsers) {
    db.run(insertSql, [user.username, user.password, user.role, user.status]);
  }
}

export function getDb() {
  if (!db) throw new Error('DB not initialized');
  return db;
}