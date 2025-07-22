const axios = require('axios');

// Finnhub API service for fetching market data, news, and company information
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const FINNHUB_API_BASE_URL = 'https://finnhub.io/api/v1';

/**
 * Currency code to use for displaying prices (INR for Indian market)
 */
const CURRENCY_CODE = 'INR';
const CURRENCY_SYMBOL = '₹';

/**
 * Mock data for Indian stocks when the API is unavailable
 */
const MOCK_INDIAN_STOCKS = [
  {
    symbol: 'RELIANCE.NS',
    name: 'Reliance Industries Ltd',
    change: 15.25,
    percentChange: 0.65,
    currentPrice: 2372.80,
    volume: 7654321,
    marketCap: 14875000000000 // In INR
  },
  {
    symbol: 'TCS.NS',
    name: 'Tata Consultancy Services Ltd',
    change: -12.50,
    percentChange: -0.38,
    currentPrice: 3250.75,
    volume: 2345678,
    marketCap: 11920000000000
  },
  {
    symbol: 'HDFCBANK.NS',
    name: 'HDFC Bank Ltd',
    change: 22.10,
    percentChange: 1.42,
    currentPrice: 1589.65,
    volume: 5678901,
    marketCap: 8950000000000
  },
  {
    symbol: 'INFY.NS',
    name: 'Infosys Ltd',
    change: -8.60,
    percentChange: -0.58,
    currentPrice: 1472.30,
    volume: 3456789,
    marketCap: 6230000000000
  },
  {
    symbol: 'ICICIBANK.NS',
    name: 'ICICI Bank Ltd',
    change: 9.35,
    percentChange: 1.15,
    currentPrice: 825.40,
    volume: 4567890,
    marketCap: 5780000000000
  },
  {
    symbol: 'SBIN.NS',
    name: 'State Bank of India',
    change: 6.75,
    percentChange: 1.28,
    currentPrice: 534.25,
    volume: 6789012,
    marketCap: 4890000000000
  },
  {
    symbol: 'BHARTIARTL.NS',
    name: 'Bharti Airtel Ltd',
    change: -3.45,
    percentChange: -0.42,
    currentPrice: 828.55,
    volume: 2345678,
    marketCap: 4650000000000
  },
  {
    symbol: 'KOTAKBANK.NS',
    name: 'Kotak Mahindra Bank Ltd',
    change: 11.85,
    percentChange: 0.78,
    currentPrice: 1537.90,
    volume: 1234567,
    marketCap: 3050000000000
  },
  {
    symbol: 'LT.NS',
    name: 'Larsen & Toubro Ltd',
    change: 24.60,
    percentChange: 1.13,
    currentPrice: 2204.85,
    volume: 1456789,
    marketCap: 3020000000000
  },
  {
    symbol: 'AXISBANK.NS',
    name: 'Axis Bank Ltd',
    change: -5.20,
    percentChange: -0.61,
    currentPrice: 844.50,
    volume: 3456789,
    marketCap: 2600000000000
  }
];

/**
 * Mock market news for Indian market
 */
