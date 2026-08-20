 
import express from 'express';
import { createEmployee, listEmployees } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
 
const router = express.Router();
 
// GET /employees — list all employees for the current owner's store (authenticated users only)
router.get('/', authenticate, listEmployees);

// POST /employees — owner-only — must be logged in (authenticate) AND be an OWNER (requireRole).
router.post('/', authenticate, requireRole('OWNER'), createEmployee);
 
export default router;
 