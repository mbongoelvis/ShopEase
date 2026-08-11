

import express from 'express';
import multer from 'multer';
import { bulkUploadProducts } from '../controllers/bulkUpload.controller.js';
import { addProduct, getProductByBarcode } from '../controllers/product.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

// Owner-only to create products (matches "Products" tab access in the tenant dashboard)
router.post('/', authenticate, requireRole('OWNER'), addProduct);


// memoryStorage: keeps the uploaded file in RAM as a Buffer instead of saving it to disk, fine for CSVs (small, one-time use), avoids the extra step of cleaning up temp files afterward.
const upload = multer({ storage: multer.memoryStorage() });
 
router.post('/', authenticate, requireRole('OWNER'), addProduct);
router.post('/bulk-upload', authenticate, requireRole('OWNER'), upload.single('file'), bulkUploadProducts);

// Any logged-in tenant role can look up a product by barcode —
// Cashier scanning at checkout, Stocker scanning intake, etc.
router.get('/:barcode', authenticate, getProductByBarcode);

export default router;