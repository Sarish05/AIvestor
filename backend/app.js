// backend/app.js - Main Express Application
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const stockRoutes = require('./routes/stockRoutes');
const marketRoutes = require('./routes/marketRoutes');
const finnhubRoutes = require('./routes/finnhubRoutes');
const newsRoutes = require('./routes/newsRoutes');
const youtubeRoutes = require('./routes/youtubeRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(logger);

// Use routes
app.use('/api/stocks', stockRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/finnhub', finnhubRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/youtube', youtubeRoutes);

// Health check endpoint (what frontend actually calls)
app.get('/api/stocks/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Error handling middleware (should be last)
app.use(errorHandler);

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT}`);
    console.log(`📊 Stock API available at http://localhost:${PORT}/api/stocks`);
    console.log(`📈 Upstox API available at http://localhost:${PORT}/api/upstox`);
    console.log(`💹 Market API available at http://localhost:${PORT}/api/market`);
    console.log(`📰 Finnhub API available at http://localhost:${PORT}/api/finnhub`);
    console.log(`📧 News API available at http://localhost:${PORT}/api/news`);
    console.log(`📺 YouTube API available at http://localhost:${PORT}/api/youtube`);
  });
}

module.exports = app;
