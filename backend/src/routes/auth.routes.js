
//
// Only login lives here — anything that isn't strictly "authentication"

 
import express from 'express';
import { login } from '../controllers/auth.controller.js';
 
const router = express.Router();
 
router.post('/login', login);
 
export default router;