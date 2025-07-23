// Backend-based Finnhub service for making API calls through our backend
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

/**
 * Currency code to use for displaying prices (INR for Indian market)
 */
export const CURRENCY_CODE = 'INR';
export const CURRENCY_SYMBOL = '₹';

/**
 * Market News article structure
 */
export interface MarketNewsArticle {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

/**
 * Company News article structure 
 */
export interface CompanyNewsArticle {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

/**
 * Stock symbol information structure
 */
export interface SymbolInfo {
  currency: string;
  description: string;
  displaySymbol: string;
  figi: string;
  mic: string;
  symbol: string;
  type: string;
}

/**
 * Company profile structure
 */
export interface CompanyProfile {
  country: string;
  currency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

/**
 * Trending stock information structure
 */
export interface TrendingStock {
  symbol: string;
  name: string;
  change: number;
  percentChange: number;
  currentPrice: number;
  volume: number;
  marketCap?: number;
}

/**
 * Helper function to make API calls to our backend
 */
const apiCall = async (endpoint: string): Promise<any> => {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/finnhub${endpoint}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error calling backend API ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Fetch general market news through backend
 * @param count Number of news items to retrieve
 * @returns Promise<MarketNewsArticle[]> Array of market news articles
 */
export const getMarketNews = async (count: number = 10): Promise<MarketNewsArticle[]> => {
  try {
    console.log(`Fetching ${count} market news articles from backend`);
    return await apiCall(`/market-news?count=${count}`);
  } catch (error) {
    console.error('Error fetching market news from backend:', error);
    throw new Error('Failed to fetch market news');
  }
};

/**
 * Fetch news for a specific company through backend
 * @param symbol Stock symbol (e.g., 'AAPL')
 * @param from Start date in format 'YYYY-MM-DD'
 * @param to End date in format 'YYYY-MM-DD'
 * @returns Promise<CompanyNewsArticle[]> Array of company news articles
 */
export const getCompanyNews = async (
  symbol: string,
  from?: string,
  to?: string
): Promise<CompanyNewsArticle[]> => {
  try {
    console.log(`Fetching news for ${symbol} from backend`);
    let endpoint = `/company-news/${symbol}`;
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (params.toString()) endpoint += `?${params.toString()}`;
    
    return await apiCall(endpoint);
  } catch (error) {
    console.error(`Error fetching company news for ${symbol} from backend:`, error);
    throw new Error(`Failed to fetch company news for ${symbol}`);
  }
};

/**
 * Search for symbols by name or ticker through backend
 * @param query Search query text
 * @returns Promise<SymbolInfo[]> Array of matching symbols
 */
export const searchSymbols = async (query: string): Promise<SymbolInfo[]> => {
  try {
    console.log(`Searching for symbols matching: ${query} via backend`);
    return await apiCall(`/search?q=${encodeURIComponent(query)}`);
  } catch (error) {
    console.error(`Error searching for symbols with query ${query} from backend:`, error);
    throw new Error(`Failed to search symbols for query: ${query}`);
  }
};

/**
 * Get company profile information through backend
 * @param symbol Stock symbol (e.g., 'AAPL')
 * @returns Promise<CompanyProfile | null> Company profile data
 */
export const getCompanyProfile = async (symbol: string): Promise<CompanyProfile | null> => {
  try {
    console.log(`Fetching company profile for ${symbol} from backend`);
    return await apiCall(`/company-profile/${symbol}`);
  } catch (error) {
    console.error(`Error fetching company profile for ${symbol} from backend:`, error);
    throw new Error(`Failed to fetch company profile for ${symbol}`);
  }
};

/**
 * Get basic stock quote data for a symbol through backend
 * @param symbol Stock symbol (e.g., 'AAPL')
 * @returns Promise<any> Quote data including current price, change, high, low
 */
export const getQuote = async (symbol: string): Promise<any> => {
  try {
    console.log(`Fetching quote for ${symbol} from backend`);
    return await apiCall(`/quote/${symbol}`);
  } catch (error) {
    console.error(`Error fetching quote for ${symbol} from backend:`, error);
    throw new Error(`Failed to fetch quote for ${symbol}`);
  }
};

/**
 * Get trending stocks with their current price and change data through backend
 * @param symbols Array of stock symbols (e.g., ['AAPL', 'MSFT', 'GOOGL'])
 * @returns Promise<TrendingStock[]> Array of trending stock data
 */
export const getTrendingStocks = async (symbols: string[] = []): Promise<TrendingStock[]> => {
  try {
    console.log(`Fetching trending stocks from backend`);
    const endpoint = symbols.length > 0 
      ? `/trending-stocks?symbols=${symbols.join(',')}`
      : '/trending-stocks';
    return await apiCall(endpoint);
  } catch (error) {
    console.error('Error fetching trending stocks from backend:', error);
    throw new Error('Failed to fetch trending stocks');
  }
};

/**
 * Get trending stocks from our backend (which calls YFinance server)
 * This uses the backend to call the Python server for real-time NSE data
 */
export const getStocksFromYFinanceServer = async (): Promise<TrendingStock[]> => {
  try {
    console.log('Fetching Indian stocks from backend (via YFinance server)');
    return await apiCall('/indian-trending-stocks');
  } catch (error) {
    console.error('Error fetching from YFinance server via backend:', error);
    throw new Error('Failed to fetch from YFinance server');
  }
};

/**
 * Get real-time stock data from the yfinance server through backend
 * @param symbol Stock symbol (e.g., 'AAPL')
 * @returns Promise<any> Real-time stock data
 */
export const getRealTimeStockDataFromYFinanceServer = async (symbol: string): Promise<any> => {
  try {
    console.log(`Fetching real-time stock data for ${symbol} from backend (via YFinance server)`);
    return await apiCall(`/real-time/${symbol}`);
  } catch (error) {
    console.error(`Error fetching real-time stock data for ${symbol} from backend:`, error);
    throw new Error(`Failed to fetch real-time stock data for ${symbol}`);
  }
};

/**
 * Get trending stocks with their current price and change data, specifically for Indian market through backend
 * @returns Promise<TrendingStock[]> Array of trending stock data
 */
export const getIndianTrendingStocks = async (): Promise<TrendingStock[]> => {
  try {
    console.log('Fetching Indian trending stocks from backend');
    return await apiCall('/indian-trending-stocks');
  } catch (error) {
    console.error('Error fetching Indian trending stocks from backend:', error);
    throw new Error('Failed to fetch Indian trending stocks');
  }
};

/**
 * Get company news specifically for Indian companies through backend
 * @param symbol Stock symbol (e.g., 'RELIANCE.NS')
 * @param from Start date in format 'YYYY-MM-DD'
 * @param to End date in format 'YYYY-MM-DD'
 * @returns Promise<CompanyNewsArticle[]> Array of company news articles
 */
export const getIndianCompanyNews = async (
  symbol: string,
  from?: string,
  to?: string
): Promise<CompanyNewsArticle[]> => {
  try {
    console.log(`Fetching news for Indian company ${symbol} from backend`);
    let endpoint = `/indian-company-news/${symbol}`;
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (params.toString()) endpoint += `?${params.toString()}`;
    
    return await apiCall(endpoint);
  } catch (error) {
    console.error(`Error fetching Indian company news for ${symbol} from backend:`, error);
    throw new Error(`Failed to fetch Indian company news for ${symbol}`);
  }
};

/**
 * Get market news specifically about the Indian market through backend
 * @param count Number of news items to retrieve
 * @returns Promise<MarketNewsArticle[]> Array of market news articles
 */
export const getIndianMarketNews = async (count: number = 10): Promise<MarketNewsArticle[]> => {
  try {
    console.log('Fetching Indian market news from backend');
    return await apiCall(`/indian-market-news?count=${count}`);
  } catch (error) {
    console.error('Error fetching Indian market news from backend:', error);
    throw new Error('Failed to fetch Indian market news');
  }
};

/**
 * Get currency constants from backend
 * @returns Promise<{CURRENCY_CODE: string, CURRENCY_SYMBOL: string}>
 */
export const getCurrencyConstants = async (): Promise<{CURRENCY_CODE: string, CURRENCY_SYMBOL: string}> => {
  try {
    return await apiCall('/constants');
  } catch (error) {
    console.error('Error fetching currency constants from backend:', error);
    // Fallback to local constants
    return { CURRENCY_CODE, CURRENCY_SYMBOL };
  }
};
