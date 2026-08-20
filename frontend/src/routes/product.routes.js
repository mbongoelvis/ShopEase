

import express from 'express';
import multer from 'multer';
import { bulkUploadProducts } from '../controllers/bulkUpload.controller.js';
import { addProduct, listProducts, getProductByBarcode } from '../controllers/product.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

router.get('/', authenticate, listProducts);
router.post('/', authenticate, requireRole('OWNER'), addProduct);
router.post('/bulk-upload', authenticate, requireRole('OWNER'), upload.single('file'), bulkUploadProducts);
router.get('/:barcode', authenticate, getProductByBarcode);

export default router;