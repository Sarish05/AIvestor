import os
import json
import requests
import time
from flask import Flask, request, redirect, jsonify, session
from datetime import datetime, timedelta

# Upstox API configuration
CLIENT_ID = "0bf909e4-d9b7-47a7-985c-62e0fc0db70a"
CLIENT_SECRET = "5zu956njup"  # Note: In production, store securely
REDIRECT_URI = "http://localhost:5000/api/upstox/callback"  # Update for production

# Base URLs for Upstox API
AUTH_URL = "https://api.upstox.com/v2/login/authorization/dialog"
TOKEN_URL = "https://api.upstox.com/v2/login/authorization/token"
API_BASE_URL = "https://api.upstox.com/v2"

# Cache for storing market data to reduce API calls
market_data_cache = {
    "last_updated": None,
    "data": {}
}

def register_upstox_routes(app):
    """Register Upstox API routes with the Flask app."""
    
    @app.route('/api/upstox/login')
    def upstox_login():
        """Redirect to Upstox login page for OAuth authentication."""
        auth_url = f"{AUTH_URL}?response_type=code&client_id={CLIENT_ID}&redirect_uri={REDIRECT_URI}"
        return jsonify({"auth_url": auth_url})
    
    @app.route('/api/upstox/callback')
    def upstox_callback():
        """Handle callback from Upstox with auth code."""
        auth_code = request.args.get('code')
        if not auth_code:
            return jsonify({"error": "Authorization code not provided"}), 400
        
        # Exchange auth code for access token
        token_data = exchange_code_for_token(auth_code)
        if "error" in token_data:
            return jsonify(token_data), 400
        
        # Store token in session - in production use secure storage
        session['upstox_token'] = token_data
        
        # Redirect or return token as needed
        return jsonify({"success": True, "message": "Authentication successful"})
    
    @app.route('/api/upstox/market-data')
    def get_market_data():
        """Get market data for specified symbols."""
        symbols = request.args.get('symbols')
        if not symbols:
            return jsonify({"error": "No symbols provided"}), 400
        
        # Check if cache is fresh (less than 5 minutes old)
        if (market_data_cache["last_updated"] and 
            datetime.now() - market_data_cache["last_updated"] < timedelta(minutes=5)):
            # Filter cached data for requested symbols
            symbol_list = symbols.split(',')
            filtered_data = {sym: market_data_cache["data"].get(sym) for sym in symbol_list 
                            if sym in market_data_cache["data"]}
            
            # If all requested symbols are in cache, return cached data
            if all(filtered_data.values()):
                return jsonify({"data": filtered_data, "cached": True})
        
        # Get access token - in production implement token refresh
        access_token = get_valid_access_token()
        if not access_token:
            return jsonify({"error": "Not authenticated with Upstox"}), 401
        
        # Fetch live market data from Upstox
        market_data = fetch_market_data(access_token, symbols)
        
        # Update cache
        if "data" in market_data:
            current_time = datetime.now()
            market_data_cache["last_updated"] = current_time
            # Update cache with new data while preserving other symbols
            for symbol, data in market_data["data"].items():
                market_data_cache["data"][symbol] = data
        
        return jsonify(market_data)
    
    @app.route('/api/upstox/historical-data')
    def get_historical_data():
        """Get historical OHLC data for a symbol."""
        symbol = request.args.get('symbol')
        interval = request.args.get('interval', '1D')  # Default to daily
        from_date = request.args.get('from', (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'))
        to_date = request.args.get('to', datetime.now().strftime('%Y-%m-%d'))
        
        if not symbol:
            return jsonify({"error": "Symbol not provided"}), 400
        
        # Get access token - in production implement token refresh
        access_token = get_valid_access_token()
        if not access_token:
            return jsonify({"error": "Not authenticated with Upstox"}), 401
        
        # Fetch historical data from Upstox
        historical_data = fetch_historical_data(access_token, symbol, interval, from_date, to_date)
        return jsonify(historical_data)
    
    @app.route('/api/upstox/check-auth')
    def check_auth():
        """Check if user is authenticated with Upstox."""
        token = session.get('upstox_token')
        if token and 'access_token' in token:
            # Check if token is still valid
            return jsonify({"authenticated": True})
        return jsonify({"authenticated": False})
    
    @app.route('/api/upstox/logout')
    def upstox_logout():
        """Log out from Upstox by clearing the session token."""
        if 'upstox_token' in session:
            session.pop('upstox_token')
        return jsonify({"success": True, "message": "Logged out from Upstox"})

def exchange_code_for_token(auth_code):
    """Exchange authorization code for access token."""
    try:
        payload = {
            'code': auth_code,
            'client_id': CLIENT_ID,
            'client_secret': CLIENT_SECRET,
            'redirect_uri': REDIRECT_URI,
            'grant_type': 'authorization_code'
        }
        
        response = requests.post(
            TOKEN_URL,
            headers={'Content-Type': 'application/x-www-form-urlencoded'},
            data=payload
        )
        
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def get_valid_access_token():
    """Get a valid access token from session or refresh if expired."""
    token_data = session.get('upstox_token')
    if not token_data or 'access_token' not in token_data:
        return None
    
    # In a production app, check expiry and implement refresh token logic
    return token_data['access_token']

def fetch_market_data(access_token, symbols):
    """Fetch real-time market data for specified symbols."""
    try:
        symbol_list = symbols.split(',')
        
        # Format for Upstox API - NSE symbols need NSE: prefix
        formatted_symbols = [f"NSE:{sym}" for sym in symbol_list]
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/json'
        }
        
        # Call Upstox market data API
        response = requests.get(
            f"{API_BASE_URL}/market-quote/quotes",
            headers=headers,
            params={'symbol': ','.join(formatted_symbols)}
        )
        
        if response.status_code == 200:
            raw_data = response.json()
            
            # Process and format the data for our frontend
            formatted_data = {}
            for symbol in symbol_list:
                upstox_sym = f"NSE:{symbol}"
                if upstox_sym in raw_data.get('data', {}):
                    quote = raw_data['data'][upstox_sym]
                    formatted_data[symbol] = {
                        'symbol': symbol,
                        'name': quote.get('company_name', symbol),
                        'price': quote.get('last_price', 0),
                        'change': quote.get('change', 0),
                        'changePercentage': quote.get('change_percentage', 0),
                        'open': quote.get('ohlc', {}).get('open', 0),
                        'high': quote.get('ohlc', {}).get('high', 0),
                        'low': quote.get('ohlc', {}).get('low', 0),
                        'close': quote.get('ohlc', {}).get('close', 0),
                        'volume': quote.get('volume', '0'),
                        'lastUpdated': datetime.now().isoformat()
                    }
            
            return {"data": formatted_data}
        else:
            return {"error": f"API error: {response.status_code}", "message": response.text}
    
    except Exception as e:
        return {"error": str(e)}

def fetch_historical_data(access_token, symbol, interval, from_date, to_date):
    """Fetch historical OHLC data for a symbol."""
    try:
        # Format for Upstox API
        formatted_symbol = f"NSE:{symbol}"
        
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Accept': 'application/json'
        }
        
        # Map interval to Upstox format
        interval_map = {
            '1D': 'day',
            '1W': 'week',
            '1M': 'month'
        }
        upstox_interval = interval_map.get(interval, 'day')
        
        # Call Upstox historical data API
        response = requests.get(
            f"{API_BASE_URL}/historical-candle/{formatted_symbol}/{upstox_interval}",
            headers=headers,
            params={
                'from': from_date,
                'to': to_date
            }
        )
        
        if response.status_code == 200:
            raw_data = response.json()
            
            # Process and format the data for our frontend
            candles = raw_data.get('data', {}).get('candles', [])
            formatted_data = []
            
            for candle in candles:
                if len(candle) >= 5:  # Ensure we have at least OHLCV data
                    timestamp, open_price, high, low, close = candle[:5]
                    volume = candle[5] if len(candle) > 5 else 0
                    
                    formatted_data.append({
                        'date': timestamp.split('T')[0],  # Extract date part
                        'price': close,  # Use close price
                        'open': open_price,
                        'high': high,
                        'low': low,
                        'close': close,
                        'volume': volume
                    })
            
            return {"data": formatted_data}
        else:
            return {"error": f"API error: {response.status_code}", "message": response.text}
    
    except Exception as e:
        return {"error": str(e)} 