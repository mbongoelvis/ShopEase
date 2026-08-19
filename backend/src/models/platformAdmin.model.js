
import pool from '../config/db.js';

export async function findAdminByEmail(email) {
  const result = await pool.query(
    'SELECT * FROM platform_admin WHERE email = $1',
    [email]
  );
  return result.rows[0];
}

export async function createAdmin({ name, email, passwordHash }) {
  const result = await pool.query(
    `INSERT INTO platform_admin (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING admin_id, name, email, created_at`,
    [name, email, passwordHash]
  );
  return result.rows[0];
}