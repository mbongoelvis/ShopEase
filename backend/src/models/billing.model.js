
import pool from '../config/db.js';

export async function getSubscriptionByStore(storeId) {
  const result = await pool.query(
    'SELECT * FROM subscription WHERE store_id = $1',
    [storeId]
  );
  return result.rows[0];
}

export async function listInvoicesForStore(storeId) {
  const result = await pool.query(
    `SELECT i.*
     FROM invoice i
     JOIN subscription s ON i.subscription_id = s.id
     WHERE s.store_id = $1
     ORDER BY i.billed_at DESC`,
    [storeId]
  );
  return result.rows;
}

// Cross-tenant view for the platform admin's Billing tab every subscription, with the store name attached, and how many invoices are currently overdue for each.
export async function listAllSubscriptionsWithBillingStatus() {
  const result = await pool.query(
    `SELECT
       s.store_id,
       st.store_name,
       s.plan_name,
       s.monthly_price,
       s.status,
       COUNT(i.id) FILTER (WHERE i.status = 'OVERDUE') AS overdue_invoice_count
     FROM subscription s
     JOIN store st ON s.store_id = st.store_id
     LEFT JOIN invoice i ON i.subscription_id = s.id
     GROUP BY s.id, st.store_name
     ORDER BY overdue_invoice_count DESC`
  );
  return result.rows;
}

// Marking an invoice paid isn't just a status flip — if this was the
// tenant's only overdue invoice, the subscription itself should also
// flip back to ACTIVE. Same "keep two related things in sync" reasoning
// as the checkout/inventory pattern, so this runs as one transaction.
export async function markInvoicePaid(invoiceId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const invoiceResult = await client.query(
      `UPDATE invoice SET status = 'PAID', paid_at = now()
       WHERE id = $1 AND status = 'OVERDUE'
       RETURNING *`,
      [invoiceId]
    );
    const invoice = invoiceResult.rows[0];
    if (!invoice) {
      throw new Error('Invoice not found, or already paid');
    }

    const remainingOverdue = await client.query(
      `SELECT COUNT(*) FROM invoice WHERE subscription_id = $1 AND status = 'OVERDUE'`,
      [invoice.subscription_id]
    );

    if (parseInt(remainingOverdue.rows[0].count, 10) === 0) {
      await client.query(
        `UPDATE subscription SET status = 'ACTIVE' WHERE id = $1`,
        [invoice.subscription_id]
      );
    }

    await client.query('COMMIT');
    return invoice;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}