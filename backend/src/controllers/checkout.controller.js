import { processCheckout } from '../services/checkout.service.js';
import { listSalesForStore, listItemsForTransaction } from '../models/sale.model.js';

// POST /checkout — Cashier-only (enforced by route middleware).
export async function checkout(req, res) {
  const { items, paymentMethod, customerName, customerPhone, discount, taxRate } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items must be a non-empty array' });
  }

  try {
    const result = await processCheckout({
      cashierId: req.user.userId,
      storeId: req.user.storeId,
      items,
      paymentMethod: paymentMethod || null,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      discount: Number(discount) || 0,
      taxRate: Number(taxRate) || 0,
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// GET /checkout/history — cashier sees their own sales for this store.
export async function getCheckoutHistory(req, res) {
  try {
    const period = req.query.period || 'month';
    const from = periodStart(period);
    const sales = await listSalesForStore({
      storeId: req.user.storeId,
      cashierId: req.user.userId,
      from,
    });

    const transactions = [];
    for (const sale of sales) {
      const lineItems = await listItemsForTransaction(sale.sale_id);
      transactions.push({
        ...sale,
        items: lineItems,
      });
    }

    res.json({ transactions });
  } catch (err) {
    console.error('Error fetching checkout history:', err);
    res.status(500).json({ error: 'Failed to fetch checkout history' });
  }
}

function periodStart(period) {
  const now = new Date();
  if (period === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    return start.toISOString();
  }
  if (period === 'yesterday') {
    const start = new Date(now);
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    return start.toISOString();
  }
  if (period === 'week') {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    return start.toISOString();
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  return start.toISOString();
}