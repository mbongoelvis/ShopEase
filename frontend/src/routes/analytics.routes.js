
import express from 'express';
import { revenue, turnover, securityFlags } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

// Owner vs Inventory Monitor permission implemented:
// revenue is Owner-only (financial data), turnover is shared (both need
// stock visibility), security flags is Owner-only (personnel-sensitive).
router.get('/revenue', authenticate, requireRole('OWNER'), revenue);
router.get('/turnover', authenticate, requireRole('OWNER', 'INVENTORY_MONITOR'), turnover);
router.get('/security-flags', authenticate, requireRole('OWNER'), securityFlags);

export default router;