// Dashboard controller: Handles summary and analytics endpoints
import { getDb } from '../db.js';

export async function dashboardSummary(req, res, next) {
  try {
    const db = await getDb();
    // Totals
    const totalIncome = (await db.get("SELECT SUM(amount) as total FROM records WHERE type = 'income'"))?.total || 0;
    const totalExpense = (await db.get("SELECT SUM(amount) as total FROM records WHERE type = 'expense'"))?.total || 0;
    const netBalance = totalIncome - totalExpense;
    // Category-wise totals
    const categoryTotals = await db.all("SELECT category, type, SUM(amount) as total FROM records GROUP BY category, type");
    // Recent activity (last 5)
    const recent = await db.all("SELECT * FROM records ORDER BY date DESC, id DESC LIMIT 5");
    // Monthly trend (last 6 months)
    const monthly = await db.all(`SELECT strftime('%Y-%m', date) as month, type, SUM(amount) as total FROM records GROUP BY month, type ORDER BY month DESC LIMIT 12`);
    res.json({ totalIncome, totalExpense, netBalance, categoryTotals, recent, monthly });
  } catch (err) { next(err); }
}
