// backend/config/upstox.js - Upstox Configuration
require('dotenv').config();

const upstoxConfig = {
  apiKey: process.env.UPSTOX_API_KEY,
  apiSecret: process.env.UPSTOX_API_SECRET,
  accessToken: process.env.UPSTOX_ACCESS_TOKEN,
  baseUrl: 'https://api.upstox.com/v2',
  
  // Request headers for Upstox API
  getHeaders() {
    return {
      'Accept': 'application/json',
      'Api-Version': '2.0',
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey
    };
  },

  // Check if credentials are configured
  isConfigured() {
    return !!(this.apiKey && this.accessToken);
  }
};

// Common NSE symbols mapping to Upstox instrument keys
const instrumentKeyMap = {
  'NSE:RELIANCE': 'NSE_EQ|INE002A01018',
  'NSE:TCS': 'NSE_EQ|INE467B01029',
  'NSE:HDFCBANK': 'NSE_EQ|INE040A01034',
  'NSE:INFY': 'NSE_EQ|INE009A01021',
  'NSE:ICICIBANK': 'NSE_EQ|INE090A01021',
  'NSE:SBIN': 'NSE_EQ|INE062A01020',
  'NSE:BHARTIARTL': 'NSE_EQ|INE397D01024',
  'NSE:KOTAKBANK': 'NSE_EQ|INE237A01028',
  'NSE:HINDUNILVR': 'NSE_EQ|INE030A01027',
  'NSE:ITC': 'NSE_EQ|INE154A01025',
  'NSE:LT': 'NSE_EQ|INE018A01030',
  'NSE:AXISBANK': 'NSE_EQ|INE238A01034',
  'NSE:BAJFINANCE': 'NSE_EQ|INE296A01024',
  'NSE:ASIANPAINT': 'NSE_EQ|INE021A01026',
  'NSE:WIPRO': 'NSE_EQ|INE075A01022',
  'NSE:TITAN': 'NSE_EQ|INE280A01028',
  'NSE:TATASTEEL': 'NSE_EQ|INE081A01012',
  'NSE:ADANIPORTS': 'NSE_EQ|INE742F01042',
  'NSE:HCLTECH': 'NSE_EQ|INE860A01027',
  'NSE:SUNPHARMA': 'NSE_EQ|INE044A01036',
  'NSE:INDUSINDBK': 'NSE_EQ|INE095A01012',
  'NSE:TECHM': 'NSE_EQ|INE669C01036',
  'NSE_INDEX:NIFTY50': 'NSE_INDEX|NIFTY 50',
  'NSE_INDEX:NIFTYBANK': 'NSE_INDEX|NIFTY BANK'
};

module.exports = {
  upstoxConfig,
  instrumentKeyMap
};
