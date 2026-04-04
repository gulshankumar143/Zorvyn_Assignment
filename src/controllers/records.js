// Record controller: Handles financial record CRUD logic
import { getDb } from '../db.js';

export async function listRecords(req, res, next) {
  try {
    const db = await getDb();
    // Filtering: type, category, date
    const { type, category, date, search, limit = 10, offset = 0 } = req.query;
    let query = 'SELECT * FROM records WHERE deleted = 0';
    const params = [];
    if (type) { query += ' AND type = ?'; params.push(type); }
    if (category) { query += ' AND category = ?'; params.push(category); }
    if (date) { query += ' AND date = ?'; params.push(date); }
    if (search) {
      query += ' AND (notes LIKE ? OR category LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));
    const records = await db.all(query, params);
    // Optionally, return total count for pagination
    let countQuery = 'SELECT COUNT(*) as count FROM records WHERE deleted = 0';
    let countParams = [];
    if (type) { countQuery += ' AND type = ?'; countParams.push(type); }
    if (category) { countQuery += ' AND category = ?'; countParams.push(category); }
    if (date) { countQuery += ' AND date = ?'; countParams.push(date); }
    if (search) {
      countQuery += ' AND (notes LIKE ? OR category LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }
    const countRow = await db.get(countQuery, countParams);
    res.json({ records, total: countRow.count });
  } catch (err) { next(err); }
}

export async function createRecord(req, res, next) {
  try {
    const db = await getDb();
    const { amount, type, category, date, notes } = req.body;
    const userId = req.user.id;
    await db.run('INSERT INTO records (userId, amount, type, category, date, notes) VALUES (?, ?, ?, ?, ?, ?)', [userId, amount, type, category, date, notes]);
    res.status(201).json({ message: 'Record created' });
  } catch (err) { next(err); }
}

export async function updateRecord(req, res, next) {
  try {
    const db = await getDb();
    const { id } = req.params;
    const { amount, type, category, date, notes } = req.body;
    await db.run('UPDATE records SET amount = ?, type = ?, category = ?, date = ?, notes = ? WHERE id = ?', [amount, type, category, date, notes, id]);
    res.json({ message: 'Record updated' });
  } catch (err) { next(err); }
}

export async function deleteRecord(req, res, next) {
  try {
    const db = await getDb();
    const { id } = req.params;
    await db.run('UPDATE records SET deleted = 1 WHERE id = ?', [id]);
    res.json({ message: 'Record deleted (soft)' });
  } catch (err) { next(err); }
}
