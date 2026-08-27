
import express from 'express';
import { createEmployee } from '../controllers/auth.controller.js';
import { getEmployees, deleteEmployee, resetEmployeePassword } from '../controllers/employee.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

// GET /employees — Owner-only, fetch all employees in the store
router.get('/', authenticate, requireRole('OWNER'), getEmployees);

// POST /employees — Owner-only, create new employee
router.post('/', authenticate, requireRole('OWNER'), createEmployee);

// DELETE /employees/:employeeId — Owner-only, delete employee account
router.delete('/:employeeId', authenticate, requireRole('OWNER'), deleteEmployee);

// PATCH /employees/:employeeId/reset-password — Owner-only, reset employee password
router.patch('/:employeeId/reset-password', authenticate, requireRole('OWNER'), resetEmployeePassword);

export default router;
 