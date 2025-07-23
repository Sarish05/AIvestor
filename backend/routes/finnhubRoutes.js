const express = require('express');
const router = express.Router();
const finnhubService = require('../services/finnhubService');

/**
 * @route GET /api/finnhub/market-news
 * @desc Get general market news
 * @query count - Number of articles to fetch (default: 10)
 */
router.get('/market-news', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;
    const news = await finnhubService.getMarketNews(count);
    res.json(news);
  } catch (error) {
    console.error('Error fetching market news:', error.message);
    res.status(500).json({ error: 'Failed to fetch market news' });
  }
});

/**
 * @route GET /api/finnhub/indian-market-news
 * @desc Get market news specific to Indian market
 * @query count - Number of articles to fetch (default: 10)
 */
router.get('/indian-market-news', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;
    const news = await finnhubService.getIndianMarketNews(count);
    res.json(news);
  } catch (error) {
    console.error('Error fetching Indian market news:', error.message);
    res.status(500).json({ error: 'Failed to fetch Indian market news' });
  }
});

/**
 * @route GET /api/finnhub/company-news/:symbol
 * @desc Get company-specific news
 * @param symbol - Stock symbol (e.g., AAPL, RELIANCE.NS)
 * @query from - Start date (YYYY-MM-DD, optional)
 * @query to - End date (YYYY-MM-DD, optional)
 */
router.get('/company-news/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const from = req.query.from;
    const to = req.query.to;
    
    const news = await finnhubService.getCompanyNews(symbol, from, to);
    res.json(news);
  } catch (error) {
    console.error(`Error fetching company news for ${req.params.symbol}:`, error.message);
    res.status(500).json({ error: `Failed to fetch company news for ${req.params.symbol}` });
  }
});

/**
 * @route GET /api/finnhub/indian-company-news/:symbol
 * @desc Get company-specific news for Indian companies
 * @param symbol - Stock symbol (e.g., RELIANCE.NS)
 * @query from - Start date (YYYY-MM-DD, optional)
 * @query to - End date (YYYY-MM-DD, optional)
 */
router.get('/indian-company-news/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const from = req.query.from;
    const to = req.query.to;
    
    const news = await finnhubService.getIndianCompanyNews(symbol, from, to);
    res.json(news);
  } catch (error) {
    console.error(`Error fetching Indian company news for ${req.params.symbol}:`, error.message);
    res.status(500).json({ error: `Failed to fetch Indian company news for ${req.params.symbol}` });
  }
});

/**
 * @route GET /api/finnhub/search
 * @desc Search for stock symbols
 * @query q - Search query
 */
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const symbols = await finnhubService.searchSymbols(query);
    res.json(symbols);
  } catch (error) {
    console.error(`Error searching symbols for ${req.query.q}:`, error.message);
    res.status(500).json({ error: `Failed to search symbols for ${req.query.q}` });
  }
});

/**
 * @route GET /api/finnhub/company-profile/:symbol
 * @desc Get company profile information
 * @param symbol - Stock symbol (e.g., AAPL)
 */
router.get('/company-profile/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const profile = await finnhubService.getCompanyProfile(symbol);
    res.json(profile);
  } catch (error) {
    console.error(`Error fetching company profile for ${req.params.symbol}:`, error.message);
    res.status(500).json({ error: `Failed to fetch company profile for ${req.params.symbol}` });
  }
});

/**
 * @route GET /api/finnhub/quote/:symbol
 * @desc Get stock quote data
 * @param symbol - Stock symbol (e.g., AAPL)
 */
router.get('/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = await finnhubService.getQuote(symbol);
    res.json(quote);
  } catch (error) {
    console.error(`Error fetching quote for ${req.params.symbol}:`, error.message);
    res.status(500).json({ error: `Failed to fetch quote for ${req.params.symbol}` });
  }
});

/**
 * @route GET /api/finnhub/trending-stocks
 * @desc Get trending stocks
 * @query symbols - Comma-separated list of symbols (optional)
 */
router.get('/trending-stocks', async (req, res) => {
  try {
    const symbols = req.query.symbols ? req.query.symbols.split(',') : [];
    const stocks = await finnhubService.getTrendingStocks(symbols);
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching trending stocks:', error.message);
    res.status(500).json({ error: 'Failed to fetch trending stocks' });
  }
});

/**
 * @route GET /api/finnhub/indian-trending-stocks
 * @desc Get trending stocks for Indian market
 */
router.get('/indian-trending-stocks', async (req, res) => {
  try {
    const stocks = await finnhubService.getIndianTrendingStocks();
    res.json(stocks);
  } catch (error) {
    console.error('Error fetching Indian trending stocks:', error.message);
    res.status(500).json({ error: 'Failed to fetch Indian trending stocks' });
  }
});

/**
 * @route GET /api/finnhub/real-time/:symbol
 * @desc Get real-time stock data from YFinance server
 * @param symbol - Stock symbol (e.g., AAPL)
 */
router.get('/real-time/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const data = await finnhubService.getRealTimeStockDataFromYFinanceServer(symbol);
    res.json(data);
  } catch (error) {
    console.error(`Error fetching real-time data for ${req.params.symbol}:`, error.message);
    res.status(500).json({ error: `Failed to fetch real-time data for ${req.params.symbol}` });
  }
});

/**
 * @route GET /api/finnhub/constants
 * @desc Get currency constants
 */
router.get('/constants', (req, res) => {
  res.json({
    CURRENCY_CODE: finnhubService.CURRENCY_CODE,
    CURRENCY_SYMBOL: finnhubService.CURRENCY_SYMBOL
  });
});

module.exports = router;
