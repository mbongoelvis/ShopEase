
import pool from '../config/db.js';

// Tenants create their own tickets store_id comes from whoever is logged in on the tenant side (an Owner reporting an issue).
export async function createTicket({ storeId, subject, description, priority }) {
  const result = await pool.query(
    `INSERT INTO support_ticket (store_id, subject, description, priority)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [storeId, subject, description, priority || 'MEDIUM']
  );
  return result.rows[0];
}

// Platform admin's view every ticket across every tenant, store name attached.
export async function listAllTickets() {
  const result = await pool.query(
    `SELECT t.*, s.store_name
     FROM support_ticket t
     JOIN store s ON t.store_id = s.store_id
     ORDER BY
       CASE t.priority WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END,
       t.created_at DESC`
  );
  return result.rows;
}

export async function updateTicketStatus(ticketId, newStatus) {
  // Two explicit query branches instead of interpolating a value into
  // the SQL string directly even though newStatus here isn't raw user
  // input (it's validated against the enum by Postgres itself), mixing
  // string interpolation into SQL is a habit worth NEVER reaching for,
  // so we keep both branches fully parameterized instead.
  const query = newStatus === 'RESOLVED'
    ? `UPDATE support_ticket SET status = $2, resolved_at = now() WHERE id = $1 RETURNING *`
    : `UPDATE support_ticket SET status = $2, resolved_at = NULL WHERE id = $1 RETURNING *`;

  const result = await pool.query(query, [ticketId, newStatus]);
  return result.rows[0];
}