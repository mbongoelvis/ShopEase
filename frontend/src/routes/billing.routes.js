import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { getSubscriptionByStore, listInvoicesForStore } from '../models/billing.model.js';

const router = express.Router();

router.get('/me', authenticate, requireRole('OWNER'), async (req, res) => {
  const subscription = await getSubscriptionByStore(req.user.storeId);
  const invoices = await listInvoicesForStore(req.user.storeId);
  res.json({ subscription: subscription || null, invoices });
});

export default router;
