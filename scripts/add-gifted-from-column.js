require('dotenv').config();
const { Pool } = require('pg');

// Create pool with same config as database.js
const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function addGiftedFromColumn() {
  try {
    console.log('Adding gifted_from column to card_inventory...');

    await pool.query(`
      ALTER TABLE card_inventory
      ADD COLUMN IF NOT EXISTS gifted_from TEXT
    `);

    console.log('✓ Column added successfully');

    // Create index for better query performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_card_inventory_gifted_from
      ON card_inventory(gifted_from)
    `);

    console.log('✓ Index created successfully');

    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error('Error adding column:', err.message);
    await pool.end();
    process.exit(1);
  }
}

addGiftedFromColumn();
