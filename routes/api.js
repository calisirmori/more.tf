const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const playerRoutes = require('./players');
const seasonRoutes = require('./seasons');
const matchRoutes = require('./matches');
const searchRoutes = require('./search');
const externalRoutes = require('./external');
const badgeRoutes = require('./badges');
const miscRoutes = require('./misc');

// Mount route modules
router.use('/', authRoutes);
router.use('/', playerRoutes);
router.use('/', seasonRoutes);
router.use('/', matchRoutes);
router.use('/', searchRoutes);
router.use('/', externalRoutes);
router.use('/', badgeRoutes);
router.use('/', miscRoutes);

module.exports = router;
