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
const seasonManagementRoutes = require('./season-management');
const activeSeasonsRoutes = require('./active-seasons');
const cardInventoryRoutes = require('./card-inventory');
const profileRoutes = require('./profile');
const v2ViewerRoutes = require('./v2/viewer');
const { router: v2LogRoutes } = require('./v2/log');

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
router.use('/season-management', seasonManagementRoutes);
router.use('/card-inventory', cardInventoryRoutes);
router.use('/', activeSeasonsRoutes);
router.use('/', profileRoutes);
router.use('/v2', v2ViewerRoutes);
router.use('/v2', v2LogRoutes);

module.exports = router;
