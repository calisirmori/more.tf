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

// Redis client configuration
let redisClient;
let sessionStore;

if (process.env.REDIS_HOST) {
  // Initialize Redis client
  redisClient = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT || 6379,
    },
    password: process.env.REDIS_PASSWORD || undefined,
  });

  redisClient.on('error', (err) =>
    logger.error('Redis Client Error', { error: err.message })
  );
  redisClient.on('connect', () => logger.info('Redis Client Connected'));

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
    cookie: {
      secure: isProduction, // Only use secure cookies in production (HTTPS)
      httpOnly: true, // Prevent XSS attacks
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
      sameSite: isProduction ? 'none' : 'lax', // CSRF protection
      domain: isProduction ? '.more.tf' : undefined, // Allow cookie across subdomains in production
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

// Start server
app.listen(port, function () {
  logger.info('Server started', {
    port: this.address().port,
    env: app.settings.env,
  });
});
