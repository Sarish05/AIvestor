// backend/controllers/stockDataController.js - Enhanced Stock Data Controller
const axios = require('axios');

// Yahoo Finance stock data service
const YAHOO_FINANCE_SERVER = 'http://localhost:5002';

class StockDataController {
  // Get individual stock data with company details
  async getStockData(req, res, next) {
    try {
      const { symbol } = req.params;

      if (!symbol) {
        return res.status(400).json({
          success: false,
          error: 'Symbol parameter is required'
        });
      }

      // Call the Yahoo Finance server
      const response = await axios.get(`${YAHOO_FINANCE_SERVER}/api/stock/${symbol}`);
      
      if (response.data) {
        res.json({
          status: 'success',
          data: response.data
        });
      } else {
        res.status(404).json({
          success: false,
          error: `No data found for ${symbol}`
        });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        res.status(404).json({
          success: false,
          error: `Stock data not found for ${req.params.symbol}`
        });
      } else {
        next(error);
      }
    }
  }

  // Get multiple stocks data
  async getMultipleStocks(req, res, next) {
    try {
      const { symbols } = req.body;

      if (!symbols || !Array.isArray(symbols)) {
        return res.status(400).json({
          success: false,
          error: 'Symbols array is required'
        });
      }

      const stockPromises = symbols.map(async (symbol) => {
        try {
          const response = await axios.get(`${YAHOO_FINANCE_SERVER}/api/stock/${symbol}`);
          return response.data;
        } catch (error) {
          console.error(`Error fetching data for ${symbol}:`, error.message);
          return null;
        }
      });

      const results = await Promise.all(stockPromises);
      const validResults = results.filter(result => result !== null);

      res.json({
        status: 'success',
        data: validResults,
        requested: symbols.length,
        returned: validResults.length
      });
    } catch (error) {
      next(error);
    }
  }

  // Get stock history
  async getStockHistory(req, res, next) {
    try {
      const { symbol } = req.params;
      const { period = '1mo', interval = '1d' } = req.query;

      if (!symbol) {
        return res.status(400).json({
          success: false,
          error: 'Symbol parameter is required'
        });
      }

      // For now, return mock historical data
      // In a real implementation, you'd call a historical data API
      const mockHistoricalData = generateMockHistoricalData(symbol, period, interval);

      res.json({
        status: 'success',
        data: mockHistoricalData
      });
    } catch (error) {
      next(error);
    }
  }

  // Get top performing stocks
  async getTopStocks(req, res, next) {
    try {
      const response = await axios.get(`${YAHOO_FINANCE_SERVER}/api/trending`);
      
      res.json({
        status: 'success',
        data: response.data
      });
    } catch (error) {
      // Fallback to mock data if service is unavailable
      const mockTopStocks = [
        {
          symbol: 'RELIANCE',
          company_name: 'Reliance Industries Ltd',
          current_price: 2650.75,
          change: 45.20,
          percent_change: 1.73
        },
        {
          symbol: 'TCS',
          company_name: 'Tata Consultancy Services Ltd',
          current_price: 3695.30,
          change: -12.45,
          percent_change: -0.34
        }
      ];

      res.json({
        status: 'success',
        data: mockTopStocks,
        note: 'Mock data - Yahoo Finance service unavailable'
      });
    }
  }

  // Search stocks
  async searchStocks(req, res, next) {
    try {
      const { query } = req.params;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const response = await axios.get(`${YAHOO_FINANCE_SERVER}/api/search/${query}`);
      
      res.json({
        status: 'success',
        data: response.data
      });
    } catch (error) {
      // Fallback to basic search
      const mockSearchResults = [
        {
          symbol: query.toUpperCase(),
          company_name: `${query.toUpperCase()} Ltd`,
          current_price: 1000 + Math.random() * 2000,
          change: (Math.random() - 0.5) * 100,
          percent_change: (Math.random() - 0.5) * 10
        }
      ];

      res.json({
        status: 'success',
        data: mockSearchResults,
        note: 'Mock search results - service unavailable'
      });
    }
  }
}

// Helper function to generate mock historical data
function generateMockHistoricalData(symbol, period, interval) {
  const data = [];
  const basePrice = 1000 + Math.random() * 2000;
  let currentPrice = basePrice;
  
  // Generate 30 days of data
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    const change = (Math.random() - 0.5) * 0.05; // 5% max change
    currentPrice = currentPrice * (1 + change);
    
    const open = currentPrice * (0.98 + Math.random() * 0.04);
    const high = Math.max(open, currentPrice) * (1 + Math.random() * 0.02);
    const low = Math.min(open, currentPrice) * (1 - Math.random() * 0.02);
    const volume = Math.floor(100000 + Math.random() * 1000000);
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(currentPrice * 100) / 100,
      volume: volume
    });
  }
  
  return {
    symbol: symbol,
    period: period,
    interval: interval,
    prices: data
  };
}

module.exports = new StockDataController();
