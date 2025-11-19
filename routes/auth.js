const express = require('express');
const router = express.Router();
const passport = require('passport');
const logger = require('../utils/logger');
const { requireAuth } = require('../middleware/auth');

// Steam login routes
router.get('/steam', (req, res) => {
  res.send(req.user);
});

router.get(
  '/auth/steam',
  passport.authenticate('steam', { failureRedirect: '/api/steam' }),
  function (req, res) {
    res.redirect('/api/steam');
  }
);

router.get(
  '/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/api/steam' }),
  function (req, res) {
    const isProduction = process.env.NODE_ENV === 'production';
    try {
      // User is now authenticated via session (managed by Passport)
      // No need to set userid cookie - session handles everything
      logger.info('User logged in', {
        userId: req.user.id,
        sessionId: req.sessionID,
      });

      // In development, redirect to Vite dev server; in production, use relative path
      const redirectUrl = isProduction
        ? `/profile/${req.user.id}`
        : `http://localhost:5173/profile/${req.user.id}`;
      res.redirect(redirectUrl);
    } catch (error) {
      logger.error('Login error', { error: error.message });
      const redirectUrl = isProduction
        ? `/error`
        : `http://localhost:5173/error`;
      res.redirect(redirectUrl);
    }
  }
);

router.get('/myprofile', (req, res) => {
  // Check if user is authenticated via session
  if (req.isAuthenticated() && req.user && req.user.id) {
    res.redirect(`/profile/${req.user.id}`);
  } else {
    // Redirect to login - no fallback to old cookies
    res.redirect(`/api/auth/steam`);
  }
});

// Get current authenticated user
router.get('/me', (req, res) => {
  if (req.isAuthenticated() && req.user) {
    return res.json({
      authenticated: true,
      user: {
        id: req.user.id,
        steamId: req.user.id,
        displayName: req.user.displayName,
        avatar:
          req.user.photos && req.user.photos.length > 0
            ? req.user.photos[0].value
            : null,
      },
    });
  }

  return res.json({
    authenticated: false,
  });
});

router.get('/logout', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // Clear the old userid cookie for backwards compatibility
  res.clearCookie('userid', {
    httpOnly: false,
    secure: isProduction,
    sameSite: isProduction ? 'None' : 'Lax',
  });

  // Destroy the session
  req.logout(function (err) {
    if (err) {
      logger.error('Logout error', { error: err.message });
    }
    req.session.destroy(() => {
      // Redirect to home page
      const redirectUrl = isProduction ? '/' : 'http://localhost:5173/';
      res.redirect(redirectUrl);
    });
  });
});

module.exports = router;
