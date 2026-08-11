 
import express from 'express';
import { createEmployee } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
 
const router = express.Router();
 
// Owner-only — must be logged in (authenticate) AND be an OWNER (requireRole).
router.post('/', authenticate, requireRole('OWNER'), createEmployee);
 
export default router;
 