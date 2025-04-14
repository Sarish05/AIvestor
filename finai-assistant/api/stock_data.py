import yfinance as yf
from flask import Blueprint, jsonify, request
from datetime import datetime, timedelta
import time
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create a blueprint for stock data routes
stock_blueprint = Blueprint('stock', __name__)

# Mapping known indices to correct Yahoo Finance symbols
INDEX_MAPPING = {
    "NIFTY": "^NSEI",
    "NIFTY50": "^NSEI",
    "SENSEX": "^BSESN",
    "BANKNIFTY": "^NSEBANK",
    "NIFTYBANK": "^NSEBANK",
    "FINNIFTY": "^CNXFIN",
}

@stock_blueprint.route('/api/stock/<symbol>', methods=['GET'])
def get_stock_data(symbol):
    """
    Get real-time stock data for a given symbol
    """
    try:
        # Map symbol if it's a known index
        yahoo_symbol = INDEX_MAPPING.get(symbol.upper(), symbol)
        
        # Add .NS suffix for Indian stocks if not already present
        if not (yahoo_symbol.endswith('.NS') or yahoo_symbol.startswith('^')):
            yahoo_symbol = f"{yahoo_symbol}.NS"
        
        logger.info(f"Fetching data for symbol: {yahoo_symbol}")
        
        # Get stock information
        stock = yf.Ticker(yahoo_symbol)
        
        # Get current market data
        market_data = stock.history(period="2d")
        
        if market_data.empty:
            return jsonify({"error": f"No data found for {symbol}"}), 404
            
        # Get the most recent data
        latest_data = market_data.iloc[-1]
        prev_data = market_data.iloc[-2] if len(market_data) > 1 else latest_data
        
        # Calculate change
        change = latest_data["Close"] - prev_data["Close"]
        change_percent = (change / prev_data["Close"]) * 100
        
        # Get company info if available
        try:
            info = stock.info
            company_name = info.get('longName', yahoo_symbol)
            sector = info.get('sector', 'N/A')
            market_cap = info.get('marketCap', 0)
            
            # Format market cap
            if market_cap > 0:
                if market_cap >= 1_000_000_000_000:  # Trillion
                    market_cap_str = f"₹{market_cap/1_000_000_000_000:.2f}T"
                elif market_cap >= 1_000_000_000:  # Billion
                    market_cap_str = f"₹{market_cap/1_000_000_000:.2f}B"
                elif market_cap >= 1_000_000:  # Million
                    market_cap_str = f"₹{market_cap/1_000_000:.2f}M"
                else:
                    market_cap_str = f"₹{market_cap:,}"
            else:
                market_cap_str = "N/A"
                
        except Exception as e:
            logger.warning(f"Could not fetch company info: {e}")
            company_name = yahoo_symbol.replace('.NS', '').replace('^', '')
            sector = "N/A"
            market_cap_str = "N/A"
        
        # Format volume
        volume = latest_data["Volume"]
        if volume >= 1_000_000:
            volume_str = f"{volume/1_000_000:.1f}M"
        elif volume >= 1_000:
            volume_str = f"{volume/1_000:.1f}K"
        else:
            volume_str = f"{volume}"
        
        # Construct response
        response = {
            "symbol": symbol.upper(),
            "name": company_name,
            "price": round(latest_data["Close"], 2),
            "change": round(change, 2),
            "changePercentage": round(change_percent, 2),
            "open": round(latest_data["Open"], 2),
            "high": round(latest_data["High"], 2),
            "low": round(latest_data["Low"], 2),
            "volume": volume_str,
            "marketCap": market_cap_str,
            "previousClose": round(prev_data["Close"], 2),
            "sector": sector,
            "timestamp": datetime.now().isoformat()
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error fetching stock data: {str(e)}")
        return jsonify({"error": str(e)}), 500

@stock_blueprint.route('/api/stocks/multiple', methods=['POST'])
def get_multiple_stocks():
    """
    Get data for multiple stocks at once
    """
    try:
        data = request.get_json()
        symbols = data.get('symbols', [])
        
        if not symbols:
            return jsonify({"error": "No symbols provided"}), 400
            
        results = []
        for symbol in symbols:
            try:
                # Map symbol if it's a known index
                yahoo_symbol = INDEX_MAPPING.get(symbol.upper(), symbol)
                
                # Add .NS suffix for Indian stocks if not already present
                if not (yahoo_symbol.endswith('.NS') or yahoo_symbol.startswith('^')):
                    yahoo_symbol = f"{yahoo_symbol}.NS"
                
                # Get stock information
                stock = yf.Ticker(yahoo_symbol)
                market_data = stock.history(period="2d")
                
                if market_data.empty:
                    continue
                    
                # Get the most recent data
                latest_data = market_data.iloc[-1]
                prev_data = market_data.iloc[-2] if len(market_data) > 1 else latest_data
                
                # Calculate change
                change = latest_data["Close"] - prev_data["Close"]
                change_percent = (change / prev_data["Close"]) * 100
                
                # Get basic info
                info = stock.info
                company_name = info.get('longName', yahoo_symbol)
                
                # Simplify response for multiple stocks
                results.append({
                    "symbol": symbol.upper(),
                    "name": company_name,
                    "price": round(latest_data["Close"], 2),
                    "change": round(change, 2),
                    "changePercentage": round(change_percent, 2)
                })
                
            except Exception as e:
                logger.error(f"Error processing symbol {symbol}: {str(e)}")
                # Skip failed symbols
                continue
                
        return jsonify(results)
        
    except Exception as e:
        logger.error(f"Error processing multiple stocks: {str(e)}")
        return jsonify({"error": str(e)}), 500

@stock_blueprint.route('/api/stock/<symbol>/history', methods=['GET'])
def get_stock_history(symbol):
    """
    Get historical data for a stock
    """
    try:
        period = request.args.get('period', '1mo')
        interval = request.args.get('interval', '1d')
        
        # Map valid periods and intervals
        valid_periods = {'1d', '5d', '1mo', '3mo', '6mo', '1y', '5y', 'max'}
        valid_intervals = {'1m', '2m', '5m', '15m', '30m', '60m', '90m', '1h', '1d', '5d', '1wk', '1mo', '3mo'}
        
        if period not in valid_periods:
            period = '1mo'
        if interval not in valid_intervals:
            interval = '1d'
        
        # Map symbol if it's a known index
        yahoo_symbol = INDEX_MAPPING.get(symbol.upper(), symbol)
        
        # Add .NS suffix for Indian stocks if not already present
        if not (yahoo_symbol.endswith('.NS') or yahoo_symbol.startswith('^')):
            yahoo_symbol = f"{yahoo_symbol}.NS"
            
        # Get stock data
        stock = yf.Ticker(yahoo_symbol)
        hist_data = stock.history(period=period, interval=interval)
        
        if hist_data.empty:
            return jsonify({"error": f"No historical data found for {symbol}"}), 404
            
        # Format the response
        data_points = []
        for index, row in hist_data.iterrows():
            # Convert timestamp to string
            date_str = index.strftime('%Y-%m-%d %H:%M:%S')
            
            data_points.append({
                "date": date_str,
                "price": round(row["Close"], 2),
                "open": round(row["Open"], 2),
                "high": round(row["High"], 2),
                "low": round(row["Low"], 2),
                "volume": int(row["Volume"])
            })
            
        return jsonify(data_points)
        
    except Exception as e:
        logger.error(f"Error fetching historical data: {str(e)}")
        return jsonify({"error": str(e)}), 500

@stock_blueprint.route('/api/market/top-stocks', methods=['GET'])
def get_top_stocks():
    """
    Get data for top Indian stocks (NIFTY50 constituents)
    """
    try:
        # NIFTY50 constituents (simplified list for example)
        nifty50_stocks = [
            "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "INFY.NS", "ICICIBANK.NS",
            "HINDUNILVR.NS", "ITC.NS", "SBIN.NS", "BHARTIARTL.NS", "KOTAKBANK.NS",
            "LT.NS", "AXISBANK.NS", "BAJFINANCE.NS", "ASIANPAINT.NS", "MARUTI.NS"
        ]
        
        results = []
        for stock_symbol in nifty50_stocks:
            try:
                stock = yf.Ticker(stock_symbol)
                data = stock.history(period="2d")
                
                if data.empty:
                    continue
                    
                # Get latest data
                latest = data.iloc[-1]
                prev = data.iloc[-2] if len(data) > 1 else latest
                
                # Calculate change
                change = latest["Close"] - prev["Close"]
                change_percent = (change / prev["Close"]) * 100
                
                # Get company info
                info = stock.info
                name = info.get('longName', stock_symbol.replace('.NS', ''))
                sector = info.get('sector', 'N/A')
                
                # Format volume
                volume = latest["Volume"]
                if volume >= 1_000_000:
                    volume_str = f"{volume/1_000_000:.1f}M"
                else:
                    volume_str = f"{volume/1_000:.1f}K"
                
                # Add to results
                results.append({
                    "symbol": stock_symbol.replace('.NS', ''),
                    "name": name,
                    "price": round(latest["Close"], 2),
                    "change": round(change, 2),
                    "changePercentage": round(change_percent, 2),
                    "volume": volume_str,
                    "sector": sector
                })
                
            except Exception as e:
                logger.error(f"Error processing {stock_symbol}: {str(e)}")
                continue
                
        # Sort by market cap (using price as proxy for this example)
        results.sort(key=lambda x: x["price"], reverse=True)
        
        return jsonify(results)
        
    except Exception as e:
        logger.error(f"Error fetching top stocks: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Helper function to register the blueprint
def register_stock_routes(app):
    app.register_blueprint(stock_blueprint) 