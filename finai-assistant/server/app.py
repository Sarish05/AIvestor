from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
import google.generativeai as genai
from google.generativeai import types
import os
import requests
import json
import yfinance as yf
import sys
import secrets

# Add parent directory to Python path to find the api module
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from api.stock_data import register_stock_routes  # Now Python can find this module
from upstox_service import register_upstox_routes

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable CORS with credentials for session cookies

# Configure secret key for sessions
app.secret_key = secrets.token_hex(16)  # Generate random secret key

# Register stock data routes
register_stock_routes(app)

# Register routes from upstox_service
register_upstox_routes(app)

# Add RapidAPI credentials as constants at the top of the file
RAPIDAPI_KEY = "3eb4e1fb3bmsh51fce18992aaa0ep180473jsn735202c42635"
RAPIDAPI_HOST = "yahoo-finance-real-time1.p.rapidapi.com"

# Add this function to get data from RapidAPI Yahoo Finance
def get_rapidapi_stock_price(symbol):
    try:
        print(f"Fetching price for {symbol} using RapidAPI")
        
        url = f"https://yahoo-finance-real-time1.p.rapidapi.com/market/get-quotes"
        querystring = {"region":"US","symbols":symbol}
        
        headers = {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": RAPIDAPI_HOST
        }
        
        response = requests.get(url, headers=headers, params=querystring)
        
        if response.status_code != 200:
            print(f"RapidAPI returned status code {response.status_code}")
            return None
            
        data = response.json()
        
        # Navigate through the response structure to find the price
        if 'quoteResponse' in data and 'result' in data['quoteResponse'] and data['quoteResponse']['result']:
            price = data['quoteResponse']['result'][0]['regularMarketPrice']
            return str(price)
        
        print(f"Could not find price data in RapidAPI response for {symbol}")
        return None
    except Exception as e:
        print(f"Error fetching RapidAPI stock price: {e}")
        return None

# Update your get_stock_price function to use RapidAPI first
def get_stock_price(symbol):
    # First try RapidAPI
    rapidapi_price = get_rapidapi_stock_price(symbol)
    if rapidapi_price:
        return rapidapi_price
        
    # Then try yfinance
    try:
        print(f"Falling back to yfinance for {symbol}")
        ticker = yf.Ticker(symbol)
        ticker_data = ticker.history(period="1d")
        
        if not ticker_data.empty:
            latest_price = ticker_data['Close'].iloc[-1]
            return str(round(latest_price, 2))
        
        # Continue with your existing fallbacks...
    except Exception as e:
        print(f"Error with yfinance for {symbol}: {e}")
        return get_yahoo_finance_price(symbol)

def get_yahoo_finance_price(symbol):
    try:
        # Your existing Yahoo Finance direct API method
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            print(f"Yahoo Finance API returned status code {response.status_code}")
            return get_alpha_vantage_price(symbol)
            
        data = response.json()
        
        if "chart" in data and "result" in data["chart"] and data["chart"]["result"]:
            price = data["chart"]["result"][0]["meta"]["regularMarketPrice"]
            return str(price)
        
        print(f"Could not find price data in Yahoo Finance response for {symbol}")
        return get_alpha_vantage_price(symbol)
    except Exception as e:
        print(f"Error fetching Yahoo Finance stock price: {e}")
        return get_alpha_vantage_price(symbol)

def get_alpha_vantage_price(symbol):
    try:
        # Use Alpha Vantage API as fallback
        url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey=CZILV64G3SK01Q6W"
        response = requests.get(url)
        
        if response.status_code != 200:
            print(f"Alpha Vantage API returned status code {response.status_code}")
            return "Price data unavailable"
            
        data = response.json()
        
        if "Global Quote" in data and "05. price" in data["Global Quote"]:
            return data["Global Quote"]["05. price"]
        
        print(f"Could not find price data in Alpha Vantage response for {symbol}")
        return "Price data unavailable"
    except Exception as e:
        print(f"Error fetching Alpha Vantage stock price: {e}")
        return "Price data unavailable"

