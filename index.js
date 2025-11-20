const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const { RedisStore } = require('connect-redis');
const redis = require('redis');
const passportSteam = require('passport-steam');
const SteamStrategy = passportSteam.Strategy;
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// Load environment variables
require('dotenv').config();

// Import utilities and configuration
const logger = require('./utils/logger');
const pool = require('./config/database');
const requestLogger = require('./middleware/requestLogger');
const { errorHandler } = require('./middleware/errorHandler');
const RedisCache = require('./utils/redisCache');
const seasonCache = require('./utils/seasonCache');

// Import routes
const apiRoutes = require('./routes/api');
const { setRedisCache: setV2LogRedisCache } = require('./routes/v2/log');

// Server configuration
const port = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Global error handlers to prevent server crashes
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception - Server continuing', {
    error: err.message,
    stack: err.stack,
  });
  // Don't exit - let the server continue running
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection - Server continuing', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    promise: promise,
  });
  // Don't exit - let the server continue running
});

// Redis client configuration
let redisClient;
let sessionStore;
let server;

if (process.env.REDIS_HOST) {
  // Initialize Redis client with reconnection strategy
  redisClient = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT || 6379,
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          logger.error('Redis reconnection failed after 10 attempts');
          return new Error('Redis reconnection limit reached');
        }
        const delay = Math.min(retries * 100, 3000);
        logger.warn(`Redis reconnecting in ${delay}ms (attempt ${retries})`);
        return delay;
      },
    },
    password: process.env.REDIS_PASSWORD || undefined,
  });

  redisClient.on('error', (err) => {
    logger.error('Redis Client Error', { error: err.message });
    // Don't crash - Redis errors are handled gracefully
  });

  redisClient.on('connect', () => logger.info('Redis Client Connected'));

  redisClient.on('reconnecting', () => {
    logger.warn('Redis Client Reconnecting...');
  });

  redisClient.on('ready', () => {
    logger.info('Redis Client Ready');
  });

  // Connect to Redis (non-blocking)
  redisClient
    .connect()
    .then(() => {
      logger.info('Redis Client Connected Successfully');
      // Initialize Redis session store only after successful connection
      sessionStore = new RedisStore({ client: redisClient });
      logger.info('Using Redis session store');

      // Initialize Redis cache for season data
      const redisCacheInstance = new RedisCache(redisClient);
      seasonCache.setRedisCache(redisCacheInstance);
      logger.info('Season cache initialized with Redis (24-hour TTL)');

      // Initialize Redis cache for parser v2
      setV2LogRedisCache(redisCacheInstance);
      logger.info('Parser V2 cache initialized with Redis (7-day TTL)');
    })
    .catch((err) => {
      logger.error('Failed to connect to Redis', { error: err.message });
      logger.warn(
        'Continuing without Redis - sessions will use memory store (not recommended for production)'
      );
      sessionStore = undefined; // Use memory store
    });
} else {
  logger.warn(
    'No Redis configuration found, using memory store (not recommended for production)'
  );
  sessionStore = undefined; // Will use default memory store
}

// Trust proxy (required for cookies to work behind CloudFlare)
app.set('trust proxy', 1);

// Middleware setup
app.use(bodyParser.json());
app.use(express.json());
app.use(
  cors({
    origin: isProduction ? 'https://more.tf' : 'http://localhost:5173',
    credentials: true,
  })
);
app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || 'Whatever_You_Want',
    saveUninitialized: false, // Don't save empty sessions
    resave: false, // Don't save session if unmodified
    rolling: true, // Reset maxAge on every response to keep active users logged in
    proxy: isProduction, // Trust the reverse proxy (CloudFlare)
    cookie: {
      secure: isProduction, // Only use secure cookies in production (HTTPS)
      httpOnly: true, // Prevent XSS attacks
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      sameSite: isProduction ? 'lax' : 'lax', // Lax mode for OAuth compatibility
      // No domain setting - let browser use default (current host only)
      path: '/', // Cookie available for all paths
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

// CORS headers
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', isProduction ? 'https://more.tf' : 'http://localhost:5173');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

// Request logging middleware
app.use(requestLogger);

// Session debugging middleware (only log important session events)
app.use((req, res, next) => {
  if (req.session && req.isAuthenticated && req.isAuthenticated()) {
    // Only log session info for authenticated users on specific paths
    const importantPaths = ['/api/auth/steam/return', '/api/logout', '/api/me'];
    if (importantPaths.some(path => req.path.startsWith(path))) {
      logger.debug('Session info', {
        path: req.path,
        sessionId: req.sessionID,
        authenticated: req.isAuthenticated(),
        userId: req.user?.id,
        cookie: {
          maxAge: req.session.cookie.maxAge,
          expires: req.session.cookie.expires,
          secure: req.session.cookie.secure,
          httpOnly: req.session.cookie.httpOnly,
          domain: req.session.cookie.domain,
          sameSite: req.session.cookie.sameSite,
        },
      });
    }
  }
  next();
});

// Clear old userid cookies (force re-login after auth migration)
app.use((req, res, next) => {
  if (req.cookies.userid && !req.isAuthenticated()) {
    res.clearCookie('userid', {
      httpOnly: false,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax',
    });
  }
  next();
});

// Passport configuration
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Use localhost for development, production URL otherwise
const baseURL = isProduction ? 'https://more.tf' : 'http://localhost:3000';

passport.use(
  new SteamStrategy(
    {
      returnURL: `${baseURL}/api/auth/steam/return`,
      realm: baseURL,
      apiKey: `${process.env.STEAMKEY}`,
    },
    function (identifier, profile, done) {
      process.nextTick(function () {
        profile.identifier = identifier;
        return done(null, profile);
      });
    }
  )
);

// Mount API routes
app.use('/api', apiRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, '/client/dist')));

// Catch-all route for SPA
app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, '/client/dist', 'index.html'));
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server - wait for Redis if configured
async function startServer() {
  // If Redis is configured, wait for it to connect before starting
  if (process.env.REDIS_HOST && redisClient) {
    try {
      // Wait for Redis connection (with timeout)
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Redis connection timeout')), 10000)
      );

      await Promise.race([
        redisClient.ping(),
        timeout
      ]);

      logger.info('Redis ready, starting server');
    } catch (err) {
      logger.warn('Redis not available, starting server anyway', { error: err.message });
    }
  }

  server = app.listen(port, function () {
    logger.info('Server started', {
      port: this.address().port,
      env: app.settings.env,
      sessionStore: sessionStore ? 'Redis' : 'Memory',
    });
  });
}

startServer();

// Graceful shutdown handlers
async function gracefulShutdown(signal) {
  logger.info(`${signal} received, starting graceful shutdown`);

  // Stop accepting new connections
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed');
    });
  }

  try {
    // Close Redis connection
    if (redisClient && redisClient.isOpen) {
      await redisClient.quit();
      logger.info('Redis connection closed');
    }

    // Database pool will be closed by its own handlers in database.js

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (err) {
    logger.error('Error during graceful shutdown', { error: err.message });
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
