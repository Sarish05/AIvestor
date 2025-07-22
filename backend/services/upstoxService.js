// backend/services/upstoxService.js - Upstox API Service
const axios = require('axios');
const { upstoxConfig, instrumentKeyMap } = require('../config/upstox');

class UpstoxService {
  constructor() {
    this.baseUrl = upstoxConfig.baseUrl;
    this.headers = upstoxConfig.getHeaders();
  }

  // Make API call to Upstox
  async makeApiCall(endpoint, params = {}, retryCount = 0) {
    try {
      if (!upstoxConfig.isConfigured()) {
        throw new Error('Upstox API credentials not configured');
      }

      console.log(`Making API call to ${endpoint} with params:`, params);

      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        headers: this.headers,
        params
      });

      console.log(`Response status from ${endpoint}:`, response.status);
      return response.data;
    } catch (error) {
      const errorDetails = error.response?.data || error.message;
      console.error(`API Error (${endpoint}):`, JSON.stringify(errorDetails));

      // Check if this is an auth error and we haven't retried too many times
      if (error.response?.status === 401 && retryCount === 0) {
        console.log("Authentication error detected. Consider refreshing your token via Upstox Developer Portal.");
      }

      throw error;
    }
  }

  // Format instrument symbol for API
  formatInstrumentSymbol(symbol) {
    // Try exact match first
    if (instrumentKeyMap[symbol]) {
      return instrumentKeyMap[symbol];
    }

    // Parse symbol format like "NSE:RELIANCE"
    const parts = symbol.split(':');
    if (parts.length !== 2) {
      console.warn(`Invalid symbol format: ${symbol}. Expected format: EXCHANGE:SYMBOL`);
      return symbol;
    }

    const [exchange, symbolName] = parts;
    let formattedExchange = exchange;

    // Map exchange names
    switch (exchange.toUpperCase()) {
      case 'NSE':
        formattedExchange = 'NSE_EQ';
        break;
      case 'BSE':
        formattedExchange = 'BSE_EQ';
        break;
      case 'NSE_INDEX':
        formattedExchange = 'NSE_INDEX';
        break;
      default:
        formattedExchange = exchange;
    }

    const formatted = `${formattedExchange}|${symbolName}`;
    console.log(`Warning: Using fallback formatting ${formatted} for ${symbol}`);
    return formatted;
  }

  // Get market quotes
  async getMarketQuotes(instruments) {
    const instrumentsList = instruments.split(',');
    const formattedInstruments = instrumentsList.map(inst => this.formatInstrumentSymbol(inst));

    console.log('Fetching quotes for:', formattedInstruments);

    try {
      const marketData = await this.makeApiCall('/market-quote/quotes', {
        instrument_key: formattedInstruments.join(',')
      });

      return this.transformQuotesResponse(marketData, instrumentsList);
    } catch (quotesError) {
      console.error('Full quotes API failed:', quotesError.message);

      // Try LTP API as fallback
      try {
        const ltpData = await this.makeApiCall('/market-quote/ltp', {
          instrument_key: formattedInstruments.join(',')
        });

        return this.transformLtpResponse(ltpData, instrumentsList);
      } catch (ltpError) {
        console.error('LTP API failed:', ltpError.message);
        throw new Error('Both quote APIs failed');
      }
    }
  }

  // Transform quotes API response
  transformQuotesResponse(marketData, originalInstruments) {
    const transformedData = {
      status: 'success',
      data: {}
    };

    if (marketData && marketData.data) {
      Object.entries(marketData.data).forEach(([key, value]) => {
        const originalKey = this.findOriginalKey(key, originalInstruments);
        const lastPrice = value.last_price || 0;
        const closePrice = value.close_price || 0;
        const change = lastPrice - closePrice;
        const changePercent = closePrice > 0 ? (change / closePrice) * 100 : 0;

        transformedData.data[originalKey] = {
          instrument: {
            exchange: originalKey.split(':')[0] || '',
            name: originalKey.split(':')[1] || originalKey
          },
          last_price: lastPrice,
          prev_close: closePrice,
          change: parseFloat(change.toFixed(2)),
          change_percent: parseFloat(changePercent.toFixed(2)),
          ohlc: {
            open: value.open_price || 0,
            high: value.high_price || 0,
            low: value.low_price || 0
          },
          volume: value.volume || 0,
          last_updated: new Date().toISOString()
        };
      });
    }

    return transformedData;
  }

  // Transform LTP API response
  transformLtpResponse(ltpData, originalInstruments) {
    const transformedData = {
      status: 'success',
      data: {}
    };

    if (ltpData && ltpData.data) {
      Object.entries(ltpData.data).forEach(([key, value]) => {
        const originalKey = this.findOriginalKey(key, originalInstruments);

        transformedData.data[originalKey] = {
          instrument: {
            exchange: originalKey.split(':')[0] || '',
            name: originalKey.split(':')[1] || originalKey
          },
          last_price: value.last_price || 0,
          last_updated: new Date().toISOString()
        };
      });
    }

    return transformedData;
  }

  // Find original instrument key
  findOriginalKey(formattedKey, originalInstruments) {
    let originalKey = originalInstruments.find(
      inst => this.formatInstrumentSymbol(inst) === formattedKey
    ) || formattedKey;

    // If not found, try to reconstruct it
    if (originalKey === formattedKey) {
      const parts = formattedKey.split('|');
      if (parts.length === 2) {
        let exchange = parts[0];
        const symbolName = parts[1];

        if (exchange === 'NSE_EQ') {
          exchange = 'NSE';
        }

        originalKey = `${exchange}:${symbolName}`;
      }
    }

    return originalKey;
  }

  // Get historical data
  async getHistoricalData(instrument, interval, fromDate, toDate) {
    const formattedInstrument = this.formatInstrumentSymbol(instrument);
    
    // Determine endpoint and interval based on the request
    let apiEndpoint;
    let upstoxInterval = interval;

    // Map frontend intervals to Upstox intervals
    switch (interval) {
      case '1D':
        upstoxInterval = '1minute';
        apiEndpoint = `/historical-candle/intraday/${formattedInstrument}/${upstoxInterval}`;
        break;
      case '5D':
      case '30D':
        upstoxInterval = 'day';
        apiEndpoint = `/historical-candle/${formattedInstrument}/${upstoxInterval}/${toDate}/${fromDate}`;
        break;
      case '6M':
      case '1Y':
        upstoxInterval = 'week';
        apiEndpoint = `/historical-candle/${formattedInstrument}/${upstoxInterval}/${toDate}/${fromDate}`;
        break;
      default:
        upstoxInterval = 'day';
        apiEndpoint = `/historical-candle/${formattedInstrument}/${upstoxInterval}/${toDate}/${fromDate}`;
    }

    console.log(`Using API endpoint: ${apiEndpoint}`);

    try {
      const historicalData = await this.makeApiCall(apiEndpoint);
      return this.transformHistoricalData(historicalData, instrument, interval);
    } catch (error) {
      console.error('Historical data API error:', error.message);
      throw error;
    }
  }

  // Transform historical data response
  transformHistoricalData(historicalData, instrument, interval) {
    const transformedData = {
      status: 'success',
      data: {
        instrument,
        interval,
        candles: []
      }
    };

    if (historicalData && historicalData.data && historicalData.data.candles) {
      transformedData.data.candles = historicalData.data.candles.map(candle => {
        if (Array.isArray(candle)) {
          return {
            timestamp: candle[0],
            open: parseFloat(candle[1]),
            high: parseFloat(candle[2]),
            low: parseFloat(candle[3]),
            close: parseFloat(candle[4]),
            volume: parseFloat(candle[5] || 0)
          };
        }
        return candle;
      }).filter(candle => candle !== undefined);
    }

    return transformedData;
  }
}

module.exports = new UpstoxService();