const MOCK_INDIAN_MARKET_NEWS = [
  {
    category: 'business',
    datetime: Math.floor(Date.now() / 1000) - 3600,
    headline: 'RBI Maintains Repo Rate at 6.5% for Seventh Consecutive Time',
    id: 1001,
    image: 'https://img.etimg.com/thumb/msid-99432310,width-300,height-225,imgsize-62326,,resizemode-75/rbi.jpg',
    related: 'FINANCE,INDIA,RBI',
    source: 'Economic Times',
    summary: 'The Reserve Bank of India (RBI) has kept the repo rate unchanged at 6.5% for the seventh consecutive time, maintaining its focus on controlling inflation while supporting economic growth.',
    url: 'https://economictimes.indiatimes.com/news/economy/policy/rbi-keeps-repo-rate-unchanged-at-6-5-for-seventh-time-in-a-row/articleshow/104245720.cms'
  },
  {
    category: 'business',
    datetime: Math.floor(Date.now() / 1000) - 7200,
    headline: 'Nifty Scales New Heights, Crosses 22,500 Mark for First Time',
    id: 1002,
    image: 'https://img.etimg.com/thumb/msid-98901785,width-300,height-225,imgsize-25586,,resizemode-75/sensex-nifty-stock-market-1200.jpg',
    related: 'MARKETS,NIFTY,SENSEX',
    source: 'Financial Express',
    summary: 'Indian benchmark indices continue their record-breaking spree with Nifty crossing the 22,500 level for the first time, driven by strong FII inflows and positive corporate earnings.',
    url: 'https://www.financialexpress.com/market/nifty-crosses-22500-mark-for-first-time-sensex-up-300-points/'
  },
  {
    category: 'business',
    datetime: Math.floor(Date.now() / 1000) - 10800,
    headline: 'IT Sector Expected to See 9-11% Growth in FY25, Says Nasscom',
    id: 1003,
    image: 'https://img.etimg.com/thumb/msid-99123456,width-300,height-225,imgsize-45678,,resizemode-75/it-sector.jpg',
    related: 'IT,TECH,NASSCOM',
    source: 'Mint',
    summary: 'The National Association of Software and Service Companies (Nasscom) projects 9-11% growth for India\'s IT sector in FY25, driven by increased tech spending and digital transformation initiatives globally.',
    url: 'https://www.livemint.com/industry/infotech/it-sector-expected-to-see-9-11-growth-in-fy25-says-nasscom'
  },
  {
    category: 'business',
    datetime: Math.floor(Date.now() / 1000) - 14400,
    headline: 'Reliance Industries Plans ₹75,000 Crore Investment in Green Energy',
    id: 1004,
    image: 'https://img.etimg.com/thumb/msid-98765432,width-300,height-225,imgsize-56789,,resizemode-75/reliance-green.jpg',
    related: 'RELIANCE,GREEN ENERGY,INVESTMENT',
    source: 'Business Standard',
    summary: 'Reliance Industries has announced plans to invest ₹75,000 crore in green energy initiatives over the next three years, focusing on solar, hydrogen, and battery storage technologies.',
    url: 'https://www.business-standard.com/article/companies/reliance-industries-to-invest-rs-75-000-crore-in-green-energy-projects'
  },
  {
    category: 'business',
    datetime: Math.floor(Date.now() / 1000) - 18000,
    headline: 'GST Collections Rise 12% to ₹1.72 Lakh Crore in March',
    id: 1005,
    image: 'https://img.etimg.com/thumb/msid-97654321,width-300,height-225,imgsize-34567,,resizemode-75/gst.jpg',
    related: 'GST,TAXES,GOVERNMENT',
    source: 'The Hindu BusinessLine',
    summary: 'Goods and Services Tax (GST) collections rose 12% year-on-year to ₹1.72 lakh crore in March, indicating strong economic activity and improved compliance.',
    url: 'https://www.thehindubusinessline.com/economy/gst-collections-rise-12-to-rs-172-lakh-crore-in-march/article123456789.ece'
  }
];

/**
 * Fetch general market news
 * @param {number} count Number of news items to retrieve
 * @returns {Promise<Array>} Array of market news articles
 */
const getMarketNews = async (count = 10) => {
  try {
    console.log(`Fetching ${count} market news articles from Finnhub`);
    const response = await axios.get(
      `${FINNHUB_API_BASE_URL}/news?category=general&token=${FINNHUB_API_KEY}`
    );

    return response.data.slice(0, count); // Limit to requested count
  } catch (error) {
    console.error('Error fetching market news:', error.message);
    throw new Error('Failed to fetch market news');
  }
};

/**
 * Fetch news for a specific company
 * @param {string} symbol Stock symbol (e.g., 'AAPL')
 * @param {string} from Start date in format 'YYYY-MM-DD'
 * @param {string} to End date in format 'YYYY-MM-DD'
 * @returns {Promise<Array>} Array of company news articles
 */
