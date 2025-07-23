const axios = require('axios');

// News API service for fetching financial news
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';

/**
 * Fetch financial news based on a query
 * @param {string} query Search term or phrase
 * @param {number} pageSize Number of results to return (max 100)
 * @returns {Promise<Array>} Array of news articles
 */
const fetchFinancialNews = async (
  query = 'finance OR stock OR market OR investment',
  pageSize = 10
) => {
  try {
    console.log(`Fetching financial news for query: ${query}`);
    const response = await axios.get(
      `${NEWS_API_BASE_URL}/everything`,
      {
        params: {
          q: query,
          pageSize,
          language: 'en',
          sortBy: 'publishedAt',
          apiKey: NEWS_API_KEY
        }
      }
    );

    return response.data.articles;
  } catch (error) {
    console.error('Error fetching financial news:', error.message);
    throw new Error('Failed to fetch financial news');
  }
};

/**
 * Fetch top headlines for business category
 * @param {string} country Country code (default 'in' for India)
 * @param {number} pageSize Number of results to return
 * @returns {Promise<Array>} Array of news articles
 */
const fetchBusinessHeadlines = async (country = 'in', pageSize = 10) => {
  try {
    console.log(`Fetching business headlines for country: ${country}`);
    const response = await axios.get(
      `${NEWS_API_BASE_URL}/top-headlines`,
      {
        params: {
          country,
          category: 'business',
          pageSize,
          apiKey: NEWS_API_KEY
        }
      }
    );

    return response.data.articles;
  } catch (error) {
    console.error('Error fetching business headlines:', error.message);
    throw new Error('Failed to fetch business headlines');
  }
};

/**
 * Fetch news about a specific company or stock
 * @param {string} companyName Name of the company or stock symbol
 * @param {number} pageSize Number of results to return
 * @returns {Promise<Array>} Array of news articles
 */
const fetchCompanyNews = async (companyName, pageSize = 5) => {
  try {
    console.log(`Fetching news for company: ${companyName}`);
    const response = await axios.get(
      `${NEWS_API_BASE_URL}/everything`,
      {
        params: {
          q: companyName,
          pageSize,
          language: 'en',
          sortBy: 'publishedAt',
          apiKey: NEWS_API_KEY
        }
      }
    );

    return response.data.articles;
  } catch (error) {
    console.error(`Error fetching news for ${companyName}:`, error.message);
    throw new Error(`Failed to fetch news for ${companyName}`);
  }
};

/**
 * Format news articles as a string for the AI
 * @param {Array} articles Array of news articles
 * @returns {string} Formatted string with news information
 */
const formatNewsAsString = (articles) => {
  if (!articles || articles.length === 0) {
    return 'No recent news articles found.';
  }

  return articles
    .map(
      (article, index) => `
Article ${index + 1}: ${article.title}
Source: ${article.source.name}
Date: ${new Date(article.publishedAt).toLocaleString()}
${article.description ? `Summary: ${article.description}` : ''}
${article.url ? `URL: ${article.url}` : ''}
`
    )
    .join('\n');
};

module.exports = {
  fetchFinancialNews,
  fetchBusinessHeadlines,
  fetchCompanyNews,
  formatNewsAsString
};
