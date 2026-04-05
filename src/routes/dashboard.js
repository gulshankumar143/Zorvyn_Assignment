
import { requireRole } from '../middleware/access.js';
import { Roles } from '../models/user.js';
import {
  dashboardSummary,
  dashboardCategoryTotals,
  dashboardMonthlyTrends,
} from '../controllers/dashboard.js';
import express from 'express';
const router = express.Router();

// All roles can access dashboard summary and analytics
router.get('/summary', requireRole(Roles.ADMIN, Roles.ANALYST, Roles.VIEWER), dashboardSummary);
router.get('/category-totals', requireRole(Roles.ADMIN, Roles.ANALYST, Roles.VIEWER), dashboardCategoryTotals);
router.get('/monthly-trends', requireRole(Roles.ADMIN, Roles.ANALYST, Roles.VIEWER), dashboardMonthlyTrends);

export default router;
