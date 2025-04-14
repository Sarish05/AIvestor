// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const upstoxSdk = require('upstox-js-sdk');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Upstox API configuration
const UPSTOX_API_KEY = process.env.UPSTOX_API_KEY;
const UPSTOX_API_SECRET = process.env.UPSTOX_API_SECRET;
const UPSTOX_ACCESS_TOKEN = process.env.UPSTOX_ACCESS_TOKEN;

// Base URL for Upstox API
const UPSTOX_BASE_URL = 'https://api.upstox.com/v2';

// Initialize SDK with your credentials
const upstoxClient = upstoxSdk;

// Mapping of common symbols to Upstox instrument keys
const instrumentKeyMap = {
  'NSE:RELIANCE': 'NSE_EQ|RELIANCE',  // Simplified for testing - real format would be 'NSE_EQ|INE002A01018'
  'NSE:TCS': 'NSE_EQ|TCS',
  'NSE:HDFCBANK': 'NSE_EQ|HDFCBANK',
  'NSE:INFY': 'NSE_EQ|INFY',
  'NSE:HDFC': 'NSE_EQ|HDFC',
  'NSE:ICICIBANK': 'NSE_EQ|ICICIBANK',
  'NSE:SBIN': 'NSE_EQ|SBIN',
  'NSE:BHARTIARTL': 'NSE_EQ|BHARTIARTL',
  'NSE:TATAMOTORS': 'NSE_EQ|TATAMOTORS',
  'NSE:HINDUNILVR': 'NSE_EQ|HINDUNILVR',
  'NSE_INDEX:NIFTY50': 'NSE_INDEX|NIFTY 50',
  'NSE_INDEX:NIFTYBANK': 'NSE_INDEX|NIFTY BANK',
  'NSE:NIFTY50': 'NSE_INDEX|NIFTY 50',
  'NSE:NIFTYBANK': 'NSE_INDEX|NIFTY BANK'
};

