 
import pool from '../config/db.js';
 
export async function createCategory({ name, basePrice, taxRate }) {
  const result = await pool.query(
    `INSERT INTO category (name, base_price, tax_rate)
     VALUES ($1, $2, $3)
     RETURNING categ_id, name, base_price, tax_rate`,
    [name, basePrice, taxRate]
  );
  return result.rows[0];
}
 
export async function findCategoryById(categId) {
  const result = await pool.query(
    'SELECT * FROM category WHERE categ_id = $1',
    [categId]
  );
  return result.rows[0];
}
 
export async function listCategories() {
  const result = await pool.query('SELECT * FROM category ORDER BY name');
  return result.rows;
}