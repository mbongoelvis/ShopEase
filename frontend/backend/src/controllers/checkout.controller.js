
import { processCheckout } from '../services/checkout.service.js';

// POST /checkout — Cashier-only (enforced by route middleware).
export async function checkout(req, res) {
  const { items } = req.body; // [{ productId, qty }, ...]

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items must be a non-empty array' });
  }

  try {
    const result = await processCheckout({
      cashierId: req.user.userId,   // taken from the token, never trusted from the request body
      storeId: req.user.storeId,    // same — a Cashier can only sell for their OWN store
      items,
    });
    res.status(201).json(result);
  } catch (err) {
    // Insufficient stock, product not found, etc. — all surfaced as a
    // clean 400 rather than a raw 500 with an internal stack trace.
    res.status(400).json({ error: err.message });
  }
}