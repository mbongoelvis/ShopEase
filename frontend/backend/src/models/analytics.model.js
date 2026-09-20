
// These queries deliberately do the math IN SQL (SUM, COUNT, GROUP BY) its more efficient rather than fetching every row and calculating totals in JavaScript.
// For a store with thousands of transactions, pulling every row over the network just to add them up in Node would be slow and wasteful.
// the database is built to do this kind of aggregation efficiently.

import pool from '../config/db.js';

// Total revenue per month, for a given store, over the last N months.
export async function getMonthlyRevenue(storeId, months = 6) {
  const result = await pool.query(
    `SELECT
       date_trunc('month', timestamp) AS month,
       SUM(total) AS revenue,
       COUNT(*) AS transaction_count
     FROM sale_transaction
     WHERE store_id = $1
       AND timestamp >= now() - ($2 || ' months')::interval
     GROUP BY date_trunc('month', timestamp)
     ORDER BY month ASC`,
    [storeId, months]
  );
  return result.rows;
}

// Inventory turnover: how many units of each product sold, vs. how much is currently sitting in stock. A high "units sold" with LOW
// remaining quantity signals a fast-moving item worth reordering soon — this is what feeds the "predictive low-stock" feature.
export async function getInventoryTurnover(storeId) {
  const result = await pool.query(
    `SELECT
       p.product_id,
       p.name,
       p.barcode,
       COALESCE(SUM(si.qty), 0) AS units_sold,
       i.quantity AS current_stock
     FROM product p
     JOIN inventory i ON i.product_id = p.product_id AND i.store_id = $1
     LEFT JOIN sale_item si ON si.product_id = p.product_id
     LEFT JOIN sale_transaction st ON si.transaction_id = st.sale_id AND st.store_id = $1
     GROUP BY p.product_id, p.name, p.barcode, i.quantity
     ORDER BY units_sold DESC`,
    [storeId]
  );
  return result.rows;
}

// Employee security flags: which cashiers/guards have the most discrepancy_log entries against them — directly powers the "Discrepancy Log" dashboard. and the "flag a specific cashier for possible collusion".
export async function getEmployeeSecurityFlags(storeId) {
  const result = await pool.query(
    `SELECT
       u.user_id,
       u.user_name,
       u.role,
       COUNT(dl.id) AS discrepancy_count
     FROM user_account u
     JOIN discrepancy_log dl ON dl.scanned_by = u.user_id
     WHERE u.store_id = $1
     GROUP BY u.user_id, u.user_name, u.role
     HAVING COUNT(dl.id) > 0
     ORDER BY discrepancy_count DESC`,
    [storeId]
  );
  return result.rows;
}