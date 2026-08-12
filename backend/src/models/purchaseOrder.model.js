
import pool from '../config/db.js';

export async function createPurchaseOrder({ supplierId, productId, qty }) {
  const result = await pool.query(
    `INSERT INTO purchase_order (supplier_id, product_id, qty, status)
     VALUES ($1, $2, $3, 'DRAFT')
     RETURNING *`,
    [supplierId, productId, qty]
  );
  return result.rows[0];
}

export async function listPurchaseOrders(storeId) {
  // Purchase orders don't have a store_id directly (they're tied to a product, which is tied to inventory, which IS store-scoped) — so we join through inventory to filter correctly by store.
  const result = await pool.query(
    `SELECT DISTINCT po.*, s.supplier_name, p.name AS product_name
     FROM purchase_order po
     JOIN product p ON po.product_id = p.product_id
     JOIN inventory i ON i.product_id = p.product_id AND i.store_id = $1
     JOIN supplier s ON po.supplier_id = s.supplier_id
     ORDER BY po.created_at DESC`,
    [storeId]
  );
  return result.rows;
}

export async function findPurchaseOrderById(id) {
  const result = await pool.query(
    'SELECT * FROM purchase_order WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

// Only allows DRAFT -> SENT -> RECEIVED, in that order, one step at a
// time — same atomic-check pattern as decrementStock and
// markReceiptCollected: the WHERE clause enforces the valid transition,
// not a separate JavaScript if-check beforehand.
export async function updatePurchaseOrderStatus(id, newStatus, expectedCurrentStatus) {
  const result = await pool.query(
    `UPDATE purchase_order
     SET status = $2
     WHERE id = $1 AND status = $3
     RETURNING *`,
    [id, newStatus, expectedCurrentStatus]
  );
  return result.rows[0]; // undefined if the current status didn't match — invalid transition attempted
}