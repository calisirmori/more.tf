const logger = require('../utils/logger');

// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userId: req.user?.id || null,
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Send error response
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      statusCode: statusCode,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};

// 404 handler
const notFoundHandler = (req, res) => {
  logger.warn('Route not found', {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });

  res.status(404).json({
    error: {
      message: 'Route not found',
      statusCode: 404,
    },
  });
};

module.exports = { errorHandler, notFoundHandler };
