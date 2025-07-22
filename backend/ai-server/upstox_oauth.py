# backend/ai-server/upstox_oauth.py - Upstox OAuth Service
from flask import Flask, request, jsonify, session, redirect
from datetime import datetime, timedelta
import requests
import secrets

# Upstox OAuth configuration
CLIENT_ID = "0bf909e4-d9b7-47a7-985c-62e0fc0db70a"
CLIENT_SECRET = "5zu956njup"  # Note: In production, store securely
REDIRECT_URI = "http://localhost:5003/api/upstox/callback"

# Base URLs for Upstox API
AUTH_URL = "https://api.upstox.com/v2/login/authorization/dialog"
TOKEN_URL = "https://api.upstox.com/v2/login/authorization/token"
API_BASE_URL = "https://api.upstox.com/v2"

def register_upstox_oauth_routes(app):
    """Register Upstox OAuth routes with the Flask app."""
    
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
        
        return jsonify({"success": True, "message": "Authentication successful"})
    
    @app.route('/api/upstox/check-auth')
    def check_upstox_auth():
        """Check if user is authenticated with Upstox."""
        token_data = session.get('upstox_token')
        if token_data and is_token_valid(token_data):
            return jsonify({"authenticated": True})
        else:
            return jsonify({"authenticated": False})
    
    @app.route('/api/upstox/logout')
    def upstox_logout():
        """Logout from Upstox."""
        session.pop('upstox_token', None)
        return jsonify({"success": True, "message": "Logged out successfully"})
    
    @app.route('/api/upstox/market-data')
    def get_upstox_market_data():
        """Get market data using Upstox API."""
        try:
            # Check authentication
            token_data = session.get('upstox_token')
            if not token_data or not is_token_valid(token_data):
                return jsonify({"error": "Not authenticated with Upstox"}), 401
            
            # Get market data (implement based on your needs)
            # This would call the actual Upstox market data API
            return jsonify({
                "status": "success",
                "message": "Market data functionality available",
                "note": "Implement specific market data calls here"
            })
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @app.route('/api/upstox/historical-data')
    def get_upstox_historical_data():
        """Get historical data using Upstox API."""
        try:
            # Check authentication
            token_data = session.get('upstox_token')
            if not token_data or not is_token_valid(token_data):
                return jsonify({"error": "Not authenticated with Upstox"}), 401
            
            # Get historical data (implement based on your needs)
            return jsonify({
                "status": "success", 
                "message": "Historical data functionality available",
                "note": "Implement specific historical data calls here"
            })
            
        except Exception as e:
            return jsonify({"error": str(e)}), 500

def exchange_code_for_token(auth_code):
    """Exchange authorization code for access token."""
    try:
        token_payload = {
            "code": auth_code,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
            "grant_type": "authorization_code"
        }
        
        response = requests.post(TOKEN_URL, data=token_payload)
        
        if response.status_code == 200:
            token_data = response.json()
            # Add timestamp for token validation
            token_data['created_at'] = datetime.now().isoformat()
            return token_data
        else:
            return {"error": f"Token exchange failed: {response.text}"}
            
    except Exception as e:
        return {"error": f"Token exchange error: {str(e)}"}

def is_token_valid(token_data):
    """Check if the stored token is still valid."""
    try:
        if not token_data or 'access_token' not in token_data:
            return False
        
        # Check if token has expired (assuming 1 hour expiry)
        created_at = datetime.fromisoformat(token_data.get('created_at', ''))
        if datetime.now() - created_at > timedelta(hours=1):
            return False
        
        return True
        
    except Exception:
        return False

def make_authenticated_request(endpoint, token_data, params=None):
    """Make an authenticated request to Upstox API."""
    try:
        headers = {
            "Authorization": f"Bearer {token_data['access_token']}",
            "Accept": "application/json"
        }
        
        response = requests.get(f"{API_BASE_URL}{endpoint}", headers=headers, params=params)
        return response.json()
        
    except Exception as e:
        return {"error": f"API request failed: {str(e)}"}
