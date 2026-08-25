import pool from '../config/db.js';

export async function getEmployees(req, res) {
  try {
    const storeId = req.user.storeId;

    const result = await pool.query(
      'SELECT user_id, user_name, email, role, store_id, created_at FROM user_account WHERE store_id = $1 AND role != $2 ORDER BY created_at DESC',
      [storeId, 'OWNER']
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
}
