// Dashboard controller: Handles summary and analytics endpoints
import { getDb } from '../db.js';

export async function dashboardSummary(req, res, next) {
  try {
    const db = await getDb();
    // Totals
    const totalIncome = (await db.get("SELECT SUM(amount) as total FROM records WHERE type = 'income' AND deleted = 0"))?.total || 0;
    const totalExpense = (await db.get("SELECT SUM(amount) as total FROM records WHERE type = 'expense' AND deleted = 0"))?.total || 0;
    const netBalance = totalIncome - totalExpense;
    // Category-wise totals
    const categoryTotals = await db.all("SELECT category, type, SUM(amount) as total FROM records WHERE deleted = 0 GROUP BY category, type");
    // Recent activity (last 5)
    const recent = await db.all("SELECT * FROM records WHERE deleted = 0 ORDER BY date DESC, id DESC LIMIT 5");
    // Monthly trend
    const monthly = await db.all("SELECT strftime('%Y-%m', date) as month, type, SUM(amount) as total FROM records WHERE deleted = 0 GROUP BY month, type ORDER BY month DESC LIMIT 12");
    res.json({ totalIncome, totalExpense, netBalance, categoryTotals, recent, monthly });
  } catch (err) { next(err); }
}

export async function dashboardCategoryTotals(req, res, next) {
  try {
    const db = await getDb();
    const categoryTotals = await db.all("SELECT category, type, SUM(amount) as total FROM records WHERE deleted = 0 GROUP BY category, type");
    res.json({ categoryTotals });
  } catch (err) { next(err); }
}

export async function dashboardMonthlyTrends(req, res, next) {
  try {
    const db = await getDb();
    const monthlyTrends = await db.all("SELECT strftime('%Y-%m', date) as month, type, SUM(amount) as total FROM records WHERE deleted = 0 GROUP BY month, type ORDER BY month DESC LIMIT 12");
    res.json({ monthlyTrends });
  } catch (err) { next(err); }
}
