const express = require('express');
const router = express.Router();
const newsService = require('../services/newsService');

/**
 * @route GET /api/news/financial
 * @desc Get financial news
 * @query q - Search query (optional)
 * @query pageSize - Number of articles (default: 10)
 */
router.get('/financial', async (req, res) => {
  try {
    const query = req.query.q || 'finance OR stock OR market OR investment';
    const pageSize = parseInt(req.query.pageSize) || 10;
    
    const articles = await newsService.fetchFinancialNews(query, pageSize);
    res.json(articles);
  } catch (error) {
    console.error('Error fetching financial news:', error.message);
    res.status(500).json({ error: 'Failed to fetch financial news' });
  }
});

/**
 * @route GET /api/news/business-headlines
 * @desc Get business headlines
 * @query country - Country code (default: 'in')
 * @query pageSize - Number of articles (default: 10)
 */
router.get('/business-headlines', async (req, res) => {
  try {
    const country = req.query.country || 'in';
    const pageSize = parseInt(req.query.pageSize) || 10;
    
    const articles = await newsService.fetchBusinessHeadlines(country, pageSize);
    res.json(articles);
  } catch (error) {
    console.error('Error fetching business headlines:', error.message);
    res.status(500).json({ error: 'Failed to fetch business headlines' });
  }
});

/**
 * @route GET /api/news/company/:companyName
 * @desc Get news for a specific company
 * @param companyName - Company name or stock symbol
 * @query pageSize - Number of articles (default: 5)
 */
router.get('/company/:companyName', async (req, res) => {
  try {
    const { companyName } = req.params;
    const pageSize = parseInt(req.query.pageSize) || 5;
    
    const articles = await newsService.fetchCompanyNews(companyName, pageSize);
    res.json(articles);
  } catch (error) {
    console.error(`Error fetching company news for ${req.params.companyName}:`, error.message);
    res.status(500).json({ error: `Failed to fetch company news for ${req.params.companyName}` });
  }
});

/**
 * @route POST /api/news/format
 * @desc Format news articles as string
 * @body articles - Array of news articles
 */
router.post('/format', (req, res) => {
  try {
    const { articles } = req.body;
    
    if (!articles || !Array.isArray(articles)) {
      return res.status(400).json({ error: 'Articles array is required' });
    }
    
    const formattedString = newsService.formatNewsAsString(articles);
    res.json({ formattedNews: formattedString });
  } catch (error) {
    console.error('Error formatting news:', error.message);
    res.status(500).json({ error: 'Failed to format news' });
  }
});

module.exports = router;
