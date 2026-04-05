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

  // Drop tables in test mode
  if (test) {
    db.exec('DROP TABLE IF EXISTS users');
    db.exec('DROP TABLE IF EXISTS records');
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

export function getDb() {
  if (!db) throw new Error('DB not initialized');
  return db;
}