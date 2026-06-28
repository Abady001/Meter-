require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5433'),
  database: process.env.DB_NAME || 'meter_pulse',
  user: process.env.DB_USER || 'meter_pulse',
  password: process.env.DB_PASSWORD || 'meter_pulse_dev',
});

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'migrations', '001-initial.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('  ✓ Migration 001-initial.sql applied successfully');
  } catch (err) {
    console.error('  ✗ Migration failed:', err.message);
    process.exit(1);
  }
  await pool.end();
}

migrate();
