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
const adminRoutes = require('./admin');
const seasonCardRoutes = require('./season-cards');
const generateCardsRoutes = require('./generate-cards');
const playerCardsRoutes = require('./player-cards');

// Mount route modules
router.use('/', authRoutes);
router.use('/', playerRoutes);
router.use('/', seasonRoutes);
router.use('/', matchRoutes);
router.use('/', searchRoutes);
router.use('/', externalRoutes);
router.use('/', badgeRoutes);
router.use('/', miscRoutes);
router.use('/', adminRoutes);
router.use('/season-cards', seasonCardRoutes);
router.use('/generate', generateCardsRoutes);
router.use('/player-cards', playerCardsRoutes);

module.exports = router;
