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
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection failed:', err.message);
  } else {
    console.log('Database connected:', res.rows[0].now);
  }
});

export default pool;