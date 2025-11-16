const express = require('express');
const router = express.Router();
const passport = require('passport');
const logger = require('../utils/logger');

// Steam login routes
router.get('/steam', (req, res) => {
  res.send(req.user);
});

router.get('/auth/steam', passport.authenticate('steam', { failureRedirect: '/api/steam' }), function (req, res) {
  res.redirect('/api/steam')
});

router.get('/auth/steam/return', passport.authenticate('steam', { failureRedirect: '/api/steam' }), function (req, res) {
  try {
    res.cookie('userid', res.req.user.id, {
      maxAge: 31556952000, // 1 year
      httpOnly: false,
      secure: true, // set to true if serving over https
      SameSite: 'None' // can be set to 'Lax' or 'Strict' as per requirement
    });
    logger.info('User logged in', { userId: res.req.user.id });
    res.redirect(`/profile/${res.req.user.id}`)
  } catch (error) {
    logger.error('Login error', { error: error.message });
    res.redirect(`/error`)
  }
});

router.get('/myprofile', (req, res) => {
  if (req.cookies.userid !== undefined) {
    res.redirect(`/profile/${req.cookies.userid}`)
  } else {
    res.redirect(`/api/auth/steam`)
  }
});

module.exports = router;
