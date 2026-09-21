

import express from 'express';
import multer from 'multer';
import { bulkUploadProducts } from '../controllers/bulkUpload.controller.js';
import { addProduct, getProductByBarcode, listProducts, productDetails, removeProduct, updateProductInventory, changeProductPrice } from '../controllers/product.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

// GET /products — Owner, inventory monitor, and stocker (floor staff) need catalog + stock
router.get('/', authenticate, requireRole('OWNER', 'INVENTORY_MONITOR', 'STOCKER'), listProducts);

// Owner and stocker can create products from dashboard / mobile intake
router.post('/', authenticate, requireRole('OWNER', 'STOCKER'), addProduct);

// memoryStorage: keeps the uploaded file in RAM as a Buffer instead of saving it to disk, fine for CSVs (small, one-time use), avoids the extra step of cleaning up temp files afterward.
const upload = multer({ storage: multer.memoryStorage() });

router.post('/bulk-upload', authenticate, requireRole('OWNER', 'STOCKER'), upload.single('file'), bulkUploadProducts);

// Owner and stocker can top up stock
router.patch('/:productId/inventory', authenticate, requireRole('OWNER', 'STOCKER'), updateProductInventory);
router.patch('/:productId/price', authenticate, requireRole('OWNER'), changeProductPrice);

router.get('/details/:productId', authenticate, requireRole('OWNER', 'INVENTORY_MONITOR'), productDetails);

// Owner-only to delete products — MUST come before /:barcode to avoid route conflicts
router.delete('/:id', authenticate, requireRole('OWNER'), removeProduct);

// Any logged-in tenant role can look up a product by barcode —
// Cashier scanning at checkout, Stocker scanning intake, etc.
router.get('/:barcode', authenticate, getProductByBarcode);

export default router;