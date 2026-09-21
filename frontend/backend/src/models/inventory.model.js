//This file contains the table which tracks actual stock couns per product per branch (Creates the initial stock row for a product at a specific store)

// Creates the initial stock row for a product at a specific store. the quantity starts at 0.
import pool from '../config/db.js';

export async function createInventoryRecord({ productId, storeId, quantity = 0, location = null }) {
  const result = await pool.query(
    `INSERT INTO inventory (product_id, store_id, quantity, location)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [productId, storeId, quantity, location]
  );
  return result.rows[0];
}

export async function findInventory(productId, storeId) {
  const result = await pool.query(
    'SELECT * FROM inventory WHERE product_id = $1 AND store_id = $2',
    [productId, storeId]
  );
  return result.rows[0];
}

// Atomically reduces stock by `qty` — used at checkout. The WHERE clause checking quantity >= qty is deliberate: it stops stock from ever going negative & stops two near-simultaneous sales from both succeeding when only one item is actually left (the same race-condition concern.

//only the first one to reach the database actually succeeds; the second one's WHERE clause simply won't match (since quantity already dropped below what's needed).

export async function decrementStock(productId, storeId, qty) {
  const result = await pool.query(
    `UPDATE inventory
     SET quantity = quantity - $1, updated_at = now()
     WHERE product_id = $2 AND store_id = $3 AND quantity >= $1
     RETURNING *`,
    [qty, productId, storeId]
  );
  return result.rows[0]; // undefined if there wasn't enough stock — caller must check this
}

export async function listLowStock(storeId, threshold = 5) {
  const result = await pool.query(
    `SELECT i.*, p.name, p.barcode
     FROM inventory i
     JOIN product p ON i.product_id = p.product_id
     WHERE i.store_id = $1 AND i.quantity <= $2
     ORDER BY i.quantity ASC`,
    [storeId, threshold]
  );
  return result.rows;
}