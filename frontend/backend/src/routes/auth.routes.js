
//
// Only login lives here — anything that isn't strictly "authentication"


import express from 'express';
import { login, changePassword } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/login', login);
router.patch('/change-password', authenticate, changePassword); // any logged-in user, changes their own password

export default router;