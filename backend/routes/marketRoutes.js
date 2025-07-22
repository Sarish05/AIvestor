// backend/routes/marketRoutes.js - General Market Data Routes
const express = require('express');
const router = express.Router();

// Market status and general information
router.get('/status', (req, res) => {
  // Get current Indian market status
  const now = new Date();
  const indiaTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const marketOpen = indiaTime.getHours() >= 9 && indiaTime.getHours() < 16;
  const isWeekday = indiaTime.getDay() >= 1 && indiaTime.getDay() <= 5;
  const isMarketOpen = marketOpen && isWeekday;

  res.json({
    status: 'success',
    data: {
      market_open: isMarketOpen,
      current_time: indiaTime.toISOString(),
      market_hours: '09:15 - 15:30 IST',
      timezone: 'Asia/Kolkata'
    }
  });
});

// Market indices information
router.get('/indices', (req, res) => {
  res.json({
    status: 'success',
    data: [
      {
        name: 'NIFTY 50',
        symbol: 'NSE_INDEX:NIFTY50',
        description: 'Top 50 companies by market cap'
      },
      {
        name: 'NIFTY BANK',
        symbol: 'NSE_INDEX:NIFTYBANK',
        description: 'Banking sector index'
      },
      {
        name: 'SENSEX',
        symbol: 'BSE_INDEX:SENSEX',
        description: 'BSE 30 stock index'
      }
    ]
  });
});

// Popular stocks list
router.get('/popular-stocks', (req, res) => {
  res.json({
    status: 'success',
    data: [
      { symbol: 'NSE:RELIANCE', name: 'Reliance Industries Ltd' },
      { symbol: 'NSE:TCS', name: 'Tata Consultancy Services Ltd' },
      { symbol: 'NSE:HDFCBANK', name: 'HDFC Bank Ltd' },
      { symbol: 'NSE:ICICIBANK', name: 'ICICI Bank Ltd' },
      { symbol: 'NSE:INFY', name: 'Infosys Ltd' },
      { symbol: 'NSE:SBIN', name: 'State Bank of India' },
      { symbol: 'NSE:BHARTIARTL', name: 'Bharti Airtel Ltd' },
      { symbol: 'NSE:ITC', name: 'ITC Ltd' },
      { symbol: 'NSE:KOTAKBANK', name: 'Kotak Mahindra Bank Ltd' },
      { symbol: 'NSE:HINDUNILVR', name: 'Hindustan Unilever Ltd' }
    ]
  });
});

module.exports = router;
