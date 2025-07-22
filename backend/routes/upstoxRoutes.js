// backend/routes/upstoxRoutes.js - Upstox Specific Routes
const express = require('express');
const router = express.Router();
const { upstoxAuthMiddleware } = require('../middleware/auth');

// Apply Upstox auth middleware
router.use(upstoxAuthMiddleware);

// Upstox authentication status
router.get('/status', (req, res) => {
  const { upstoxConfig } = require('../config/upstox');
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    api_key_configured: !!upstoxConfig.apiKey,
    access_token_configured: !!upstoxConfig.accessToken,
    is_configured: upstoxConfig.isConfigured()
  });
});

// Test endpoint to verify Upstox connectivity
router.get('/test', async (req, res, next) => {
  try {
    const upstoxService = require('../services/upstoxService');
    
    // Try a simple API call
    const testData = await upstoxService.makeApiCall('/market-quote/ltp', {
      instrument_key: 'NSE_EQ|INE002A01018' // Reliance
    });
    
    res.json({
      status: 'success',
      message: 'Upstox API connection successful',
      test_data: testData
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Upstox API connection failed',
      error: error.message
    });
  }
});

// Test endpoint (called by frontend)
router.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Upstox API connection test successful',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