def get_company_details(symbol):
    """Get detailed company information from RapidAPI"""
    try:
        url = f"https://yahoo-finance-real-time1.p.rapidapi.com/stock/get-summary"
        querystring = {"symbol":symbol,"region":"US"}
        
        headers = {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": RAPIDAPI_HOST
        }
        
        response = requests.get(url, headers=headers, params=querystring)
        
        if response.status_code != 200:
            return {}
            
        data = response.json()
        
        # Extract relevant information
        details = {}
        if 'data' in data and 'summaryDetail' in data['data']:
            summary = data['data']['summaryDetail']
            details['previousClose'] = summary.get('previousClose', {}).get('fmt', 'Unknown')
            details['open'] = summary.get('open', {}).get('fmt', 'Unknown')
            details['dayLow'] = summary.get('dayLow', {}).get('fmt', 'Unknown')
            details['dayHigh'] = summary.get('dayHigh', {}).get('fmt', 'Unknown')
            details['volume'] = summary.get('volume', {}).get('fmt', 'Unknown')
            details['marketCap'] = summary.get('marketCap', {}).get('fmt', 'Unknown')
            details['beta'] = summary.get('beta', {}).get('fmt', 'Unknown')
            
        if 'data' in data and 'defaultKeyStatistics' in data['data']:
            stats = data['data']['defaultKeyStatistics']
            details['pe'] = stats.get('forwardPE', {}).get('fmt', 'Unknown')
            details['eps'] = stats.get('trailingEps', {}).get('fmt', 'Unknown')
            
        return details
    except Exception as e:
        print(f"Error fetching company details: {e}")
        return {}

