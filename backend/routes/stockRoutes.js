// backend/routes/stockRoutes.js - Stock API Routes
const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const { upstoxAuthMiddleware } = require('../middleware/auth');

// Apply Upstox auth middleware to all routes
router.use(upstoxAuthMiddleware);

// Stock data routes
router.get('/market-data', stockController.getMarketData);
router.get('/historical-data', stockController.getHistoricalData);
router.get('/market-feed', stockController.getMarketFeed);
router.get('/portfolio', stockController.getPortfolio);
router.get('/search-instruments', stockController.searchInstruments);
router.get('/health', stockController.healthCheck);

// Health check endpoint
router.get('/health', stockController.getHealth);

// Test endpoint for Upstox
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Upstox API test endpoint',
    timestamp: new Date().toISOString(),
    service: 'upstox-integration'
  });
});

// Upstox callback endpoint (simplified)
router.get('/callback', (req, res) => {
  const { code } = req.query;
  
  if (code) {
    res.json({
      success: true,
      message: 'Authorization code received',
      code: code
    });
  } else {
    res.status(400).json({
      success: false,
      error: 'No authorization code provided'
    });
  }
});

module.exports = router;
