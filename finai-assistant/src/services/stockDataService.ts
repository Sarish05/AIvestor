import { StockData, StockHistoryData, MarketStock } from '../types/stock';

// Backend base URL
const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001';

// Flag to control whether to use real Upstox data or simulated data
let useRealData = true; // Changed to true - use real Upstox data by default

// Cache for mapped NSE to Yahoo Finance symbols
const symbolMappingCache: Record<string, string> = {};

/**
 * Toggle between real Upstox data and simulated data
 */
export const toggleRealData = () => {
  useRealData = !useRealData;
  console.log(`Data source switched to: ${useRealData ? 'Real Upstox' : 'Simulated'}`);
};

/**
 * Check if we're using real Upstox data or simulated
 */
export const isUsingRealData = (): boolean => {
  return useRealData;
};

/**
 * Get Yahoo Finance symbol for a given stock
 */
export const getYahooFinanceSymbol = (symbol: string): string => {
  // Check cache first
  if (symbolMappingCache[symbol]) {
    return symbolMappingCache[symbol];
  }

  // For Indian stocks, typically add .NS suffix
  let yahooSymbol = symbol;
  
  // Handle indices with ^ prefix
  if (symbol === 'NIFTY50') {
    yahooSymbol = '^NSEI';
  } else if (symbol === 'SENSEX') {
    yahooSymbol = '^BSESN';
  } 
  // Regular stock - add .NS suffix unless it already has it
  else if (!symbol.includes('.')) {
    yahooSymbol = `${symbol}.NS`;
  }
  
  // Cache the mapping
  symbolMappingCache[symbol] = yahooSymbol;
  
  return yahooSymbol;
};

/**
 * Fetch stock data for a single symbol
 */
export const fetchStockData = async (symbol: string): Promise<StockData> => {
  try {
    if (useRealData) {
      // Try to get data from backend (which uses Upstox)
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/stocks/market-data?instruments=${symbol}`);
        if (response.ok) {
          const marketData = await response.json();
          if (marketData && marketData.length > 0) {
            // Find the matching stock by symbol
            const stock = marketData.find((s: MarketStock) => 
              s.SYMBOL === (symbol.split(':')[1] || symbol)
            );
            if (stock) {
              return stock;
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching backend stock data for ${symbol}:`, error);
        // Fall back to simulated data if backend fails
      }
    }
    
    // Fall back to backend API using yfinance
    const yahooSymbol = getYahooFinanceSymbol(symbol);
    const response = await fetch(`/api/stock/${yahooSymbol}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    
    // In case of error, return simulated data
    return simulateStockData(symbol);
  }
};

/**
 * Fetch data for multiple stocks
 */
export const fetchMultipleStocks = async (symbols: string[]): Promise<StockData[]> => {
  try {
    if (useRealData) {
      // Try to get data from backend (which uses Upstox)
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/api/stocks/market-data?instruments=${symbols.join(',')}`);
        if (response.ok) {
          const marketData = await response.json();
          if (marketData && marketData.length > 0) {
            // Map requested symbols to found stocks, fall back to simulation if not found
            return symbols.map(symbol => {
              const baseSymbol = symbol.split(':')[1] || symbol;
              const stock = marketData.find((s: MarketStock) => s.SYMBOL === baseSymbol);
              return stock || simulateStockData(baseSymbol);
            });
          }
        }
      } catch (error) {
        console.error('Error fetching backend market data:', error);
        // Fall back to simulated data if backend fails
      }
    }
    
    // Fall back to backend API (yfinance)
    const yahooSymbols = symbols.map(getYahooFinanceSymbol);
    const response = await fetch(`/api/stocks/multiple?symbols=${yahooSymbols.join(',')}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching multiple stocks:', error);
    
    // In case of error, return simulated data for all symbols
    return symbols.map(simulateStockData);
  }
};

/**
 * Fetch historical data for a stock
 */
export const fetchStockHistory = async (symbol: string, interval = '1D'): Promise<StockHistoryData[]> => {
  if (useRealData) {
    try {
      // Use the backend for historical data (which uses Upstox)
      const response = await fetch(`${BACKEND_BASE_URL}/api/stocks/historical-data?symbol=${symbol}&interval=${interval}`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          return data;
        } else {
          console.warn(`No historical data found for ${symbol}, falling back to simulation`);
          return simulateHistoricalData(symbol);
        }
      }
    } catch (error) {
      console.error('Error fetching stock history from backend:', error);
      return simulateHistoricalData(symbol);
    }
  }
  return simulateHistoricalData(symbol);
};

// Simulation helpers
/**
 * Generate simulated stock data for a given symbol
 */
export const simulateStockData = (symbol: string): StockData => {
  const basePrice = 100;
  const change = (Math.random() - 0.5) * 10;
  const price = basePrice + change;
  const changePercent = (change / basePrice) * 100;

  return {
    SYMBOL: symbol,
    NAME: `${symbol} Company`,
    PRICE: price,
    CHANGE: change,
    CHANGE_PERCENT: changePercent,
    VOLUME: Math.floor(Math.random() * 1000000).toString(),
    MARKET_CAP: Math.floor(Math.random() * 1000000000).toString(),
    PREV_CLOSE: basePrice,
    OPEN: basePrice + (Math.random() - 0.5) * 2,
    HIGH: price + Math.random() * 2,
    LOW: price - Math.random() * 2,
    CLOSE: price,
    SECTOR: 'Technology',
    timestamp: new Date(),
    lastUpdated: new Date().toISOString(),
  };
};

/**
 * Generate simulated historical data
 */
export const simulateHistoricalData = (symbol: string): StockHistoryData[] => {
  const data: StockHistoryData[] = [];
  const now = new Date();
  let price = 100;

  for (let i = 20; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 60000); // 1-minute intervals
    const change = (Math.random() - 0.5) * 2; // Random price change
    price += change;

    data.push({
      date,
      open: price,
      high: price + Math.random() * 2,
      low: price - Math.random() * 2,
      close: price,
      volume: Math.floor(Math.random() * 1000000),
    });
  }

  return data;
}; 