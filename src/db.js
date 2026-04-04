import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;
let dbFile = './finance.db';

export async function initDb({ test = false } = {}) {
  if (test) {
    dbFile = './test.db';
    if (db) {
      await db.close();
      db = undefined;
    }
  }
  if (db) return db;
  db = await open({
    filename: dbFile,
    driver: sqlite3.Database
  });

  // Drop tables if test mode (for clean state)
  if (test) {
    await db.exec('DROP TABLE IF EXISTS users');
    await db.exec('DROP TABLE IF EXISTS records');
  }

  // User table
  await db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    status TEXT DEFAULT 'active'
  )`);

  // Financial records table
  await db.exec(`CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    amount REAL NOT NULL,
    type TEXT NOT NULL,
    category TEXT,
    date TEXT NOT NULL,
    notes TEXT,
    deleted INTEGER DEFAULT 0,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`);

  return db;
}

export function getDb() {
  if (!db) throw new Error('DB not initialized');
  return db;
}
