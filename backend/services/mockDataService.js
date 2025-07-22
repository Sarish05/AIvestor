// backend/services/mockDataService.js - Mock Data Generation Service
class MockDataService {
  constructor() {
    this.stockSectors = {
      'RELIANCE': 'Oil & Gas',
      'TCS': 'IT',
      'HDFCBANK': 'Banking',
      'ICICIBANK': 'Banking',
      'INFY': 'IT',
      'SBIN': 'Banking',
      'KOTAKBANK': 'Banking',
      'ITC': 'FMCG',
      'BHARTIARTL': 'Telecom',
      'HINDUNILVR': 'FMCG',
      'TATAMOTORS': 'Automobile',
      'MARUTI': 'Automobile',
      'WIPRO': 'IT'
    };

    this.basePrices = {
      'RELIANCE': 2470.75,
      'TCS': 3695.30,
      'HDFCBANK': 1680.50,
      'ICICIBANK': 1031.25,
      'INFY': 1520.80,
      'SBIN': 775.40,
      'KOTAKBANK': 1850.25,
      'ITC': 445.60,
      'BHARTIARTL': 895.30,
      'HINDUNILVR': 2650.45
    };
  }

  // Generate mock market data
  generateMarketMockData(instrumentsList) {
    const mockData = {
      status: 'success',
      data: {}
    };

    instrumentsList.forEach(instrument => {
      const exchange = instrument.split(':')[0] || 'NSE';
      const symbol = instrument.split(':')[1] || instrument;
      const basePrice = this.getBasePrice(symbol);
      
      // Generate realistic price variations
      const changePercent = (Math.random() - 0.5) * 10; // -5% to +5%
      const change = basePrice * (changePercent / 100);
      const lastPrice = parseFloat((basePrice + change).toFixed(2));
      const prevClose = basePrice;
      
      // Generate OHLC data
      const openPrice = parseFloat((prevClose + (Math.random() * 10) - 5).toFixed(2));
      const highPrice = parseFloat((Math.max(lastPrice, openPrice) + (Math.random() * 15)).toFixed(2));
      const lowPrice = parseFloat((Math.min(lastPrice, openPrice) - (Math.random() * 15)).toFixed(2));
      const volume = Math.floor(100000 + Math.random() * 10000000);

      mockData.data[instrument] = {
        SYMBOL: symbol,
        NAME: `${symbol} Ltd.`,
        PRICE: lastPrice,
        CHANGE: parseFloat(change.toFixed(2)),
        CHANGE_PERCENT: parseFloat(changePercent.toFixed(2)),
        VOLUME: volume.toString(),
        MARKET_CAP: (basePrice * 10000000).toString(),
        PREV_CLOSE: prevClose,
        OPEN: openPrice,
        HIGH: highPrice,
        LOW: lowPrice,
        CLOSE: lastPrice,
        SECTOR: this.stockSectors[symbol] || 'Miscellaneous',
        timestamp: new Date(),
        lastUpdated: new Date().toISOString(),
      };
    });

    return mockData;
  }

  // Generate mock historical data
  generateHistoricalMockData(instrument, interval, fromDate, toDate) {
    const mockData = {
      status: 'success',
      data: {
        instrument,
        interval,
        candles: []
      }
    };

    const symbol = instrument.split(':')[1] || instrument;
    let basePrice = this.getBasePrice(symbol);

    // Generate date range
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    let currentDate = new Date(startDate);

    // Determine candle interval in milliseconds
    let candleInterval;
    switch (interval) {
      case '1D':
        candleInterval = 1 / 24; // 1 hour intervals for 1 day
        break;
      case '5D':
        candleInterval = 1; // 1 day intervals
        break;
      case '30D':
        candleInterval = 1; // 1 day intervals
        break;
      case '6M':
        candleInterval = 7; // 1 week intervals
        break;
      case '1Y':
        candleInterval = 30; // 1 month intervals
        break;
      default:
        candleInterval = 1;
    }

    let currentPrice = basePrice;
    const trendFactor = (Math.random() - 0.5) * 0.001; // Small trend

    while (currentDate <= endDate) {
      // Generate OHLC for this candle
      const open = currentPrice;
      const volatility = 0.02; // 2% volatility
      const high = open * (1 + Math.random() * volatility);
      const low = open * (1 - Math.random() * volatility);
      const close = low + Math.random() * (high - low);
      const volume = Math.floor(100000 + Math.random() * 1000000);

      mockData.data.candles.push({
        timestamp: currentDate.toISOString(),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume: volume
      });

      // Advance date based on candle interval
      if (candleInterval < 1) {
        // For hour-based intervals
        currentDate = new Date(currentDate.getTime() + candleInterval * 24 * 60 * 60 * 1000);
      } else {
        // For day/week/month intervals
        currentDate.setDate(currentDate.getDate() + candleInterval);
      }

      // Update current price with small random change plus trend for next point
      currentPrice = close * (0.998 + Math.random() * 0.004 + trendFactor);
    }

    // Sort candles by timestamp (newest first) to match typical API behavior
    mockData.data.candles.reverse();

    return mockData;
  }

  // Get base price for a symbol
  getBasePrice(symbol) {
    return this.basePrices[symbol] || 1000 + Math.random() * 2000;
  }

  // Generate mock portfolio data
  generatePortfolioMockData() {
    return {
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
  }

  // Generate mock search results
  generateSearchMockData(query) {
    const mockResults = [
      {
        symbol: 'NSE:RELIANCE',
        name: 'Reliance Industries Ltd',
        exchange: 'NSE',
        instrument_type: 'EQ'
      },
      {
        symbol: 'NSE:TCS',
        name: 'Tata Consultancy Services Ltd',
        exchange: 'NSE',
        instrument_type: 'EQ'
      },
      {
        symbol: 'NSE:HDFCBANK',
        name: 'HDFC Bank Ltd',
        exchange: 'NSE',
        instrument_type: 'EQ'
      }
    ];

    // Filter results based on query
    const filteredResults = mockResults.filter(stock =>
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.name.toLowerCase().includes(query.toLowerCase())
    );

    return {
      status: 'success',
      data: filteredResults
    };
  }
}

module.exports = new MockDataService();
