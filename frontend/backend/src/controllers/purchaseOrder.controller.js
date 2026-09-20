
import { createPurchaseOrder, listPurchaseOrders, updatePurchaseOrderStatus } from '../models/purchaseOrder.model.js';
import { receivePurchaseOrder, listReceivedOrdersWithAuditTrail } from '../services/purchaseOrder.service.js';

export async function addPurchaseOrder(req, res) {
  const { supplierId, productId, qty } = req.body;
  if (!supplierId || !productId || !qty) {
    return res.status(400).json({ error: 'supplierId, productId, and qty are required' });
  }
  const po = await createPurchaseOrder({ supplierId, productId, qty });
  res.status(201).json({ purchaseOrder: po });
}

export async function getPurchaseOrders(req, res) {
  const orders = await listPurchaseOrders(req.user.storeId);
  res.json({ purchaseOrders: orders });
}

// PATCH /purchase-orders/:id/send — DRAFT -> SENT (simple, no inventory change)
export async function sendPurchaseOrder(req, res) {
  const updated = await updatePurchaseOrderStatus(req.params.id, 'SENT', 'DRAFT');
  if (!updated) {
    return res.status(409).json({ error: 'Purchase order not found, or not in DRAFT status' });
  }
  res.json({ purchaseOrder: updated });
}

// PATCH /purchase-orders/:id/receive — SENT -> RECEIVED, increments stock.
// req.user.userId is recorded as WHO received it — this is the audit
// trail, not just a permission check. Open to Stocker since they're
// realistically the one physically present at the delivery.
export async function receivePurchaseOrderHandler(req, res) {
  try {
    const result = await receivePurchaseOrder(req.params.id, req.user.storeId, req.user.userId);
    res.json(result);
  } catch (err) {
    res.status(409).json({ error: err.message });
  }
}

// GET /purchase-orders/audit-trail — Owner-only: "who received what, when"
export async function getAuditTrail(req, res) {
  const trail = await listReceivedOrdersWithAuditTrail(req.user.storeId);
  res.json({ auditTrail: trail });
}