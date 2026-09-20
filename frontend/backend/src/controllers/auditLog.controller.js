import { listAuditLogs, getAuditLogCount, getAuditLogsByEntity } from '../models/auditLog.model.js';

// GET /audit-logs - Get audit logs for store (Owner only)
export async function getAuditLogs(req, res) {
  try {
    const storeId = req.user.storeId;
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    const logs = await listAuditLogs(storeId, limit, offset);
    const count = await getAuditLogCount(storeId);

    res.json({
      logs,
      total: count,
      limit,
      offset,
    });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
}

// GET /audit-logs/entity/:entityType/:entityId - Get audit history for specific entity
export async function getEntityAuditLogs(req, res) {
  try {
    const storeId = req.user.storeId;
    const { entityType, entityId } = req.params;

    const logs = await getAuditLogsByEntity(storeId, entityType, entityId);
    res.json(logs);
  } catch (err) {
    console.error('Error fetching entity audit logs:', err);
    res.status(500).json({ error: 'Failed to fetch entity audit logs' });
  }
}
