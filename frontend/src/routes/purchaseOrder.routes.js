
import express from 'express';
import {
  addPurchaseOrder,
  getPurchaseOrders,
  sendPurchaseOrder,
  receivePurchaseOrderHandler,
  getAuditTrail,
} from '../controllers/purchaseOrder.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

router.post('/', authenticate, requireRole('OWNER', 'INVENTORY_MONITOR'), addPurchaseOrder);
router.get('/', authenticate, requireRole('OWNER', 'INVENTORY_MONITOR'), getPurchaseOrders);
router.patch('/:id/send', authenticate, requireRole('OWNER', 'INVENTORY_MONITOR'), sendPurchaseOrder);

// Stocker added here specifically — they're the one physically present
// at the delivery. received_by (set in the service) is what keeps this
// safe: every receipt is permanently attributed to exactly one person.
router.patch('/:id/receive', authenticate, requireRole('OWNER', 'INVENTORY_MONITOR', 'STOCKER'), receivePurchaseOrderHandler);

// Owner-only — the actual "catch fishy stuff" view.
router.get('/audit-trail', authenticate, requireRole('OWNER'), getAuditTrail);

export default router;