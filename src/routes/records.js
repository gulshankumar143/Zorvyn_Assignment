

import { requireRole } from '../middleware/access.js';
import { Roles } from '../models/user.js';
import { validateRecordInput } from '../utils/validation.js';
import { listRecords, createRecord, updateRecord, deleteRecord } from '../controllers/records.js';
import express from 'express';
const router = express.Router();

// Analyst and admin can view, only admin can modify
router.get('/', requireRole(Roles.ADMIN, Roles.ANALYST), listRecords);
router.post('/', requireRole(Roles.ADMIN), (req, res, next) => {
	const error = validateRecordInput(req.body);
	if (error) return res.status(400).json({ error });
	createRecord(req, res, next);
});
router.put('/:id', requireRole(Roles.ADMIN), updateRecord);
router.delete('/:id', requireRole(Roles.ADMIN), deleteRecord);

export default router;