// Middleware to add authorization headers
const upstoxAuthMiddleware = (req, res, next) => {
  req.upstoxHeaders = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${UPSTOX_ACCESS_TOKEN}`,
    'Api-Version': '2.0'
  };
  next();
};

// Helper for properly formatting instrument symbols for Upstox API
const formatInstrumentSymbol = (symbol) => {
  if (!symbol) return '';
  
  console.log('Formatting symbol:', symbol);
  
  // Check if this is a common symbol
  if (instrumentKeyMap && instrumentKeyMap[symbol]) {
    console.log(`Using predefined mapping for ${symbol}: ${instrumentKeyMap[symbol]}`);
    return instrumentKeyMap[symbol];
  }
  
  // Handle special cases for indices
  if (symbol.includes('NIFTY')) {
    if (symbol.includes('NIFTY 50') || symbol === 'NSE_INDEX:NIFTY50' || symbol === 'NSE:NIFTY50') {
      return 'NSE_INDEX|NIFTY 50';
    } else if (symbol.includes('NIFTY BANK') || symbol === 'NSE_INDEX:NIFTYBANK' || symbol === 'NSE:NIFTYBANK') {
      return 'NSE_INDEX|NIFTY BANK';
    }
  }
  
  // For NSE stocks, the standard format is NSE_EQ|[ISIN]
  // But Upstox API also accepts NSE_EQ|[SYMBOL] format
  const parts = symbol.split(':');
  if (parts.length !== 2) return symbol;
  
  let exchange = parts[0];
  const symbolName = parts[1];
  
  // Convert exchange formats
  if (exchange === 'NSE' && !symbolName.includes('NIFTY')) {
    exchange = 'NSE_EQ';
  } else if (exchange === 'BSE') {
    exchange = 'BSE_EQ';
  }
  
  // Support both NSE_EQ|SYMBOL and NSE|SYMBOL formats
  const formattedSymbol = `${exchange}|${symbolName}`;
  console.log(`Formatted ${symbol} to ${formattedSymbol}`);
  return formattedSymbol;
};

// Helper function for Upstox API calls
const callUpstoxApi = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${UPSTOX_BASE_URL}${endpoint}`, {
      headers: {
        'Accept': 'application/json',
        'Api-Version': '2.0',
        'Authorization': `Bearer ${UPSTOX_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'x-api-key': UPSTOX_API_KEY
      },
      params
    });
    return response.data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error.response?.data || error.message);
    throw error;
  }
};

// Get market quotes for specified instruments - SIMPLIFIED FOR RELIABILITY
app.get('/api/market-data', upstoxAuthMiddleware, async (req, res) => {
  try {
    const { instruments } = req.query;
    
    if (!instruments) {
      return res.status(400).json({ error: 'Instruments parameter is required' });
    }
    
    // Check if API credentials are available
    if (!UPSTOX_API_KEY || !UPSTOX_ACCESS_TOKEN) {
      console.warn('API credentials missing, using mock data');
      return sendMockData(instruments, res);
    }
    
    // Format instruments for API request
    const instrumentsList = instruments.split(',');
    const formattedInstruments = instrumentsList.map(formatInstrumentSymbol);
    
    console.log('Fetching quotes for:', formattedInstruments);
    
    // Try to get full market quotes first
    try {
      const marketData = await callUpstoxApi('/market-quote/quotes', {
        instrument_key: formattedInstruments.join(',')
      });
      
      console.log('Quotes API response:', JSON.stringify(marketData, null, 2));
      
      // Transform response to format expected by frontend
      const transformedData = {
        status: 'success',
        data: {}
      };
      
      if (marketData && marketData.data) {
        Object.entries(marketData.data).forEach(([key, value]) => {
          // Map back to frontend format
          let originalKey = instrumentsList.find(
            inst => formatInstrumentSymbol(inst) === key
          ) || key;
          
          // If not found, try to reconstruct it
          if (originalKey === key) {
            const parts = key.split('|');
            if (parts.length === 2) {
              let exchange = parts[0];
              const symbolName = parts[1];
              
              if (exchange === 'NSE_EQ') {
                exchange = 'NSE';
              }
              
              originalKey = `${exchange}:${symbolName}`;
            }
          }
          
          transformedData.data[originalKey] = {
            SYMBOL: originalKey.split(':')[1] || '',
            NAME: value.instrument_name || originalKey.split(':')[1] || '',
            PRICE: value.last_price || 0,
            CHANGE: value.last_price - (value.close_price || value.last_price),
            CHANGE_PERCENT: ((value.last_price - (value.close_price || value.last_price)) / (value.close_price || value.last_price) * 100) || 0,
            VOLUME: value.volume || 0,
            MARKET_CAP: '',
            PREV_CLOSE: value.close_price || 0,
            OPEN: value.open_price || 0,
            HIGH: value.high_price || 0,
            LOW: value.low_price || 0,
            CLOSE: value.close_price || value.last_price || 0,
            SECTOR: '',
            timestamp: new Date(),
            lastUpdated: new Date().toISOString()
          };
        });
      }
      
      return res.json(transformedData);
    } catch (quotesError) {
      console.error('Full quotes API failed:', quotesError.message);
      
      // Check for authentication error specifically
      if (quotesError.response?.data?.errors?.[0]?.errorCode === 'UDAPI100068') {
        console.error('Authentication error: Invalid client_id or redirect_uri');
        // For authentication errors, go straight to mock data
        return sendMockData(instruments, res);
      }
      
      // Try LTP API as fallback
      try {
        const ltpData = await callUpstoxApi('/market-quote/ltp', {
          instrument_key: formattedInstruments.join(',')
        });
        
        console.log('LTP API response:', JSON.stringify(ltpData, null, 2));
        
        const transformedData = {
          status: 'success',
          data: {}
        };
        
        if (ltpData && ltpData.data) {
          Object.entries(ltpData.data).forEach(([key, value]) => {
            // Map back to frontend format
            let originalKey = instrumentsList.find(
              inst => formatInstrumentSymbol(inst) === key
            ) || key;
            
            // If not found, try to reconstruct it
            if (originalKey === key) {
              const parts = key.split('|');
              if (parts.length === 2) {
                let exchange = parts[0];
                const symbolName = parts[1];
                
                if (exchange === 'NSE_EQ') {
                  exchange = 'NSE';
                }
                
                originalKey = `${exchange}:${symbolName}`;
              }
            }
            
            transformedData.data[originalKey] = {
              SYMBOL: originalKey.split(':')[1] || '',
              NAME: originalKey.split(':')[1] || '',
              PRICE: value.last_price || 0,
              CHANGE: 0,
              CHANGE_PERCENT: 0,
              VOLUME: 0,
              MARKET_CAP: '',
              PREV_CLOSE: value.last_price || 0,
              OPEN: value.last_price || 0,
              HIGH: value.last_price || 0,
              LOW: value.last_price || 0,
              CLOSE: value.last_price || 0,
              SECTOR: '',
              timestamp: new Date(),
              lastUpdated: new Date().toISOString()
            };
          });
        }
        
        return res.json(transformedData);
      } catch (ltpError) {
        console.error('LTP API failed:', ltpError.message);
        // Fall back to mock data
        return sendMockData(instruments, res);
      }
    }
  } catch (error) {
    console.error('Market data error:', error.message);
    return sendMockData(req.query.instruments, res);
  }
});

// Get market feed (real-time updates)
app.get('/api/market-feed', upstoxAuthMiddleware, async (req, res) => {
  try {
    const { instruments } = req.query;
    
    if (!instruments) {
      return res.status(400).json({ error: 'Instruments parameter is required' });
    }
    
    const instrumentsList = instruments.split(',');
    
    // Always return mock data for reliability during development
    const mockData = generateFeedMockData(instrumentsList);
    res.json(mockData);
    
  } catch (error) {
    console.error('Error fetching market feed:', error.message);
    const mockData = generateFeedMockData(['NSE:RELIANCE']);
    res.json(mockData);
  }
});

// Get historical data
app.get('/api/historical-data', upstoxAuthMiddleware, async (req, res) => {
  try {
    const { instrument, interval, from_date, to_date } = req.query;
    
    if (!instrument || !interval) {
      return res.status(400).json({ error: 'Instrument and interval parameters are required' });
    }
    
    // Always return mock data for reliability during development
    const mockData = generateHistoricalMockData(
      instrument,
      interval || '1d',
      from_date || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      to_date || new Date().toISOString()
    );
    
    res.json(mockData);
    
  } catch (error) {
    console.error('Error fetching historical data:', error.message);
    const mockData = generateHistoricalMockData(
      req.query.instrument || 'NSE:RELIANCE',
      req.query.interval || '1d'
    );
    res.json(mockData);
  }
});

// Get portfolio holdings
app.get('/api/portfolio', upstoxAuthMiddleware, async (req, res) => {
  try {
    // Return mock portfolio data
    const mockPortfolio = {
      status: 'success',
      data: {
        holdings: [
          {
            symbol: 'NSE:RELIANCE',
            quantity: 10,
            average_price: 2500.00,
            last_price: 2650.75,
            pnl: 1507.50,
            day_change_percentage: 0.75
          },
          {
            symbol: 'NSE:TCS',
            quantity: 5,
            average_price: 3400.00,
            last_price: 3550.25,
            pnl: 751.25,
            day_change_percentage: 1.2
          },
          {
            symbol: 'NSE:HDFCBANK',
            quantity: 15,
            average_price: 1600.00,
            last_price: 1575.50,
            pnl: -367.50,
            day_change_percentage: -0.5
          }
        ]
      }
    };
    
    res.json(mockPortfolio);
    
  } catch (error) {
    console.error('Error fetching portfolio:', error.message);
    res.status(500).json({ error: 'Error fetching portfolio' });
  }
});

// Search instruments
app.get('/api/search-instruments', upstoxAuthMiddleware, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }
    
    // Mock search results
    const mockResults = {
      status: 'success',
      data: [
        {
          symbol: 'NSE:RELIANCE',
          name: 'Reliance Industries Ltd',
          exchange: 'NSE'
        },
        {
          symbol: 'NSE:RELIANCEPP',
          name: 'Reliance PP',
          exchange: 'NSE'
        },
        {
          symbol: 'NSE:RELCAPITAL',
          name: 'Reliance Capital',
          exchange: 'NSE'
        },
        {
          symbol: 'NSE:RELAXO',
          name: 'Relaxo Footwears',
          exchange: 'NSE'
        }
      ].filter(item => 
        item.symbol.toLowerCase().includes(query.toLowerCase()) || 
        item.name.toLowerCase().includes(query.toLowerCase())
      )
    };
    
    res.json(mockResults);
    
  } catch (error) {
    console.error('Error searching instruments:', error.message);
    res.status(500).json({ error: 'Error searching instruments' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Mock data generation functions
function generateMarketMockData(instrumentsList) {
  const mockData = {
    status: 'success',
    data: {}
  };
  
  instrumentsList.forEach(instrument => {
    // Get base price for this symbol
    const basePrice = getBasePrice(instrument);
    
    // Add some random variation
    const variation = (Math.random() * 20) - 10; // -10 to +10
    const currentPrice = basePrice + (basePrice * variation / 1000);
    
    // Create mock market data object
    mockData.data[instrument] = {
      SYMBOL: instrument.split(':')[1] || instrument,
      EXCHANGE: instrument.split(':')[0] || 'NSE',
      PRICE: parseFloat(currentPrice.toFixed(2)),
      CHANGE: parseFloat((variation/10).toFixed(2)),
      CHANGE_PERCENT: parseFloat(((variation/10)).toFixed(2)),
      HIGH: parseFloat((currentPrice * 1.02).toFixed(2)),
      LOW: parseFloat((currentPrice * 0.98).toFixed(2)),
      OPEN: parseFloat((basePrice - (basePrice * (Math.random() * 5) / 1000)).toFixed(2)),
      CLOSE: basePrice,
      TOTAL_QUANTITY: Math.floor(100000 + Math.random() * 900000),
      TIMESTAMP: new Date().toISOString()
    };
  });
  
  return mockData;
}

function generateFeedMockData(instrumentsList) {
  return generateMarketMockData(instrumentsList);
}

function generateHistoricalMockData(instrument, interval, from_date, to_date) {
  // Default to 30 days if dates not provided
  const fromDate = from_date ? new Date(from_date) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const toDate = to_date ? new Date(to_date) : new Date();
  
  // Calculate number of data points based on interval
  let dataPoints = 30; // default
  
  if (interval === '1m') {
    dataPoints = Math.min(100, Math.ceil((toDate - fromDate) / (60 * 1000)));
  } else if (interval === '5m') {
    dataPoints = Math.min(100, Math.ceil((toDate - fromDate) / (5 * 60 * 1000)));
  } else if (interval === '15m') {
    dataPoints = Math.min(100, Math.ceil((toDate - fromDate) / (15 * 60 * 1000)));
  } else if (interval === '30m') {
    dataPoints = Math.min(100, Math.ceil((toDate - fromDate) / (30 * 60 * 1000)));
  } else if (interval === '1h') {
    dataPoints = Math.min(100, Math.ceil((toDate - fromDate) / (60 * 60 * 1000)));
  } else if (interval === '1d') {
    dataPoints = Math.min(100, Math.ceil((toDate - fromDate) / (24 * 60 * 60 * 1000)));
  } else if (interval === '1w') {
    dataPoints = Math.min(100, Math.ceil((toDate - fromDate) / (7 * 24 * 60 * 60 * 1000)));
  } else if (interval === '1mo') {
    dataPoints = Math.min(100, Math.ceil((toDate - fromDate) / (30 * 24 * 60 * 60 * 1000)));
  }
  
  // Cap number of points
  dataPoints = Math.min(100, dataPoints);
  
  // Get base price for this symbol
  const basePrice = getBasePrice(instrument);
  
  // Generate historical data series
  const candles = [];
  let currentPrice = basePrice;
  
  for (let i = 0; i < dataPoints; i++) {
    // Calculate time for this point
    const timestamp = new Date(fromDate.getTime() + ((toDate - fromDate) * i / dataPoints));
    
    // Add some random price movement
    const changePercent = (Math.random() * 2) - 1; // -1% to +1%
    currentPrice = currentPrice * (1 + (changePercent / 100));
    
    // Create range for high/low
    const range = currentPrice * (0.5 + Math.random()) / 100;
    const high = currentPrice + range;
    const low = currentPrice - range;
    
    // Generate realistic open/close in this range
    const open = low + Math.random() * (high - low);
    const close = low + Math.random() * (high - low);
    
    candles.push({
      timestamp: timestamp.toISOString(),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(10000 + Math.random() * 90000)
    });
  }
  
  return {
    status: 'success',
    data: {
      candles: candles
    }
  };
}

function getBasePrice(symbol) {
  // Base prices for common stocks (purely fictional)
  const basePrices = {
    'NSE:RELIANCE': 2650.0,
    'NSE:TCS': 3550.0, 
    'NSE:HDFCBANK': 1575.0,
    'NSE:INFY': 1450.0,
    'NSE:HDFC': 2800.0,
    'NSE:ICICIBANK': 950.0,
    'NSE:SBIN': 620.0,
    'NSE:BHARTIARTL': 875.0,
    'NSE:TATAMOTORS': 750.0,
    'NSE:HINDUNILVR': 2450.0,
    'NSE:NIFTY50': 22250.0,
    'NSE_INDEX:NIFTY50': 22250.0,
    'NSE:NIFTYBANK': 48000.0,
    'NSE_INDEX:NIFTYBANK': 48000.0
  };
  
  if (basePrices[symbol]) {
    return basePrices[symbol];
  }
  
  // Generate a somewhat realistic random price based on the symbol's first letter
  const firstChar = (symbol.split(':')[1] || symbol).charAt(0).toUpperCase();
  const charCode = firstChar.charCodeAt(0) - 65; // A=0, Z=25
  
  // Generate from char code to get consistency for same symbols
  return 500 + (charCode * 100) + (Math.floor(charCode / 5) * 500);
}

// Helper function to generate mock data
function sendMockData(instruments, res) {
  const mockData = {
    status: 'success',
    data: {}
  };
  
  const instrumentsList = instruments.split(',');
  instrumentsList.forEach(instrument => {
    const symbol = instrument.split(':')[1] || instrument;
    // Generate consistent prices for each symbol
    const basePrice = getBasePrice(symbol);
    const variation = (Math.random() * 20) - 10; // -10 to +10
    const currentPrice = basePrice + (basePrice * variation / 1000);
    
    mockData.data[instrument] = {
      SYMBOL: symbol,
      NAME: `${symbol} Stock`,
      PRICE: parseFloat(currentPrice.toFixed(2)),
      CHANGE: parseFloat((variation/10).toFixed(2)),
      CHANGE_PERCENT: parseFloat(((variation/10)).toFixed(2)),
      VOLUME: Math.floor(100000 + Math.random() * 900000).toString(),
      MARKET_CAP: `${Math.floor(Math.random() * 100000)} Cr`,
      PREV_CLOSE: basePrice,
      OPEN: parseFloat((basePrice - (basePrice * (Math.random() * 5) / 1000)).toFixed(2)),
      HIGH: parseFloat((currentPrice * 1.02).toFixed(2)),
      LOW: parseFloat((currentPrice * 0.98).toFixed(2)),
      CLOSE: basePrice,
      SECTOR: getSector(symbol),
      timestamp: new Date(),
      lastUpdated: new Date().toISOString()
    };
  });
  
  console.warn('Using mock data as fallback');
  return res.json(mockData);
}

// Helper to generate sector
function getSector(symbol) {
  const sectors = ['Technology', 'Finance', 'Energy', 'Healthcare', 'Consumer Goods'];
  // Generate consistent sector for a given symbol
  const charSum = symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return sectors[charSum % sectors.length];
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Key present: ${Boolean(UPSTOX_API_KEY)}`);
  console.log(`Access Token present: ${Boolean(UPSTOX_ACCESS_TOKEN)}`);
}); 