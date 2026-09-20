import express from 'express';
import { 
  getTenantBilling, 
  setPreferredPaymentMethod,
  getAvailablePaymentMethods,
} from '../controllers/billing.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /billing/me — tenant's subscription and invoices
router.get('/me', authenticate, getTenantBilling);

// PATCH /billing/me/payment-method — set preferred payment method
router.patch('/me/payment-method', authenticate, setPreferredPaymentMethod);

// GET /billing/payment-methods — get all available payment methods
router.get('/payment-methods', authenticate, getAvailablePaymentMethods);

export default router;
