// backend/controllers/stockController.js - Stock Data Controller
const upstoxService = require('../services/upstoxService');
const mockDataService = require('../services/mockDataService');

class StockController {
  // Get market data for multiple instruments
  async getMarketData(req, res, next) {
    try {
      const { instruments } = req.query;

      if (!instruments) {
        return res.status(400).json({
          success: false,
          error: 'Instruments parameter is required'
        });
      }

      console.log('Processing request for instruments:', instruments);

      try {
        // Try to get real data from Upstox
        const marketData = await upstoxService.getMarketQuotes(instruments);
        res.json(marketData);
      } catch (error) {
        console.error('Upstox API failed, using mock data:', error.message);
        
        // Fall back to mock data
        const instrumentsList = instruments.split(',');
        const mockData = mockDataService.generateMarketMockData(instrumentsList);
        res.json(mockData);
      }
    } catch (error) {
      next(error);
    }
  }

  // Get historical data for an instrument
  async getHistoricalData(req, res, next) {
    try {
      const { instrument, interval, from_date, to_date } = req.query;

      if (!instrument) {
        return res.status(400).json({
          success: false,
          error: 'Instrument parameter is required'
        });
      }

      const fromDate = from_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const toDate = to_date || new Date().toISOString().split('T')[0];
      const intervalParam = interval || '1d';

      console.log(`Fetching historical data for ${instrument}, interval: ${intervalParam}, from: ${fromDate}, to: ${toDate}`);

      try {
        // Try to get real data from Upstox
        const historicalData = await upstoxService.getHistoricalData(instrument, intervalParam, fromDate, toDate);
        res.json(historicalData);
      } catch (error) {
        console.error('Upstox historical API failed, using mock data:', error.message);
        
        // Fall back to mock data
        const mockData = mockDataService.generateHistoricalMockData(instrument, intervalParam, fromDate, toDate);
        res.json(mockData);
      }
    } catch (error) {
      next(error);
    }
  }

  // Get market feed (real-time updates simulation)
  async getMarketFeed(req, res, next) {
    try {
      const { instruments } = req.query;

      if (!instruments) {
        return res.status(400).json({
          success: false,
          error: 'Instruments parameter is required'
        });
      }

      const instrumentsList = instruments.split(',');
      
      // Always return mock data for feed (simulates real-time updates)
      const mockData = mockDataService.generateMarketMockData(instrumentsList);
      res.json(mockData);
    } catch (error) {
      next(error);
    }
  }

  // Get portfolio holdings
  async getPortfolio(req, res, next) {
    try {
      // Return mock portfolio data
      const mockPortfolio = mockDataService.generatePortfolioMockData();
      res.json(mockPortfolio);
    } catch (error) {
      next(error);
    }
  }

  // Search instruments
  async searchInstruments(req, res, next) {
    try {
      const { query } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          error: 'Query parameter is required'
        });
      }

      // Return mock search results
      const mockResults = mockDataService.generateSearchMockData(query);
      res.json(mockResults);
    } catch (error) {
      next(error);
    }
  }

  // Health check for stock services
  async healthCheck(req, res, next) {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
          upstox: {
            configured: require('../config/upstox').upstoxConfig.isConfigured(),
            status: 'available'
          },
          mockData: {
            status: 'available'
          }
        }
      };

      res.json(health);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StockController();
