const logger = require('../utils/logger');

// Request logging middleware with headers
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log incoming request
  logger.info('Incoming request', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    referer: req.get('referer'),
    contentType: req.get('content-type'),
    userId: req.user?.id || null,
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

module.exports = requestLogger;
