// Checkout Write Operation - Tricky/Risky
// it touches THREE tables that must all succeed together or not at all:
//   1. sale_transaction (the sale record itself)
//   2. sale_item (one row per line item)
//   3. inventory (stock decremented for each item sold)

// If step 3 failed for one item after steps 1-2 already committed, you'd
// have a sale on record for stock that was never actually deducted —
// silent data corruption that's very hard to notice until your numbers
// don't add up weeks later. A DATABASE TRANSACTION prevents this: every
// query inside it either ALL succeed together, or ALL get undone
// together, as if none of it ever happened.

import pool from '../config/db.js';
import { signReceipt } from '../utils/hmac.util.js';

export async function processCheckout({
  cashierId,
  storeId,
  items,
  paymentMethod = null,
  customerName = null,
  customerPhone = null,
  discount = 0,
  taxRate = 0,
}) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let subtotal = 0;
    const lineItems = [];

    for (const { productId, qty } of items) {
      const productResult = await client.query(
        'SELECT price FROM product WHERE product_id = $1',
        [productId]
      );
      const product = productResult.rows[0];
      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }

      const stockResult = await client.query(
        `UPDATE inventory
         SET quantity = quantity - $1, updated_at = now()
         WHERE product_id = $2 AND store_id = $3 AND quantity >= $1
         RETURNING quantity`,
        [qty, productId, storeId]
      );

      if (stockResult.rows.length === 0) {
        throw new Error(`Insufficient stock for product ${productId}`);
      }

      const lineTotal = product.price * qty;
      subtotal += lineTotal;
      lineItems.push({ productId, qty, price: product.price });
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const tax = discountedSubtotal * taxRate;
    const total = discountedSubtotal + tax;

    // ...rest of the function (sale_transaction insert, sale_item inserts,
    // receipt, commit/rollback) stays exactly the same as your last version

    // Step 2: now that we know every item had enough stock, create the
    // actual transaction and its line items.
    const saleResult = await client.query(
      `INSERT INTO sale_transaction
         (cashier_id, store_id, total, payment_method, customer_name, customer_phone, discount, tax)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [cashierId, storeId, total, paymentMethod, customerName, customerPhone, discount, tax]
    );
    const sale = saleResult.rows[0];

    for (const item of lineItems) {
      await client.query(
        `INSERT INTO sale_item (transaction_id, product_id, qty, price)
         VALUES ($1, $2, $3, $4)`,
        [sale.sale_id, item.productId, item.qty, item.price]
      );
    }

    // Generate the receipt + QR signature INSIDE the same transaction.
    // If receipt creation somehow failed, we don't want a sale on record
    // with no valid receipt to prove it — same all-or-nothing guarantee
    // as the stock decrements above.
    const signature = signReceipt(sale.sale_id);
    const qrCode = `${sale.sale_id}.${signature}`; // the actual string encoded into the printed QR

    const receiptResult = await client.query(
      `INSERT INTO receipt (transaction_id, qr_code, status)
       VALUES ($1, $2, 'PENDING')
       RETURNING *`,
      [sale.sale_id, qrCode]
    );
    const receipt = receiptResult.rows[0];

    await client.query('COMMIT'); // everything above is now permanently saved, together
    return { sale, items: lineItems, total, receipt };

  } catch (err) {
    await client.query('ROLLBACK'); // undo everything from BEGIN — as if none of it happened
    throw err; // let the controller decide how to respond to the client
  } finally {
    client.release(); // always return the connection to the pool, success or failure
  }
}