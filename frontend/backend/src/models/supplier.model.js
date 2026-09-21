
import pool from '../config/db.js';

export async function createSupplier({ name, contact }) {
  const result = await pool.query(
    `INSERT INTO supplier (supplier_name, contact)
     VALUES ($1, $2)
     RETURNING *`,
    [name, contact]
  );
  return result.rows[0];
}

export async function listSuppliers() {
  const result = await pool.query('SELECT * FROM supplier ORDER BY supplier_name');
  return result.rows;
}

export async function findSupplierById(supplierId) {
  const result = await pool.query(
    'SELECT * FROM supplier WHERE supplier_id = $1',
    [supplierId]
  );
  return result.rows[0];
}