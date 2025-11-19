const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');

// Admin login route
router.post('/admin/login', (req, res) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      logger.error('ADMIN_PASSWORD not set in environment variables');
      return res
        .status(500)
        .json({ success: false, message: 'Server configuration error' });
    }

    if (password === adminPassword) {
      // Set admin session cookie
      res.cookie('isAdmin', 'true', {
        maxAge: 86400000, // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      logger.info('Admin logged in successfully');
      return res.json({ success: true, message: 'Login successful' });
    } else {
      logger.warn('Failed admin login attempt');
      return res
        .status(401)
        .json({ success: false, message: 'Invalid password' });
    }
  } catch (error) {
    logger.error('Admin login error', { error: error.message });
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify admin status
router.get('/admin/verify', (req, res) => {
  const isAdmin = req.cookies.isAdmin === 'true';
  res.json({ isAdmin });
});

// Admin logout route
router.post('/admin/logout', (req, res) => {
  res.clearCookie('isAdmin');
  logger.info('Admin logged out');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Middleware to protect admin routes
const requireAdmin = (req, res, next) => {
  if (req.cookies.isAdmin === 'true') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Unauthorized' });
  }
};

module.exports = router;
module.exports.requireAdmin = requireAdmin;
