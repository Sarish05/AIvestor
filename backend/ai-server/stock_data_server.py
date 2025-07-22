# backend/ai-server/stock_data_server.py - Yahoo Finance Stock Data Server
from flask import Flask, jsonify, request
import yfinance as yf
import pandas as pd
from datetime import datetime
import time
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Common NSE stocks mapping
common_stocks = {
    "hdfc bank": "HDFCBANK",
    "hdfc": "HDFCBANK",
    "reliance": "RELIANCE",
    "reliance industries": "RELIANCE",
    "tcs": "TCS",
    "tata consultancy services": "TCS",
    "infosys": "INFY",
    "icici bank": "ICICIBANK",
    "icici": "ICICIBANK",
    "sbi": "SBIN",
    "state bank of india": "SBIN",
    "axis bank": "AXISBANK",
    "axis": "AXISBANK",
    "bharti airtel": "BHARTIARTL",
    "airtel": "BHARTIARTL",
    "itc": "ITC",
    "wipro": "WIPRO",
    "bajaj finance": "BAJFINANCE",
    "hul": "HINDUNILVR",
    "hindustan unilever": "HINDUNILVR",
    "kotak mahindra bank": "KOTAKBANK",
    "kotak": "KOTAKBANK",
    "larsen & toubro": "LT",
    "l&t": "LT"
}

def get_nse_stock_data(ticker_symbol):
    """
    Get real-time stock data for NSE listed companies using Yahoo Finance API
    """
    try:
        # Ensure the ticker has .NS suffix for NSE stocks
        if not ticker_symbol.endswith('.NS'):
            ticker_symbol += '.NS'
        
        # Create a ticker object
        ticker = yf.Ticker(ticker_symbol)
        
        # Get current data
        info = ticker.info
        hist = ticker.history(period="5d")  # Get last 5 days of data
        
        if hist.empty:
            return None
        
        # Get the most recent data
        current_price = hist['Close'].iloc[-1]
        previous_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
        
        # Calculate change and percentage change
        change = current_price - previous_close
        percent_change = (change / previous_close) * 100 if previous_close != 0 else 0
        
        # Prepare the response
        stock_data = {
            'symbol': ticker_symbol.replace('.NS', ''),
            'company_name': info.get('longName', ticker_symbol),
            'current_price': round(current_price, 2),
            'previous_close': round(previous_close, 2),
            'change': round(change, 2),
            'percent_change': round(percent_change, 2),
            'volume': hist['Volume'].iloc[-1] if not hist.empty else 0,
            'high': round(hist['High'].iloc[-1], 2) if not hist.empty else current_price,
            'low': round(hist['Low'].iloc[-1], 2) if not hist.empty else current_price,
            'open': round(hist['Open'].iloc[-1], 2) if not hist.empty else current_price,
            'market_cap': info.get('marketCap', 'N/A'),
            'last_updated': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        
        return stock_data
        
    except Exception as e:
        print(f"Error fetching data for {ticker_symbol}: {e}")
        return None

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'stock-data-server',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/stock/<symbol>')
def get_stock(symbol):
    """Get data for a single stock"""
    try:
        # Convert common names to symbols if needed
        symbol_lookup = common_stocks.get(symbol.lower(), symbol.upper())
        
        stock_data = get_nse_stock_data(symbol_lookup)
        
        if stock_data:
            return jsonify(stock_data)
        else:
            return jsonify({'error': f'Stock data not found for {symbol}'}), 404
            
    except Exception as e:
        print(f"Error in get_stock: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/real-time/<symbol>')
def get_real_time_stock(symbol):
    """Get real-time data for a single stock"""
    return get_stock(symbol)

@app.route('/api/trending')
def get_trending_stocks():
    """Get trending Indian stocks"""
    try:
        trending_symbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'INFY', 
                          'SBIN', 'BHARTIARTL', 'ITC', 'KOTAKBANK', 'HINDUNILVR']
        
        trending_data = []
        
        for symbol in trending_symbols:
            stock_data = get_nse_stock_data(symbol)
            if stock_data:
                trending_data.append(stock_data)
            
            # Add small delay to avoid rate limiting
            time.sleep(0.1)
        
        return jsonify(trending_data)
        
    except Exception as e:
        print(f"Error in get_trending_stocks: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/multiple')
def get_multiple_stocks():
    """Get data for multiple stocks"""
    try:
        symbols = request.args.get('symbols', '').split(',')
        
        if not symbols or symbols == ['']:
            return jsonify({'error': 'Symbols parameter is required'}), 400
        
        stocks_data = []
        
        for symbol in symbols:
            symbol = symbol.strip()
            if symbol:
                stock_data = get_nse_stock_data(symbol)
                if stock_data:
                    stocks_data.append(stock_data)
        
        return jsonify(stocks_data)
        
    except Exception as e:
        print(f"Error in get_multiple_stocks: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/search/<query>')
def search_stocks(query):
    """Search for stocks by name or symbol"""
    try:
        results = []
        query_lower = query.lower()
        
        # Search in common stocks mapping
        for name, symbol in common_stocks.items():
            if query_lower in name or query_lower in symbol.lower():
                stock_data = get_nse_stock_data(symbol)
                if stock_data:
                    results.append(stock_data)
        
        return jsonify(results)
        
    except Exception as e:
        print(f"Error in search_stocks: {e}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("📊 Starting Stock Data Server...")
    print("🔗 Yahoo Finance API integration active")
    app.run(host='0.0.0.0', port=5002, debug=True)
