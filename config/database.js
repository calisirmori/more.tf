const { Pool } = require('pg');

const pool = new Pool({
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false
  },
});

module.exports = pool;
