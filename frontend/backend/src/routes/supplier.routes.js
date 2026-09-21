
import express from 'express';
import { addSupplier, getSuppliers } from '../controllers/supplier.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

router.post('/', authenticate, requireRole('OWNER'), addSupplier);
router.get('/', authenticate, requireRole('OWNER', 'INVENTORY_MONITOR'), getSuppliers);

export default router;