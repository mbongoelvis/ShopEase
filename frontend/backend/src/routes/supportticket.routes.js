
// Tenant-side: any logged-in tenant employee can raise a ticket about their own store.

import express from 'express';
import { raiseTicket } from '../controllers/supportTicket.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticate, raiseTicket);

export default router;