# AIvestor Stock Data API

This module provides real-time stock data integration using Yahoo Finance's yfinance library, specially customized for Indian markets (NSE).

## Features

- **Real-time stock data** from Yahoo Finance
- **Support for Indian stocks** (NSE) and indices
- **Automatic symbol mapping** (users can enter TCS instead of TCS.NS)
- **Historical data** for price charts
- **Multiple stocks endpoint** for efficient batch requests

## API Endpoints

### Get Stock Data

```
GET /api/stock/<symbol>
```

Example:
```
GET /api/stock/TCS
GET /api/stock/NIFTY50
```

Response:
```json
{
  "symbol": "TCS",
  "name": "Tata Consultancy Services Limited",
  "price": 3567.45,
  "change": 32.75,
  "changePercentage": 0.92,
  "open": 3534.70,
  "high": 3570.30,
  "low": 3530.25,
  "volume": "2.3M",
  "marketCap": "₹1.31T",
  "previousClose": 3534.70,
  "sector": "Technology",
  "timestamp": "2023-07-21T15:30:00Z"
}
```

### Get Historical Data

```
GET /api/stock/<symbol>/history?period=<period>&interval=<interval>
```

Parameters:
- `period`: 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y, max
- `interval`: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo

Example:
```
GET /api/stock/HDFCBANK/history?period=1mo&interval=1d
```

### Get Multiple Stocks

```
POST /api/stocks/multiple
```

Request Body:
```json
{
  "symbols": ["TCS", "HDFCBANK", "RELIANCE"]
}
```

### Get Top Stocks

```
GET /api/market/top-stocks
```

## Integration with yfinance

The API uses the yfinance Python library to fetch data from Yahoo Finance. Stock symbols are automatically mapped to their Yahoo Finance equivalents:

- **Regular stocks**: TCS → TCS.NS
- **Indices**: NIFTY50 → ^NSEI, BANKNIFTY → ^NSEBANK

## Running the Application

1. Install required packages:
   ```
   pip install flask flask-cors yfinance
   ```

2. Make sure the `api` directory is in your Python path

3. The stock data routes will be automatically registered when the app starts

## Customizing the Stock List

You can modify the stock symbols in `nseSymbolMapping.ts` to add or update stock mappings based on your requirements. 