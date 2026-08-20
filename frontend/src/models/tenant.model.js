
// Unlike every model so far, these queries deliberately have NO store_id filter.
//  a platform admin is supposed to see across every tenant. This is the one place in the whole codebase where querying "all stores" is correct, not a bug.

import pool from '../config/db.js';

export async function listAllTenants() {
  const result = await pool.query(
    `SELECT
       s.store_id,
       s.store_name,
       s.store_address,
       COUNT(DISTINCT u.user_id) AS employee_count,
       s.created_at
     FROM store s
     LEFT JOIN user_account u ON u.store_id = s.store_id
     GROUP BY s.store_id
     ORDER BY s.created_at DESC`
  );
  return result.rows;
}

export async function getTenantDetail(storeId) {
  const storeResult = await pool.query('SELECT * FROM store WHERE store_id = $1', [storeId]);
  const store = storeResult.rows[0];
  if (!store) return null;

  const statsResult = await pool.query(
    `SELECT
       COUNT(DISTINCT u.user_id) AS employee_count,
       COUNT(DISTINCT st.sale_id) AS transaction_count_30d
     FROM store s
     LEFT JOIN user_account u ON u.store_id = s.store_id
     LEFT JOIN sale_transaction st ON st.store_id = s.store_id AND st.timestamp >= now() - interval '30 days'
     WHERE s.store_id = $1
     GROUP BY s.store_id`,
    [storeId]
  );

  return { ...store, ...statsResult.rows[0] };
}

// Platform-wide numbers — deliberately aggregated across ALL stores, this is the "fraud attempts blocked across every tenant".
export async function getPlatformAnalytics() {
  const result = await pool.query(
    `SELECT
       (SELECT COUNT(*) FROM store) AS total_tenants,
       (SELECT COUNT(*) FROM sale_transaction WHERE timestamp >= now() - interval '30 days') AS transactions_30d,
       (SELECT COUNT(*) FROM discrepancy_log WHERE detected_at >= now() - interval '30 days') AS fraud_attempts_blocked_30d`
  );
  return result.rows[0];
}