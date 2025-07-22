// backend/routes/stockDataRoutes.js - Stock Data Routes
const express = require('express');
const stockDataController = require('../controllers/stockDataController');

const router = express.Router();

// Individual stock data
router.get('/stock/:symbol', stockDataController.getStockData);

// Multiple stocks data
router.post('/stocks', stockDataController.getMultipleStocks);

// Stock history
router.get('/stock/:symbol/history', stockDataController.getStockHistory);

// Top performing stocks
router.get('/trending', stockDataController.getTopStocks);

// Search stocks
router.get('/search/:query', stockDataController.searchStocks);

module.exports = router;
