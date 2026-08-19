
import {
  listAllSubscriptionsWithBillingStatus,
  markInvoicePaid,
} from '../models/billing.model.js';

// GET /admin/billing platform-wide view across every tenant.
export async function getAllBilling(req, res) {
  const subscriptions = await listAllSubscriptionsWithBillingStatus();
  res.json({ subscriptions });
}

// PATCH /admin/billing/invoices/:id/mark-paid records payment,
// auto-reactivates the subscription if this was the last overdue invoice.
export async function payInvoice(req, res) {
  try {
    const invoice = await markInvoicePaid(req.params.id);
    res.json({ invoice });
  } catch (err) {
    res.status(409).json({ error: err.message });
  }
}

// POST /admin/billing/:storeId/send-reminder — stub for now, matches
// the "Send payment reminder" modal. Real email sending
// (SendGrid/Nodemailer) is a TODO once that infrastructure exists this returns success so the frontend flow can be built/tested now.
export async function sendPaymentReminder(req, res) {
  // TODO: wire up an actual email service here.
  res.json({ message: `Reminder queued for store ${req.params.storeId}` });
}