

import express from 'express';
import multer from 'multer';
import { bulkUploadProducts } from '../controllers/bulkUpload.controller.js';
import { addProduct, getProductByBarcode, listProducts, removeProduct, updateProductInventory } from '../controllers/product.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

// GET /products — lists all products for the tenant's store (Owner + Inventory Monitor)
router.get('/', authenticate, requireRole('OWNER', 'INVENTORY_MONITOR'), listProducts);

// Owner-only to create products (matches "Products" tab access in the tenant dashboard)
router.post('/', authenticate, requireRole('OWNER'), addProduct);

// memoryStorage: keeps the uploaded file in RAM as a Buffer instead of saving it to disk, fine for CSVs (small, one-time use), avoids the extra step of cleaning up temp files afterward.
const upload = multer({ storage: multer.memoryStorage() });

router.post('/bulk-upload', authenticate, requireRole('OWNER'), upload.single('file'), bulkUploadProducts);

// Owner-only to update inventory (top up stock)
router.patch('/:productId/inventory', authenticate, requireRole('OWNER'), updateProductInventory);

// Owner-only to delete products — MUST come before /:barcode to avoid route conflicts
router.delete('/:id', authenticate, requireRole('OWNER'), removeProduct);

// Any logged-in tenant role can look up a product by barcode —
// Cashier scanning at checkout, Stocker scanning intake, etc.
router.get('/:barcode', authenticate, getProductByBarcode);

export default router;