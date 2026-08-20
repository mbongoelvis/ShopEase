//table or class stroing all every receipt status
//contains an important query rather function tuching the database: markreceiptCollected()

import pool from '../config/db.js';

export async function createReceipt({ transactionId, qrCode }) {
  const result = await pool.query(
    `INSERT INTO receipt (transaction_id, qr_code, status)
     VALUES ($1, $2, 'PENDING')
     RETURNING *`,
    [transactionId, qrCode]
  );
  return result.rows[0];
}

export async function findReceiptByQrCode(qrCode) {
  const result = await pool.query(
    'SELECT * FROM receipt WHERE qr_code = $1',
    [qrCode]
  );
  return result.rows[0];
}

// THE critical query for fraud prevention. Only flips PENDING -> COLLECTED if it's CURRENTLY pending.
// This is the same atomic-check pattern as decrementStock in Feature 2, applied here to stop the exact race
// condition: two near-simultaneous scans of the same receipt must not both succeed.
export async function markReceiptCollected(qrCode, validatedBy) {
  const result = await pool.query(
    `UPDATE receipt
     SET status = 'COLLECTED', collected_at = now(), validated_by = $2
     WHERE qr_code = $1 AND status = 'PENDING'
     RETURNING *`,
    [qrCode, validatedBy]
  );
  return result.rows[0]; // undefined if it was already COLLECTED — caller must check this
}