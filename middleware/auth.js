const logger = require('../utils/logger');

// Middleware to check if user is authenticated
const requireAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  logger.warn('Unauthorized access attempt', {
    path: req.path,
    ip: req.ip
  });

  return res.status(401).json({
    error: 'Unauthorized',
    message: 'You must be logged in to access this resource'
  });
};

// Middleware to get user info from session
const getSessionUser = (req, res, next) => {
  if (req.isAuthenticated() && req.user) {
    // Attach sanitized user info to request
    req.sessionUser = {
      id: req.user.id,
      steamId: req.user.id,
      displayName: req.user.displayName,
      avatar: req.user.photos && req.user.photos.length > 0 ? req.user.photos[0].value : null
    };
  }
  next();
};

module.exports = {
  requireAuth,
  getSessionUser
};
