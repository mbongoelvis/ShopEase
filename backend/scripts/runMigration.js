import fs from 'fs';
import path from 'path';
import pool from '../src/config/db.js';

const migrationsDir = path.join(process.cwd(), 'migrations');

async function runMigrations() {
  console.log('🔄 Running database migrations...');

  try {
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf-8');

        console.log(`📝 Running: ${file}`);
        await pool.query(sql);
        console.log(`✅ ${file} completed`);
      }
    }

    console.log('✅ All migrations completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigrations();
