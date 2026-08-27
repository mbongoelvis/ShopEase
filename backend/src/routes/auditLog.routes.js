import express from 'express';
import { getAuditLogs, getEntityAuditLogs } from '../controllers/auditLog.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

// GET /audit-logs - List all audit logs (Owner only)
router.get('/', authenticate, requireRole('OWNER'), getAuditLogs);

// GET /audit-logs/entity/:entityType/:entityId - Get logs for specific entity
router.get('/entity/:entityType/:entityId', authenticate, requireRole('OWNER'), getEntityAuditLogs);

export default router;
