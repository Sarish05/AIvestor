import { MarketStock, StockHistoryData } from '../types/stock';

// Simple Upstox service using your manual tokens approach
const UPSTOX_BASE_URL = 'https://api.upstox.com/v2';

// Note: You need to add REACT_APP_UPSTOX_ACCESS_TOKEN to your frontend .env
const getUpstoxHeaders = () => {
  const token = process.env.REACT_APP_UPSTOX_ACCESS_TOKEN;
  if (!token) {
    console.warn('REACT_APP_UPSTOX_ACCESS_TOKEN not found in environment');
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
};

/**
 * Fetch real-time market data directly from Upstox API
 */
export const fetchMarketData = async (symbols: string[]): Promise<MarketStock[]> => {
  try {
    const headers = getUpstoxHeaders();
    if (!headers.Authorization) {
      throw new Error('Upstox access token not configured');
    }

    // Convert symbols to Upstox format
    const upstoxSymbols = symbols.map(symbol => `NSE_EQ:${symbol}`);
    const instrumentsParam = upstoxSymbols.join(',');
    
    const response = await fetch(`${UPSTOX_BASE_URL}/market-data/ltp?instrument_key=${instrumentsParam}`, {
      method: 'GET',
      headers
    });
    
    if (!response.ok) {
      throw new Error(`Upstox API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'success' && data.data) {
      return Object.entries(data.data).map(([key, value]: [string, any]) => {
        const symbol = key.replace('NSE_EQ:', '');
        return {
          SYMBOL: symbol,
          NAME: symbol,
          PRICE: value.last_price || 0,
          CHANGE: value.day_change || 0,
          CHANGE_PERCENT: value.day_change_percentage || 0,
          VOLUME: value.volume?.toString() || '0',
          MARKET_CAP: '0',
          PREV_CLOSE: value.prev_close || value.last_price || 0,
          OPEN: value.ohlc?.open || value.last_price || 0,
          HIGH: value.ohlc?.high || value.last_price || 0,
          LOW: value.ohlc?.low || value.last_price || 0,
          CLOSE: value.last_price || 0,
          SECTOR: 'Unknown',
          timestamp: new Date(),
          lastUpdated: value.last_update_time || new Date().toISOString()
        } as MarketStock;
      });
    }
    
    throw new Error('Invalid response format from Upstox API');
  } catch (error) {
    console.error('Error fetching Upstox market data:', error);
    throw error;
  }
};

/**
 * Fetch historical data directly from Upstox API
 */
export const fetchHistoricalData = async (
  symbol: string, 
  interval: string = '1day'
): Promise<StockHistoryData[]> => {
  try {
    const headers = getUpstoxHeaders();
    if (!headers.Authorization) {
      throw new Error('Upstox access token not configured');
    }

    const instrumentKey = `NSE_EQ:${symbol}`;
    const toDate = new Date().toISOString().split('T')[0];
    const fromDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const response = await fetch(
      `${UPSTOX_BASE_URL}/historical-candle/${instrumentKey}/${interval}/${toDate}/${fromDate}`,
      {
        method: 'GET',
        headers
      }
    );
    
    if (!response.ok) {
      throw new Error(`Upstox API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'success' && data.data && data.data.candles) {
      return data.data.candles.map((candle: any[]) => ({
        date: candle[0],
        open: candle[1],
        high: candle[2],
        low: candle[3],
        close: candle[4],
        volume: candle[5] || 0,
        adj_close: candle[4]
      }));
    }
    
    throw new Error('Invalid historical data format from Upstox API');
  } catch (error) {
    console.error('Error fetching Upstox historical data:', error);
    throw error;
  }
};

/**
 * Check if Upstox service is available
 */
export const checkServiceStatus = async (): Promise<boolean> => {
  try {
    const headers = getUpstoxHeaders();
    if (!headers.Authorization) {
      return false;
    }
    
    const response = await fetch(`${UPSTOX_BASE_URL}/user/profile`, {
      method: 'GET',
      headers
    });
    
    return response.ok;
  } catch (error) {
    console.error('Upstox service check failed:', error);
    return false;
  }
};

// Setup market feed function for compatibility with existing code
export const setupMarketFeed = (symbols: string[], callback: (stock: MarketStock) => void): (() => void) => {
  let intervalId: NodeJS.Timeout;
  
  const fetchData = async () => {
    try {
      const marketData = await fetchMarketData(symbols);
      marketData.forEach(callback);
    } catch (error) {
      console.error('Market feed error:', error);
    }
  };
  
  // Initial fetch
  fetchData();
  
  // Set up interval for periodic updates (every 5 seconds)
  intervalId = setInterval(fetchData, 5000);
  
  // Return cleanup function
  return () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };
};

export const upstoxService = {
  fetchMarketData,
  fetchHistoricalData,
  checkServiceStatus,
  setupMarketFeed
};

export default upstoxService;