const getCompanyNews = async (
  symbol,
  from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
  to = new Date().toISOString().split('T')[0] // Today
) => {
  try {
    console.log(`Fetching news for ${symbol} from ${from} to ${to}`);
    const response = await axios.get(
      `${FINNHUB_API_BASE_URL}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${FINNHUB_API_KEY}`
    );

    return response.data.slice(0, 10); // Limit to 10 articles
  } catch (error) {
    console.error(`Error fetching company news for ${symbol}:`, error.message);
    throw new Error(`Failed to fetch company news for ${symbol}`);
  }
};

/**
 * Search for symbols by name or ticker
 * @param {string} query Search query text
 * @returns {Promise<Array>} Array of matching symbols
 */
const searchSymbols = async (query) => {
  try {
    console.log(`Searching for symbols matching: ${query}`);
    const response = await axios.get(
      `${FINNHUB_API_BASE_URL}/search?q=${encodeURIComponent(query)}&token=${FINNHUB_API_KEY}`
    );

    return response.data.result || [];
  } catch (error) {
    console.error(`Error searching for symbols with query ${query}:`, error.message);
    throw new Error(`Failed to search symbols for query: ${query}`);
  }
};

/**
 * Get company profile information
 * @param {string} symbol Stock symbol (e.g., 'AAPL')
 * @returns {Promise<Object|null>} Company profile data
 */
const getCompanyProfile = async (symbol) => {
  try {
    console.log(`Fetching company profile for ${symbol}`);
    const response = await axios.get(
      `${FINNHUB_API_BASE_URL}/stock/profile2?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );

    return response.data;
  } catch (error) {
    console.error(`Error fetching company profile for ${symbol}:`, error.message);
    throw new Error(`Failed to fetch company profile for ${symbol}`);
  }
};

/**
 * Get basic stock quote data for a symbol
 * @param {string} symbol Stock symbol (e.g., 'AAPL')
 * @returns {Promise<Object|null>} Quote data including current price, change, high, low
 */
const getQuote = async (symbol) => {
  try {
    console.log(`Fetching quote for ${symbol}`);
    const response = await axios.get(
      `${FINNHUB_API_BASE_URL}/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
    );

    return response.data;
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error.message);
    throw new Error(`Failed to fetch quote for ${symbol}`);
  }
};

/**
 * Get trending stocks with their current price and change data
 * @param {Array} symbols Array of stock symbols (e.g., ['AAPL', 'MSFT', 'GOOGL'])
 * @returns {Promise<Array>} Array of trending stock data
 */
const getTrendingStocks = async (symbols = []) => {
  // Default popular symbols if none provided
  const stockSymbols = symbols.length > 0 ? symbols : [
    'AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA', 'NVDA', 'JPM', 'V', 'UNH'
  ];
  
  try {
    console.log(`Fetching trending stock data for ${stockSymbols.length} symbols`);
    const trendingStocks = [];
    
    // Fetch quotes for each symbol
    const quotePromises = stockSymbols.map(symbol => getQuote(symbol).catch(err => null));
    const profilePromises = stockSymbols.map(symbol => getCompanyProfile(symbol).catch(err => null));
    
    const quotes = await Promise.all(quotePromises);
    const profiles = await Promise.all(profilePromises);
    
    // Combine quote data with profile data
    for (let i = 0; i < stockSymbols.length; i++) {
      if (quotes[i] && quotes[i].c) {
        trendingStocks.push({
          symbol: stockSymbols[i],
          name: profiles[i]?.name || stockSymbols[i],
          change: quotes[i].d || 0,
          percentChange: quotes[i].dp || 0,
          currentPrice: quotes[i].c || 0,
          volume: quotes[i].v || 0,
          marketCap: profiles[i]?.marketCapitalization || undefined
        });
      }
    }
    
    // Sort by percent change (absolute value) to show most volatile stocks first
    return trendingStocks.sort((a, b) => Math.abs(b.percentChange) - Math.abs(a.percentChange));
  } catch (error) {
    console.error('Error fetching trending stocks:', error.message);
    throw new Error('Failed to fetch trending stocks');
  }
};

/**
 * Get trending stocks from our local Yahoo Finance server
 * This uses the backend Python server we set up to fetch real-time NSE data
 */
