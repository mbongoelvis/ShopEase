import express from 'express';
import { addBranch, getBranches, editBranch, removeBranch } from '../controllers/branch.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

// GET /branches — Owner-only, fetch all branches
router.get('/', authenticate, requireRole('OWNER'), getBranches);

// POST /branches — Owner-only, create new branch
router.post('/', authenticate, requireRole('OWNER'), addBranch);

// PATCH /branches/:branchId — Owner-only, update branch
router.patch('/:branchId', authenticate, requireRole('OWNER'), editBranch);

// DELETE /branches/:branchId — Owner-only, delete branch
router.delete('/:branchId', authenticate, requireRole('OWNER'), removeBranch);

export default router;
