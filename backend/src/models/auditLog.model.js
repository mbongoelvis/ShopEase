import pool from '../config/db.js';

// Log an action to audit_log table
export async function createAuditLog({ userId, storeId, action, entityType, entityId, entityName, status, details }) {
  try {
    const result = await pool.query(
      `INSERT INTO audit_log (user_id, store_id, action, entity_type, entity_id, entity_name, status, details, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
       RETURNING *`,
      [userId, storeId, action, entityType, entityId, entityName, status, JSON.stringify(details || {})]
    );
    return result.rows[0];
  } catch (err) {
    console.error('Error creating audit log:', err);
    // Don't throw - logging shouldn't break the main operation
  }
}

// Get audit logs for a store (Owner only)
export async function listAuditLogs(storeId, limit = 100, offset = 0) {
  try {
    const result = await pool.query(
      `SELECT
         al.audit_id,
         al.user_id,
         u.user_name,
         al.action,
         al.entity_type,
         al.entity_id,
         al.entity_name,
         al.status,
         al.details,
         al.created_at
       FROM audit_log al
       LEFT JOIN user_account u ON al.user_id = u.user_id
       WHERE al.store_id = $1
       ORDER BY al.created_at DESC
       LIMIT $2 OFFSET $3`,
      [storeId, limit, offset]
    );
    return result.rows;
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    throw err;
  }
}

// Get audit log count for a store
export async function getAuditLogCount(storeId) {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM audit_log WHERE store_id = $1',
      [storeId]
    );
    return parseInt(result.rows[0].count);
  } catch (err) {
    console.error('Error getting audit log count:', err);
    return 0;
  }
}

// Get audit logs for a specific entity
export async function getAuditLogsByEntity(storeId, entityType, entityId) {
  try {
    const result = await pool.query(
      `SELECT
         al.audit_id,
         al.user_id,
         u.user_name,
         al.action,
         al.entity_type,
         al.entity_id,
         al.entity_name,
         al.status,
         al.details,
         al.created_at
       FROM audit_log al
       LEFT JOIN user_account u ON al.user_id = u.user_id
       WHERE al.store_id = $1 AND al.entity_type = $2 AND al.entity_id = $3
       ORDER BY al.created_at DESC`,
      [storeId, entityType, entityId]
    );
    return result.rows;
  } catch (err) {
    console.error('Error fetching entity audit logs:', err);
    throw err;
  }
}
