
import express from 'express';
import { adminLogin } from '../controllers/platformAdmin.controller.js';
import {
  getTenants,
  getTenantDetail,
  getPlatformAnalytics,
} from '../controllers/tenant.controller.js';
import { getAllBilling, payInvoice, sendPaymentReminder } from '../controllers/billing.controller.js';
import { getAllTickets, setTicketStatus } from '../controllers/supportTicket.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireSuperAdmin } from '../middleware/role.middleware.js';

const router = express.Router();

router.post('/login', adminLogin);

// Every route below requires BOTH a valid token (authenticate) AND
// specifically a platform-admin token (requireSuperAdmin) — a tenant
// Owner's perfectly valid token still gets rejected here, since
// accountType on their token is 'TENANT', not 'SUPER_ADMIN'.
router.get('/tenants', authenticate, requireSuperAdmin, getTenants);
router.get('/tenants/:storeId', authenticate, requireSuperAdmin, getTenantDetail);
router.get('/analytics', authenticate, requireSuperAdmin, getPlatformAnalytics);

router.get('/billing', authenticate, requireSuperAdmin, getAllBilling);
router.patch('/billing/invoices/:id/mark-paid', authenticate, requireSuperAdmin, payInvoice);
router.post('/billing/:storeId/send-reminder', authenticate, requireSuperAdmin, sendPaymentReminder);
 
router.get('/support-tickets', authenticate, requireSuperAdmin, getAllTickets);
router.patch('/support-tickets/:id/status', authenticate, requireSuperAdmin, setTicketStatus);

export default router;