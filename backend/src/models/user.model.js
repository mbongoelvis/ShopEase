//This file contains functions which can talk to only one table, controllers call the functions.
//This file is responsible for every database query that touches the user_account table
 
import pool from '../config/db.js';
 
// Finds one user by email — used during login to check if the account exists.
export async function findUserByEmail(email) {
  const result = await pool.query(
    'SELECT * FROM user_account WHERE email = $1',
    [email]
  );
  return result.rows[0]; // undefined if no match — the controller decides what that means
}
 
// Creates a new user — used when an Owner adds an employee.
export async function createUser({ name, email, passwordHash, role, storeId }) {
  const result = await pool.query(
    `INSERT INTO user_account (user_name, email, password_hash, role, store_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING user_id, user_name, email, role, store_id, created_at`,
    [name, email, passwordHash, role, storeId]
  );
  return result.rows[0];
}

// How we find users — useful later for "get my own profile" endpoints.
export async function findUserById(userId) {
  const result = await pool.query(
    'SELECT user_id, user_name, email, role, store_id, created_at FROM user_account WHERE user_id = $1',
    [userId]
  );
  return result.rows[0];
}