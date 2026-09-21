
import express from 'express';
import { validateExitScan, getExitHistory, reportExitDiscrepancy } from '../controllers/exit.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

router.post('/validate', authenticate, requireRole('SECURITY_GUARD'), validateExitScan);
router.get('/history', authenticate, requireRole('SECURITY_GUARD'), getExitHistory);
router.post('/report', authenticate, requireRole('SECURITY_GUARD'), reportExitDiscrepancy);

export default router;