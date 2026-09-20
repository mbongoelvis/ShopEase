
import express from 'express';
import { validateExitScan } from '../controllers/exit.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

router.post('/validate', authenticate, requireRole('SECURITY_GUARD'), validateExitScan);

export default router;