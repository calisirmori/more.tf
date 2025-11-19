const { Pool } = require('pg');

const pool = new Pool({
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
  // Connection pool configuration to prevent exhaustion
  // db.t3.micro has ~87 max connections, we use 15 to leave headroom for:
  // - AWS RDS monitoring connections
  // - Manual admin connections
  // - Other service connections
  // - Autovacuum workers (critical for DB health)
  max: 15, // Reduced from 20 to prevent connection exhaustion
  min: 2, // Minimum number of clients (keeps connections warm)

  // Connection timeouts - more aggressive to prevent leaks
  connectionTimeoutMillis: 3000, // Reduced from 5s to 3s - fail fast if pool exhausted
  idleTimeoutMillis: 20000, // Reduced from 30s to 20s - return idle connections faster

  // Query timeout
  // Prevent queries from running indefinitely and blocking connections
  statement_timeout: 30000, // Reduced from 60s to 30s - prevent long-running queries

  // Connection testing and health checks
  allowExitOnIdle: true, // Allow Node.js to exit if pool is idle

  // Enable keep-alive to detect dead connections
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
});

// Pool event handlers for monitoring
pool.on('connect', () => {
  const stats = {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };
  console.log('Database connection established', stats);
});

pool.on('acquire', () => {
  // Track active connections (uncomment for debugging)
  // const stats = {
  //   total: pool.totalCount,
  //   idle: pool.idleCount,
  //   waiting: pool.waitingCount,
  // };
  // console.log('Client acquired from pool', stats);
});

pool.on('remove', () => {
  const stats = {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };
  console.log('Database connection removed from pool', stats);
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
  // Log additional context for debugging
  const stats = {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  };
  console.error('Pool state at error:', stats);
  // Don't exit the process, let the pool recover
});

// Log pool statistics every 60 seconds (only in production)
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    const stats = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
      max: 15,
    };
    // Only log if we're using more than 50% of pool capacity or have waiting clients
    if (pool.totalCount > 7 || pool.waitingCount > 0) {
      console.log('Database pool status (high usage):', stats);
    }
  }, 60000); // Every 60 seconds
}

// Helper function for safe query execution with automatic connection release
pool.safeQuery = async function (text, params) {
  const client = await this.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } catch (err) {
    console.error('Query error:', err.message);
    throw err;
  } finally {
    client.release();
  }
};

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing database pool...');
  await pool.end();
  console.log('Database pool closed');
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing database pool...');
  await pool.end();
  console.log('Database pool closed');
  process.exit(0);
});

module.exports = pool;
