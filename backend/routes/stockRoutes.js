// backend/routes/stockRoutes.js - Stock API Routes
const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');

// Stock data routes
router.get('/market-data', stockController.getMarketData);
router.get('/historical-data', stockController.getHistoricalData);
router.get('/market-feed', stockController.getMarketFeed);
router.get('/portfolio', stockController.getPortfolio);
router.get('/search-instruments', stockController.searchInstruments);
router.get('/health', stockController.healthCheck);

// Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Stock API test endpoint',
    timestamp: new Date().toISOString(),
    service: 'stock-data'
  });
});

module.exports = router;
