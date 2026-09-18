
import express from 'express';
import { checkout } from '../controllers/checkout.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

router.post('/', authenticate, requireRole('CASHIER'), checkout);

export default router;