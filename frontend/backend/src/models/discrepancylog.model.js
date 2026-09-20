
import pool from '../config/db.js';


export async function logDuplicateScan({ receiptId, scannedBy }) {
  const result = await pool.query(
    `INSERT INTO discrepancy_log (receipt_id, scanned_by, reason)
     VALUES ($1, $2, 'DUPLICATE_SCAN')
     RETURNING *`,
    [receiptId, scannedBy]
  );
  return result.rows[0];
}

export async function listDiscrepanciesForStore(storeId) {
  const result = await pool.query(
    `SELECT dl.*, u.user_name AS scanned_by_name
     FROM discrepancy_log dl
     JOIN receipt r ON dl.receipt_id = r.receipt_id
     JOIN sale_transaction st ON r.transaction_id = st.sale_id
     LEFT JOIN user_account u ON dl.scanned_by = u.user_id
     WHERE st.store_id = $1
     ORDER BY dl.detected_at DESC`,
    [storeId]
  );
  return result.rows;
}