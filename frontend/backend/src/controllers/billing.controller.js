
import {
  listAllSubscriptionsWithBillingStatus,
  markInvoicePaid,
  getSubscriptionByStore,
  listInvoicesForStore,
  updatePreferredPaymentMethod,
  getPaymentMethods,
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
    const { paymentMethod } = req.body;
    const invoice = await markInvoicePaid(req.params.id, paymentMethod || 'PENDING');
    res.json({ invoice });
  } catch (err) {
    res.status(409).json({ error: err.message });
  }
}

// GET /billing/me — tenant's own subscription and invoices
export async function getTenantBilling(req, res) {
  try {
    const subscription = await getSubscriptionByStore(req.user.storeId);
    const invoices = await listInvoicesForStore(req.user.storeId);
    const paymentMethods = getPaymentMethods();
    res.json({
      subscription,
      invoices,
      paymentMethods,
    });
  } catch (err) {
    console.error('Error fetching billing info:', err);
    res.status(500).json({ error: 'Failed to fetch billing information' });
  }
}

// PATCH /billing/me/payment-method — tenant sets preferred payment method
export async function setPreferredPaymentMethod(req, res) {
  try {
    const { paymentMethod } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({ error: 'paymentMethod is required' });
    }

    const subscription = await getSubscriptionByStore(req.user.storeId);
    if (!subscription) {
      return res.status(404).json({ error: 'Subscription not found' });
    }

    const updated = await updatePreferredPaymentMethod(subscription.id, paymentMethod);
    res.json({ subscription: updated });
  } catch (err) {
    console.error('Error setting payment method:', err);
    res.status(500).json({ error: 'Failed to set payment method' });
  }
}

// GET /admin/billing/payment-methods — get all available payment methods
export async function getAvailablePaymentMethods(req, res) {
  try {
    const paymentMethods = getPaymentMethods();
    res.json({ paymentMethods });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
}

// POST /admin/billing/:storeId/send-reminder — stub for now, matches
// the "Send payment reminder" modal. Real email sending
// (SendGrid/Nodemailer) is a TODO once that infrastructure exists this returns success so the frontend flow can be built/tested now.
export async function sendPaymentReminder(req, res) {
  // TODO: wire up an actual email service here.
  res.json({ message: `Reminder queued for store ${req.params.storeId}` });
}
