
import { createProductWithVariants } from '../services/product.service.js';
import { findProductByBarcode, listVariantsByParent, listProductsByStore, deleteProduct } from '../models/product.model.js';
import { createInventoryRecord } from '../models/inventory.model.js';
import { createAuditLog } from '../models/auditLog.model.js';
import pool from '../config/db.js';

// POST /products — creates a product, optionally with size/color variants.
export async function addProduct(req, res) {
  const { categoryId, barcode, name, sizes, colors, priceOverride, supplierName } = req.body;

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

    // If supplier name provided, create supplier and link via purchase order
    if (supplierName && supplierName.trim()) {
      try {
        // Create supplier if it doesn't exist
        const supplierResult = await pool.query(
          'INSERT INTO supplier (supplier_name, contact) VALUES ($1, $2) ON CONFLICT (supplier_name) DO UPDATE SET supplier_name = $1 RETURNING supplier_id, supplier_name',
          [supplierName.trim(), '']
        );
        const supplier = supplierResult.rows[0];

        // Create purchase order linking product to supplier
        const parentProduct = result.parent;
        await pool.query(
          'INSERT INTO purchase_order (supplier_id, product_id, qty, status) VALUES ($1, $2, $3, $4)',
          [supplier.supplier_id, parentProduct.product_id, 0, 'pending']
        );
      } catch (supplierErr) {
        console.warn('Warning: Could not create supplier link:', supplierErr.message);
        // Don't fail the product creation if supplier linking fails
      }
    }

    // Log audit entry
    await createAuditLog({
      userId: req.user.userId,
      storeId: req.user.storeId,
      action: 'CREATE',
      entityType: 'PRODUCT',
      entityId: result.parent.product_id,
      entityName: name,
      status: 'SUCCESS',
      details: { barcode, categoryId, supplierName, variantCount: result.variants.length }
    });

    res.status(201).json(result);
  } catch (err) {
    // e.g. category not found, or duplicate barcode — surface a clean 400,
    // not a raw 500 with a stack trace leaking to the client.
    res.status(400).json({ error: err.message });
  }
}

// GET /products — lists all products for the tenant's store
export async function listProducts(req, res) {
  try {
    const products = await listProductsByStore(req.user.storeId);
    res.json(products);
  } catch (err) {
    console.error('Error listing products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
}

// DELETE /products/:id — deletes a product and its variants from the database
export async function removeProduct(req, res) {
  try {
    const productId = req.params.id;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const deleted = await deleteProduct(productId);

    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Log successful deletion
    await createAuditLog({
      userId: req.user.userId,
      storeId: req.user.storeId,
      action: 'DELETE',
      entityType: 'PRODUCT',
      entityId: productId,
      entityName: deleted.name,
      status: 'SUCCESS',
      details: { productId }
    });

    res.json({ message: 'Product deleted successfully', product: deleted });
  } catch (err) {
    console.error('Error deleting product:', err.message, err);

    // Log failed deletion attempt
    await createAuditLog({
      userId: req.user.userId,
      storeId: req.user.storeId,
      action: 'DELETE',
      entityType: 'PRODUCT',
      entityId: productId,
      entityName: 'Unknown',
      status: 'FAILED',
      details: { error: err.message }
    });

    res.status(500).json({ error: err.message || 'Failed to delete product' });
  }
}

// PATCH /products/:id/inventory — Update product inventory (Owner only)
export async function updateProductInventory(req, res) {
  const { productId } = req.params;
  const { quantity, action } = req.body; // action: 'set' (set to exact), 'add' (increase), 'subtract' (decrease)
  const storeId = req.user.storeId;

  if (!productId || quantity === undefined || !action) {
    return res.status(400).json({ error: 'productId, quantity, and action are required' });
  }

  try {
    let newQuantity;

    if (action === 'set') {
      newQuantity = quantity;
    } else if (action === 'add') {
      const currentResult = await pool.query(
        'SELECT quantity FROM inventory WHERE product_id = $1 AND store_id = $2',
        [productId, storeId]
      );
      const current = currentResult.rows[0]?.quantity || 0;
      newQuantity = current + quantity;
    } else if (action === 'subtract') {
      const currentResult = await pool.query(
        'SELECT quantity FROM inventory WHERE product_id = $1 AND store_id = $2',
        [productId, storeId]
      );
      const current = currentResult.rows[0]?.quantity || 0;
      newQuantity = Math.max(0, current - quantity);
    } else {
      return res.status(400).json({ error: 'Invalid action. Use: set, add, or subtract' });
    }

    const result = await pool.query(
      'UPDATE inventory SET quantity = $1 WHERE product_id = $2 AND store_id = $3 RETURNING *',
      [newQuantity, productId, storeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product inventory not found' });
    }

    // Log audit entry
    await createAuditLog({
      userId: req.user.userId,
      storeId: req.user.storeId,
      action: 'INVENTORY_UPDATE',
      entityType: 'PRODUCT',
      entityId: productId,
      entityName: 'Unknown',
      status: 'SUCCESS',
      details: { previousQuantity: result.rows[0].quantity, newQuantity, action }
    });

    res.json({
      message: 'Inventory updated successfully',
      inventory: result.rows[0],
      newQuantity
    });
  } catch (err) {
    console.error('Error updating inventory:', err);
    res.status(500).json({ error: err.message || 'Failed to update inventory' });
  }
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