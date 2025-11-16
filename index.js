const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
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

// Import routes
const apiRoutes = require('./routes/api');

// Server configuration
const port = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());
app.use(session({
  secret: 'Whatever_You_Want',
  saveUninitialized: true,
  resave: false,
  cookie: {
    maxAge: 31556952000
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

// CORS headers
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// Request logging middleware
app.use(requestLogger);

// Passport configuration
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new SteamStrategy({
  returnURL: 'https://more.tf/api/auth/steam/return',
  realm: 'https://more.tf',
  apiKey: `${process.env.STEAMKEY}`
}, function (identifier, profile, done) {
  process.nextTick(function () {
    profile.identifier = identifier;
    return done(null, profile);
  });
}));

// Mount API routes
app.use('/api', apiRoutes);

// Serve static files
app.use(express.static(path.join(__dirname, "/client/dist")));

// Catch-all route for SPA
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "/client/dist", "index.html"));
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(port, function () {
  logger.info('Server started', {
    port: this.address().port,
    env: app.settings.env
  });
});
