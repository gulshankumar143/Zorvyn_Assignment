
import { requireRole } from '../middleware/access.js';
import { Roles } from '../models/user.js';
import { dashboardSummary } from '../controllers/dashboard.js';
import express from 'express';
const router = express.Router();

// All roles can access dashboard summary
router.get('/summary', requireRole(Roles.ADMIN, Roles.ANALYST, Roles.VIEWER), dashboardSummary);

export default router;
