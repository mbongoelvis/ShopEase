
// "Receiving" a purchase order does two things atomically: increments
// stock, AND records exactly who confirmed it — the audit trail.
 
// If a Stocker mismarks or fabricates a receipt, this row is the permanent, unchangeable record of who did it and when. It doesn't prevent fraud on its own — nothing fully does — but it makes fraud traceable and attributable, which is the same principle behind your QR exit-scan
// you can't quietly get away with it, because there's always a record pointing back to exactly one person.

import pool from '../config/db.js';

export async function receivePurchaseOrder(purchaseOrderId, storeId, receivedByUserId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const poResult = await client.query(
      `UPDATE purchase_order
       SET status = 'RECEIVED', received_by = $2, received_at = now()
       WHERE id = $1 AND status = 'SENT'
       RETURNING *`,
      [purchaseOrderId, receivedByUserId]
    );
    const purchaseOrder = poResult.rows[0];

    if (!purchaseOrder) {
      throw new Error('Purchase order not found, or not in SENT status');
    }

    const stockResult = await client.query(
      `UPDATE inventory
       SET quantity = quantity + $1, updated_at = now()
       WHERE product_id = $2 AND store_id = $3
       RETURNING *`,
      [purchaseOrder.qty, purchaseOrder.product_id, storeId]
    );

    if (stockResult.rows.length === 0) {
      throw new Error('No matching inventory row found for this product at this store');
    }

    await client.query('COMMIT');
    return { purchaseOrder, updatedInventory: stockResult.rows[0] };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// For the Owner: "who received what, and when" — the actual audit view.
export async function listReceivedOrdersWithAuditTrail(storeId) {
  const result = await pool.query(
    `SELECT po.id, po.qty, po.received_at, s.supplier_name, p.name AS product_name,
            u.user_name AS received_by_name, u.role AS received_by_role
     FROM purchase_order po
     JOIN product p ON po.product_id = p.product_id
     JOIN inventory i ON i.product_id = p.product_id AND i.store_id = $1
     JOIN supplier s ON po.supplier_id = s.supplier_id
     LEFT JOIN user_account u ON po.received_by = u.user_id
     WHERE po.status = 'RECEIVED'
     ORDER BY po.received_at DESC`,
    [storeId]
  );
  return result.rows;
}