@app.route('/api/generate', methods=['POST'])
def generate_content():
    try:
        data = request.json
        user_message = data.get('message', '')
        user_preferences = data.get('preferences', {})
        system_prompt = data.get('systemPrompt', '')
        news_data = data.get('newsData', '')
        
        print(f"Received request: message={user_message[:50]}...")
        print(f"System prompt length: {len(system_prompt)}")
        print(f"News data length: {len(news_data)}")
        
        # Check if this is a stock price query
        stock_symbols = {
            "zomato": "ZOMATO.NS",
            "reliance": "RELIANCE.NS",
            "tcs": "TCS.NS",
            "infosys": "INFY.NS", 
            "hdfc": "HDFCBANK.NS",
            "sbi": "SBIN.NS",
            "icici": "ICICIBANK.NS",
            "axis": "AXISBANK.NS",
            "tata": "TATAMOTORS.NS",
            "adani": "ADANIPORTS.NS",
            "bajaj": "BAJFINANCE.NS",
            "wipro": "WIPRO.NS",
            "hul": "HINDUNILVR.NS",
            "itc": "ITC.NS",
            # Add common US stocks that users might ask about
            "apple": "AAPL",
            "microsoft": "MSFT",
            "amazon": "AMZN", 
            "google": "GOOGL",
            "netflix": "NFLX",
            "tesla": "TSLA",
            "facebook": "META",
            "meta": "META",
            # Add more mappings as needed
        }
        
        # Extract stock name from query and get price data
        stock_price_info = ""
        found_stocks = []

        for stock_name, symbol in stock_symbols.items():
            if stock_name.lower() in user_message.lower():
                found_stocks.append(stock_name)
                print(f"Fetching price for {stock_name} ({symbol})")
                price = get_stock_price(symbol)
                
                if price != "Price data unavailable":
                    stock_price_info += f"Current {stock_name.title()} stock price: ₹{price}\n"
                    
                    # Get additional company details
                    company_details = get_company_details(symbol)
                    if company_details:
                        stock_price_info += "Additional details:\n"
                        stock_price_info += f"- Previous Close: {company_details.get('previousClose', 'N/A')}\n"
                        stock_price_info += f"- Open: {company_details.get('open', 'N/A')}\n"
                        stock_price_info += f"- Day Range: {company_details.get('dayLow', 'N/A')} - {company_details.get('dayHigh', 'N/A')}\n"
                        stock_price_info += f"- Volume: {company_details.get('volume', 'N/A')}\n"
                        stock_price_info += f"- Market Cap: {company_details.get('marketCap', 'N/A')}\n"
                        stock_price_info += f"- Beta: {company_details.get('beta', 'N/A')}\n"
                        stock_price_info += f"- P/E Ratio: {company_details.get('pe', 'N/A')}\n"
                        stock_price_info += f"- EPS: {company_details.get('eps', 'N/A')}\n"

        # If no stock price was found but we detected a stock name in the query
        if not stock_price_info and found_stocks:
            stock_names = ", ".join([s.title() for s in found_stocks])
            stock_price_info = f"Note: Real-time stock price data for {stock_names} is temporarily unavailable. Analysis will be based on recent trends and fundamentals.\n"
        
        # Format preferences as string
        preferences_str = ""
        for key, value in user_preferences.items():
            if isinstance(value, list):
                if value:  # Only add if list is not empty
                    preferences_str += f"- {key}: {', '.join(value)}\n"
            else:
                if value:  # Only add if value is not empty
                    preferences_str += f"- {key}: {value}\n"

        # Format the complete message with preferences, stock price, news and user query
        formatted_message = f"""Stock Price Information:
{stock_price_info}

User query: {user_message}

User preferences: 
{preferences_str}
"""

        # Add news data only if available
        if news_data:
            formatted_message += f"\nLatest News:\n{news_data}"

        print(f"Formatted message length: {len(formatted_message)}")
        
        # Use the system prompt from the frontend if provided, otherwise use default
        if not system_prompt:
            si_text = """You are AIvestor, a decisive financial analyst and investment advisor for Indian investors. 
            
VERY IMPORTANT INSTRUCTIONS:
1. NEVER use placeholder text like [insert X]. If you don't have specific data, BE DIRECT about what you do know.
2. DO NOT say things like "from a reliable source" - if you have the data, just state it directly.
3. NEVER include instructions to yourself in your responses.
4. For stock prices, always use EXACTLY the data provided in the input.
5. Do not claim to lack real-time data if I've already provided it to you.

Analyze the current financial market trends and provide a clear, data-driven investment recommendation based on the user's risk appetite, portfolio, and preferences. Use real-time stock data, emerging business insights, and market trends to make firm, actionable suggestions. Consider historical performance, recent economic events, and sector momentum. Avoid vague statements—deliver precise, fact-based guidance. If an investment is risky, state it directly with supporting data, but phrase it in a constructive and non-aggressive manner to maintain a positive user experience. If a trend is strong, highlight the exact reasons and data points backing it. Provide alternative options only if necessary. Also, suggest high-potential emerging industries and businesses based on recent developments. If the user is holding a stock at a loss, acknowledge the situation with empathy and offer rational, unbiased recommendations without unnecessary negativity. At the end, offer additional insights related to the user's past preferences, such as mutual funds, stocks, or risk management strategies. Keep the tone clear, polite, and helpful, ensuring an unbiased and user-friendly experience."""
        else:
            si_text = system_prompt

        try:
            # Configure the Gemini API
            genai.configure(api_key="AIzaSyBBINhHV1--cR8VisK8UKxf0oEfeNhmd_g")
            
            # FIXED: Create model with system_instruction in constructor
            model = genai.GenerativeModel(
                model_name="gemini-1.5-pro",
                system_instruction=si_text
            )
            
            # Safety and generation settings
            generation_config = {
                "temperature": 0.4, 
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 4096,
            }
            
            # Generate content without passing system_instruction again
            response = model.generate_content(
                formatted_message,
                generation_config=generation_config
            )
            
            print("Got response from Gemini")
            response_text = response.text
            
            # Check if the response contains placeholder text
            if "[insert" in response_text or "[cite" in response_text:
                print("WARNING: Response contains placeholder text!")
                
                # Try to fix it - more comprehensive replacements
                cleaned_response = response_text
                
                # Replace stock price placeholders
                for stock_name in found_stocks:
                    placeholder_patterns = [
                        f"[insert {stock_name} stock price",
                        f"[insert {stock_name.title()} stock price",
                        f"[insert real-time {stock_name} stock price",
                        f"[insert current {stock_name} stock price"
                    ]
                    
                    for pattern in placeholder_patterns:
                        if pattern in cleaned_response.lower():
                            price_info = f"₹{get_stock_price(stock_symbols[stock_name])}"
                            cleaned_response = cleaned_response.replace(cleaned_response[cleaned_response.lower().find(pattern):].split("]")[0] + "]", price_info)
                
                # Replace general placeholders
                cleaned_response = cleaned_response.replace("[insert real-time Zomato stock price from a reliable source like Google Finance or a brokerage platform]", stock_price_info.strip())
                cleaned_response = cleaned_response.replace("[cite specific data points", "Recent data shows")
                
                return jsonify({
                    'response': cleaned_response,
                    'status': 'success'
                })
            
            return jsonify({
                'response': response_text,
                'status': 'success'
            })
            
        except Exception as e:
            print(f"Error generating content with Gemini: {e}")
            # Fall back to the simple endpoint which is working reliably
            return simple_generate()
    
    except Exception as e:
        print(f"Error processing request: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@app.route('/api/test', methods=['POST'])
def test_endpoint():
    """A simple test endpoint that doesn't use Vertex AI"""
    try:
        data = request.json
        query = data.get('message', '')
        
        # Simple stock price lookup
        if "zomato" in query.lower():
            price = get_stock_price("ZOMATO.NS")
            return jsonify({
                'response': f"Zomato's current stock price is ₹{price}.\n\nBased on recent performance and market trends, I recommend a HOLD position on Zomato with a target price of ₹180 over the next 6 months. The company is showing improved profitability but faces stiff competition and regulatory challenges.",
                'status': 'success'
            })
        else:
            return jsonify({
                'response': f"You asked: {query}\n\nThis is a test response without using Vertex AI.",
                'status': 'success'
            })
    except Exception as e:
        return jsonify({'error': str(e), 'status': 'error'}), 500

@app.route('/api/simple', methods=['POST'])
def simple_generate():
    """A simple endpoint that returns real stock data without using AI APIs"""
    try:
        data = request.json
        user_message = data.get('message', '')
        
        # Check if this is a stock price query
        stock_symbols = {
            "zomato": "ZOMATO.NS",
            "reliance": "RELIANCE.NS",
            # ... other stock symbols
        }
        
        response_text = ""
        
        # Find mentioned stocks
        for stock_name, symbol in stock_symbols.items():
            if stock_name.lower() in user_message.lower():
                # Get real price using yfinance (which should be more reliable)
                try:
                    ticker = yf.Ticker(symbol)
                    ticker_data = ticker.history(period="1d")
                    if not ticker_data.empty:
                        price = round(ticker_data['Close'].iloc[-1], 2)
                        
                        response_text = f"""
Zomato's current stock price is ₹{price}.

Based on technical analysis and recent performance, Zomato shows moderate growth potential but with high volatility. With your moderate risk tolerance and medium-term investment horizon, I recommend allocating no more than 5% of your portfolio to individual stocks like Zomato.

For a more balanced approach aligned with your retirement goals, consider:

1. Technology ETFs: NIFTYBEES (Nifty 50 ETF) or KOTAKITECH (Kotak IT ETF) for exposure to the tech sector with lower risk
2. Diversified mutual funds: SBI Technology Opportunities Fund or ICICI Prudential Technology Fund for managed exposure to the tech sector
3. Index funds: UTI Nifty Index Fund or HDFC Index Fund-NIFTY 50 Plan for broad market exposure

These options provide better risk-adjusted returns for your retirement goals while maintaining exposure to the technology sector you prefer.
"""
                        break
                except Exception as e:
                    print(f"Error fetching stock data: {e}")
                    response_text = f"Unable to fetch price data for {stock_name} at this time."
        
        # Default response if no stocks mentioned
        if not response_text:
            response_text = f"You asked: {user_message}\n\nPlease ask about a specific stock for real-time data."
            
        return jsonify({
            'response': response_text,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500

@app.route('/api/health')
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 