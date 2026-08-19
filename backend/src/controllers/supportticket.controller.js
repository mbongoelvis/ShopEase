
import { createTicket, listAllTickets, updateTicketStatus } from '../models/supportTicket.model.js';

// POST /support-tickets tenant-side, any logged-in tenant user can raise one.
export async function raiseTicket(req, res) {
  const { subject, description, priority } = req.body;
  if (!subject) {
    return res.status(400).json({ error: 'subject is required' });
  }
  const ticket = await createTicket({
    storeId: req.user.storeId,
    subject,
    description,
    priority,
  });
  res.status(201).json({ ticket });
}

// GET /admin/support-tickets platform admin's view, across all tenants.
export async function getAllTickets(req, res) {
  const tickets = await listAllTickets();
  res.json({ tickets });
}

// PATCH /admin/support-tickets/:id/status platform admin updates status.
export async function setTicketStatus(req, res) {
  const { status } = req.body;
  if (!['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
    return res.status(400).json({ error: 'status must be OPEN, IN_PROGRESS, or RESOLVED' });
  }
  const ticket = await updateTicketStatus(req.params.id, status);
  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' });
  }
  res.json({ ticket });
}