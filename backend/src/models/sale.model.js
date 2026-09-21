
import pool from '../config/db.js';

export async function createSaleTransaction({ cashierId, storeId, total }) {
  const result = await pool.query(
    `INSERT INTO sale_transaction (cashier_id, store_id, total)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [cashierId, storeId, total]
  );
  return result.rows[0];
}

export async function createSaleItem({ transactionId, productId, qty, price }) {
  const result = await pool.query(
    `INSERT INTO sale_item (transaction_id, product_id, qty, price)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [transactionId, productId, qty, price]
  );
  return result.rows[0];
}

export async function findTransactionById(saleId) {
  const result = await pool.query(
    'SELECT * FROM sale_transaction WHERE sale_id = $1',
    [saleId]
  );
  return result.rows[0];
}

export async function listItemsForTransaction(transactionId) {
  const result = await pool.query(
    `SELECT si.*, p.name, p.barcode
     FROM sale_item si
     JOIN product p ON si.product_id = p.product_id
     WHERE si.transaction_id = $1`,
    [transactionId]
  );
  return result.rows;
}

export async function listSalesForStore({ storeId, cashierId = null, from = null }) {
  const params = [storeId];
  let where = 'st.store_id = $1';

  if (cashierId) {
    params.push(cashierId);
    where += ` AND st.cashier_id = $${params.length}`;
  }
  if (from) {
    params.push(from);
    where += ` AND st.timestamp >= $${params.length}`;
  }

  const result = await pool.query(
    `SELECT
       st.*,
       r.qr_code,
       r.status AS receipt_status,
       r.collected_at
     FROM sale_transaction st
     LEFT JOIN receipt r ON r.transaction_id = st.sale_id
     WHERE ${where}
     ORDER BY st.timestamp DESC
     LIMIT 200`,
    params
  );
  return result.rows;
}