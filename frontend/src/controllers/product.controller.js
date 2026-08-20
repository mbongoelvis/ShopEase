
import { createProductWithVariants } from '../services/product.service.js';
import { findProductByBarcode, listVariantsByParent, listProductsByStore } from '../models/product.model.js';
import { createInventoryRecord } from '../models/inventory.model.js';

// POST /products — creates a product, optionally with size/color variants.
export async function addProduct(req, res) {
  const { categoryId, barcode, name, sizes, colors, priceOverride } = req.body;

  if (!categoryId || !barcode || !name) {
    return res.status(400).json({ error: 'categoryId, barcode, and name are required' });
  }

  try {
    const result = await createProductWithVariants({
      categoryId,
      barcode,
      name,
      sizes,
      colors,
      priceOverride,
    });

     //Every product/variant needs a starting inventory row at the
    // creator's store, or checkout has nothing to decrement against.
    
    const allProducts = result.variants.length > 0 ? result.variants : [result.parent];
    for (const product of allProducts) {
      await createInventoryRecord({
        productId: product.product_id,
        storeId: req.user.storeId,
        quantity: 0, // starts at 0 — Stocker logs actual intake separately (Feature 5 / mobile app)
      });
    }
    res.status(201).json(result);
  } catch (err) {
    // e.g. category not found, or duplicate barcode — surface a clean 400,
    // not a raw 500 with a stack trace leaking to the client.
    res.status(400).json({ error: err.message });
  }
}

// GET /products — list all parent products for the logged-in user's store.
export async function listProducts(req, res) {
  const products = await listProductsByStore(req.user.storeId);
  res.json(products);
}

// GET /products/:barcode — used by the mobile app's "scan barcode" flow.
export async function getProductByBarcode(req, res) {
  const product = await findProductByBarcode(req.params.barcode);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // If this IS a parent product, include its variants too — useful so
  // the mobile app can show "pick a size" after a scan.
  const variants = await listVariantsByParent(product.product_id);
  res.json({ product, variants });
}