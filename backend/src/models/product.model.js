
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