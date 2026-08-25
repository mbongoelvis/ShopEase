
import express from 'express';
import { createEmployee } from '../controllers/auth.controller.js';
import { getEmployees } from '../controllers/employee.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

// GET /employees — Owner-only, fetch all employees in the store
router.get('/', authenticate, requireRole('OWNER'), getEmployees);

// Owner-only — must be logged in (authenticate) AND be an OWNER (requireRole).
router.post('/', authenticate, requireRole('OWNER'), createEmployee);

export default router;
 