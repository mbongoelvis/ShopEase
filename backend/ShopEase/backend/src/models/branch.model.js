import pool from '../config/db.js';

// Create a new branch
export async function createBranch(storeId, branchName, branchAddress, isSettingUp = false) {
  const result = await pool.query(
    `INSERT INTO store (store_name, store_address, is_setting_up)
     VALUES ($1, $2, $3)
     RETURNING store_id, store_name as name, store_address as address, is_setting_up as isSettingUp, created_at`,
    [branchName, branchAddress, isSettingUp]
  );
  return result.rows[0];
}

// Get all branches for a store (with employee count and stock health calculated)
export async function listBranches(storeId) {
  const result = await pool.query(
    `SELECT
       s.store_id as id,
       s.store_name as name,
       s.store_address as address,
       s.is_setting_up as isSettingUp,
       s.created_at,
       COALESCE(COUNT(DISTINCT u.user_id), 0) as employeesCount,
       EXTRACT(YEAR FROM s.created_at)::INTEGER as openedYear
     FROM store s
     LEFT JOIN user_account u ON u.store_id = s.store_id AND u.role != $1
     WHERE s.store_id = $2 OR s.store_id IN (
       SELECT store_id FROM store WHERE store_id != $2 LIMIT 100
     )
     GROUP BY s.store_id
     ORDER BY s.created_at DESC`,
    ['OWNER', storeId]
  );

  // Calculate stock health for each branch
  const branchesWithHealth = await Promise.all(
    result.rows.map(async (branch) => {
      const healthResult = await pool.query(
        `SELECT
           COUNT(CASE WHEN i.quantity > 5 THEN 1 END) as healthy,
           COUNT(CASE WHEN i.quantity > 0 AND i.quantity <= 5 THEN 1 END) as low,
           COUNT(CASE WHEN i.quantity = 0 THEN 1 END) as outOfStock
         FROM inventory i
         WHERE i.store_id = $1`,
        [branch.id]
      );

      const health = healthResult.rows[0];
      const totalProducts = parseInt(health.healthy) + parseInt(health.low) + parseInt(health.outOfStock);

      let stockHealth = 'Good';
      if (totalProducts > 0 && parseInt(health.outOfStock) > totalProducts * 0.3) {
        stockHealth = 'low';
      } else if (totalProducts > 0 && parseInt(health.low) > totalProducts * 0.2) {
        stockHealth = 'Fair';
      }

      return { ...branch, stockHealth };
    })
  );

  return branchesWithHealth;
}

// Update branch info
export async function updateBranch(branchId, branchName, branchAddress, isSettingUp) {
  const result = await pool.query(
    `UPDATE store
     SET store_name = $1, store_address = $2, is_setting_up = $3
     WHERE store_id = $4
     RETURNING store_id as id, store_name as name, store_address as address, is_setting_up as isSettingUp`,
    [branchName, branchAddress, isSettingUp, branchId]
  );
  return result.rows[0];
}

// Delete branch
export async function deleteBranch(branchId) {
  const result = await pool.query(
    `DELETE FROM store WHERE store_id = $1
     RETURNING store_id`,
    [branchId]
  );
  return result.rows[0];
}
