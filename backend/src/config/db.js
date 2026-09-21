//This file createsa one time connection POOL to posgresql, which the rest of the app uses

import pkg from 'pg';
import dotenv from 'dotenv';

// Load variables from .env into process.env
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Confirms on startup that the DB is actually reachable
pool.query('SELECT NOW()', async (err, res) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    return;
  }

  console.log('Database connected:', res.rows[0].now);

  try {
    await pool.query(`
      ALTER TABLE sale_transaction
        ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
        ADD COLUMN IF NOT EXISTS customer_name TEXT,
        ADD COLUMN IF NOT EXISTS customer_phone TEXT,
        ADD COLUMN IF NOT EXISTS discount NUMERIC DEFAULT 0,
        ADD COLUMN IF NOT EXISTS tax NUMERIC DEFAULT 0
    `);
  } catch (migrateErr) {
    console.warn('Could not ensure sale_transaction checkout columns:', migrateErr.message);
  }
});

export default pool;