
import pool from '../config/db.js';
 
// Creates ONE product row. Used both for a standalone product (no
// variants) and internally by createProductWithVariants below, once
// per size/color combination.
export async function createProduct({ categoryId, parentId = null, barcode, name, variantAttrs = null, price = null }) {
  const result = await pool.query(
    `INSERT INTO product (category_id, parent_id, barcode, name, variant_attrs, price)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [categoryId, parentId, barcode, name, variantAttrs, price]
  );
  return result.rows[0];
}
 
export async function findProductByBarcode(barcode) {
  const result = await pool.query(
    'SELECT * FROM product WHERE barcode = $1',
    [barcode]
  );
  return result.rows[0];
}
 
export async function findProductById(productId) {
  const result = await pool.query(
    'SELECT * FROM product WHERE product_id = $1',
    [productId]
  );
  return result.rows[0];
}
 
// Finds every variant that belongs to a given parent product.
export async function listVariantsByParent(parentId) {
  const result = await pool.query(
    'SELECT * FROM product WHERE parent_id = $1',
    [parentId]
  );
  return result.rows;
}

// Lists all products for the tenant's store with category names and stock info
export async function listProductsByStore(storeId) {
  const result = await pool.query(
    `SELECT
       p.product_id,
       p.name,
       p.price,
       c.name as category_name,
       COALESCE(i.quantity, 0) as stock
     FROM product p
     LEFT JOIN category c ON p.category_id = c.categ_id
     LEFT JOIN inventory i ON p.product_id = i.product_id AND i.store_id = $1
     WHERE p.parent_id IS NULL
     ORDER BY p.created_at DESC`,
    [storeId]
  );
  return result.rows;
}

// Deletes a product and its variants, along with related records
export async function deleteProduct(productId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Find all variants (children) of this product
    const variantsResult = await client.query(
      'SELECT product_id FROM product WHERE parent_id = $1',
      [productId]
    );
    const variants = variantsResult.rows;
    const allProductIds = [productId, ...variants.map(v => v.product_id)];

    // Delete purchase orders that reference this product or its variants
    await client.query(
      'DELETE FROM purchase_order WHERE product_id = ANY($1)',
      [allProductIds]
    );

    // Delete inventory records for all variants
    for (const variant of variants) {
      await client.query(
        'DELETE FROM inventory WHERE product_id = $1',
        [variant.product_id]
      );
    }

    // Delete all variants
    await client.query(
      'DELETE FROM product WHERE parent_id = $1',
      [productId]
    );

    // Delete inventory records for the parent product
    await client.query(
      'DELETE FROM inventory WHERE product_id = $1',
      [productId]
    );

    // Delete the parent product itself
    const result = await client.query(
      'DELETE FROM product WHERE product_id = $1 RETURNING *',
      [productId]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}