

import express from 'express';
import { addCategory, getCategories } from '../controllers/category.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

// Owner-only to create — matches your use-case diagram (category/pricing config is an Owner action)
router.post('/', authenticate, requireRole('OWNER'), addCategory);

// Any logged-in tenant role can VIEW categories (Cashier needs this to ring up items, etc.)
router.get('/', authenticate, getCategories);

export default router;