const getStocksFromYFinanceServer = async () => {
  try {
    console.log('Fetching Indian stocks from YFinance server');
    const response = await axios.get('http://localhost:5002/api/trending');
    
    // Map the response to our TrendingStock interface
    return response.data.map((stock) => ({
      symbol: stock.symbol,
      name: stock.company_name,
      change: stock.change !== 'N/A' ? stock.change : 0,
      percentChange: stock.percent_change !== 'N/A' ? stock.percent_change : 0,
      currentPrice: stock.current_price !== 'N/A' ? stock.current_price : 0,
      volume: stock.volume !== 'N/A' ? stock.volume : 0,
      marketCap: stock.market_cap !== 'N/A' ? stock.market_cap : undefined
    }));
  } catch (error) {
    console.error('Error fetching from YFinance server:', error.message);
    // Throw the error up to be handled by the caller
    throw new Error('Failed to fetch from YFinance server');
  }
};

/**
 * Get real-time stock data from the yfinance server we created
 * @param {string} symbol Stock symbol (e.g., 'AAPL')
 * @returns {Promise<Object>} Real-time stock data
 */
const getRealTimeStockDataFromYFinanceServer = async (symbol) => {
  try {
    console.log(`Fetching real-time stock data for ${symbol} from YFinance server`);
    const response = await axios.get(`http://localhost:5002/api/real-time/${symbol}`);
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching real-time stock data for ${symbol} from YFinance server:`, error.message);
    // Throw the error up to be handled by the caller
    throw new Error(`Failed to fetch real-time stock data for ${symbol} from YFinance server`);
  }
};

/**
 * Get trending stocks with their current price and change data, specifically for Indian market
 * @returns {Promise<Array>} Array of trending stock data
 */
const getIndianTrendingStocks = async () => {
  try {
    // First try to fetch from our YFinance server
    return await getStocksFromYFinanceServer();
  } catch (error) {
    console.error('Error fetching from YFinance server, falling back to mock data:', error.message);
    return MOCK_INDIAN_STOCKS;
  }
};

/**
 * Get company news specifically for Indian companies
 * @param {string} symbol Stock symbol (e.g., 'RELIANCE.NS')
 * @param {string} from Start date in format 'YYYY-MM-DD'
 * @param {string} to End date in format 'YYYY-MM-DD'
 * @returns {Promise<Array>} Array of company news articles
 */
const getIndianCompanyNews = async (
  symbol,
  from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
  to = new Date().toISOString().split('T')[0] // Today
) => {
  try {
    console.log(`Fetching news for Indian company ${symbol} from ${from} to ${to}`);
    return await getCompanyNews(symbol, from, to);
  } catch (error) {
    console.error(`Error fetching Indian company news for ${symbol}:`, error.message);
    throw new Error(`Failed to fetch Indian company news for ${symbol}`);
  }
};

/**
 * Get market news specifically about the Indian market
 * @param {number} count Number of news items to retrieve
 * @returns {Promise<Array>} Array of market news articles
 */
const getIndianMarketNews = async (count = 10) => {
  try {
    console.log('Fetching Indian market news');
    // Try to get real news
    try {
      const news = await getMarketNews(count);
      if (news && news.length > 0) {
        return news;
      }
      console.warn('No real market news returned, using mock data');
      return MOCK_INDIAN_MARKET_NEWS.slice(0, count);
    } catch (error) {
      console.error('Error fetching real market news:', error.message);
      return MOCK_INDIAN_MARKET_NEWS.slice(0, count);
    }
  } catch (error) {
    console.error('Error in getIndianMarketNews, returning mock data:', error.message);
    return MOCK_INDIAN_MARKET_NEWS.slice(0, count);
  }
};

module.exports = {
  CURRENCY_CODE,
  CURRENCY_SYMBOL,
  getMarketNews,
  getCompanyNews,
  searchSymbols,
  getCompanyProfile,
  getQuote,
  getTrendingStocks,
  getIndianTrendingStocks,
  getRealTimeStockDataFromYFinanceServer,
  getIndianCompanyNews,
  getIndianMarketNews
};
