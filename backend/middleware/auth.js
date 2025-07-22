// backend/middleware/auth.js - Authentication Middleware
const { upstoxConfig } = require('../config/upstox');

// Middleware to check Upstox credentials
const upstoxAuthMiddleware = (req, res, next) => {
  if (!upstoxConfig.isConfigured()) {
    console.warn('Upstox credentials not configured, some features may use mock data');
  }
  
  req.upstoxHeaders = upstoxConfig.getHeaders();
  next();
};

// Middleware to validate API keys
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey && process.env.NODE_ENV === 'production') {
    return res.status(401).json({
      success: false,
      error: 'API key required'
    });
  }
  
  next();
};

module.exports = {
  upstoxAuthMiddleware,
  validateApiKey
};
