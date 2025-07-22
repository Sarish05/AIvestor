# backend/ai-server/app.py - AI Chatbot Server
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
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enable CORS with credentials for session cookies

# Configure secret key for sessions
app.secret_key = secrets.token_hex(16)  # Generate random secret key

# Configure Gemini AI
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyBBINhHV1--cR8VisK8UKxf0oEfeNhmd_g')
genai.configure(api_key=GEMINI_API_KEY)

# Initialize the model
model = genai.GenerativeModel('gemini-pro')

# Stock price API configurations
RAPIDAPI_KEY = "3eb4e1fb3bmsh51fce18992aaa0ep180473jsn735202c42635"
RAPIDAPI_HOST = "yahoo-finance-real-time1.p.rapidapi.com"

def get_stock_price(symbol):
    """Get current stock price for a symbol"""
    try:
        print(f"Fetching price for {symbol}")
        
        # Try Yahoo Finance first
        stock = yf.Ticker(f"{symbol}.NS")  # Add .NS for NSE stocks
        hist = stock.history(period="1d")
        
        if not hist.empty:
            current_price = hist['Close'].iloc[-1]
            return {
                'symbol': symbol,
                'price': round(current_price, 2),
                'currency': 'INR',
                'source': 'yfinance'
            }
        
        # Fallback to RapidAPI
        return get_rapidapi_stock_price(symbol)
        
    except Exception as e:
        print(f"Error fetching stock price for {symbol}: {e}")
        return None

def get_rapidapi_stock_price(symbol):
    """Get stock price from RapidAPI"""
    try:
        url = f"https://yahoo-finance-real-time1.p.rapidapi.com/market/get-quotes"
        querystring = {"region":"US","symbols":symbol}
        
        headers = {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": RAPIDAPI_HOST
        }
        
        response = requests.get(url, headers=headers, params=querystring)
        
        if response.status_code == 200:
            data = response.json()
            if data and 'result' in data and data['result']:
                quote = data['result'][0]
                return {
                    'symbol': symbol,
                    'price': quote.get('regularMarketPrice', 0),
                    'currency': 'USD',
                    'source': 'rapidapi'
                }
    except Exception as e:
        print(f"RapidAPI error for {symbol}: {e}")
    
    return None

def get_financial_news():
    """Get latest financial news"""
    try:
        # Mock news data for now
        return [
            {
                'title': 'Indian Markets Show Strong Performance',
                'summary': 'NSE and BSE indices reached new highs...',
                'timestamp': datetime.now().isoformat()
            },
            {
                'title': 'RBI Policy Update',
                'summary': 'Reserve Bank of India maintains repo rate...',
                'timestamp': (datetime.now() - timedelta(hours=2)).isoformat()
            }
        ]
    except Exception as e:
        print(f"Error fetching news: {e}")
        return []

def create_system_prompt(question, context_data=None):
    """Create system prompt with context"""
    base_prompt = """You are AIvestor, a sophisticated financial assistant powered by AI. 
Your goal is to provide accurate, helpful and ethical financial advice for the Indian market.

Guidelines:
- Provide thoughtful analysis and clear explanations
- Focus on Indian stocks (NSE/BSE) when discussing specific companies
- Always mention that this is not financial advice and users should do their own research
- Be conversational but professional
- If you don't know something, say so rather than guessing

"""
    
    if context_data:
        if 'stock_prices' in context_data and context_data['stock_prices']:
            base_prompt += "\nCurrent Stock Prices:\n"
            for price_data in context_data['stock_prices']:
                if price_data:
                    base_prompt += f"- {price_data['symbol']}: ₹{price_data['price']}\n"
        
        if 'news' in context_data and context_data['news']:
            base_prompt += "\nLatest Financial News:\n"
            for news in context_data['news'][:3]:  # Limit to 3 news items
                base_prompt += f"- {news['title']}: {news['summary']}\n"
    
    base_prompt += f"\nUser Question: {question}\n"
    return base_prompt

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'ai-chatbot',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint with streaming response"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
        
        user_message = data['message']
        print(f"Received message: {user_message}")
        
        # Extract any stock symbols mentioned in the message
        mentioned_stocks = extract_stock_symbols(user_message)
        
        # Gather context data
        context_data = {}
        
        # Get stock prices for mentioned stocks
        if mentioned_stocks:
            context_data['stock_prices'] = []
            for symbol in mentioned_stocks:
                price_data = get_stock_price(symbol)
                if price_data:
                    context_data['stock_prices'].append(price_data)
        
        # Get latest financial news
        context_data['news'] = get_financial_news()
        
        # Create system prompt with context
        system_prompt = create_system_prompt(user_message, context_data)
        
        # Generate response using Gemini
        def generate_response():
            try:
                response = model.generate_content(
                    system_prompt,
                    generation_config=types.GenerationConfig(
                        temperature=0.7,
                        max_output_tokens=1000,
                    ),
                    stream=True
                )
                
                for chunk in response:
                    if chunk.text:
                        yield f"data: {json.dumps({'content': chunk.text})}\n\n"
                
                yield f"data: {json.dumps({'done': True})}\n\n"
                
            except Exception as e:
                print(f"Error generating response: {e}")
                yield f"data: {json.dumps({'error': 'Sorry, I encountered an error while processing your request.'})}\n\n"
        
        return Response(
            stream_with_context(generate_response()),
            mimetype='text/plain',
            headers={
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*'
            }
        )
        
    except Exception as e:
        print(f"Chat endpoint error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

def extract_stock_symbols(text):
    """Extract potential stock symbols from text"""
    # Common Indian stock symbols
    common_stocks = [
        'RELIANCE', 'TCS', 'HDFCBANK', 'ICICIBANK', 'INFY', 'SBIN', 
        'BHARTIARTL', 'ITC', 'KOTAKBANK', 'HINDUNILVR', 'LT', 'AXISBANK',
        'BAJFINANCE', 'ASIANPAINT', 'WIPRO', 'TITAN', 'TATASTEEL', 'MARUTI'
    ]
    
    text_upper = text.upper()
    mentioned = []
    
    for stock in common_stocks:
        if stock in text_upper:
            mentioned.append(stock)
    
    return mentioned

@app.route('/api/generate', methods=['POST'])
def generate_content():
    """Main content generation endpoint with stock price integration"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        user_preferences = data.get('preferences', {})
        system_prompt = data.get('systemPrompt', '')
        news_data = data.get('newsData', '')
        
        print(f"Received request: message={user_message[:50]}...")
        
        # Stock symbols mapping
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
            "apple": "AAPL",
            "microsoft": "MSFT",
            "amazon": "AMZN",
            "google": "GOOGL",
            "netflix": "NFLX", 
            "tesla": "TSLA",
            "facebook": "META",
            "meta": "META"
        }
        
        # Extract stock price information
        stock_price_info = ""
        found_stocks = []
        
        for stock_name, symbol in stock_symbols.items():
            if stock_name.lower() in user_message.lower():
                found_stocks.append(stock_name)
                price_data = get_stock_price(symbol)
                
                if price_data and price_data.get('price'):
                    stock_price_info += f"Current {stock_name.title()} stock price: ₹{price_data['price']}\n"
        
        # Format preferences
        preferences_str = ""
        for key, value in user_preferences.items():
            if isinstance(value, list) and value:
                preferences_str += f"- {key}: {', '.join(value)}\n"
            elif value:
                preferences_str += f"- {key}: {value}\n"
        
        # Create formatted message
        formatted_message = f"""Stock Price Information:
{stock_price_info}

User query: {user_message}

User preferences:
{preferences_str}
"""
        
        if news_data:
            formatted_message += f"\nLatest News:\n{news_data}"
        
        # Use provided system prompt or default
        if not system_prompt:
            system_prompt = """You are AIvestor, a decisive financial analyst and investment advisor for Indian investors.

IMPORTANT INSTRUCTIONS:
1. NEVER use placeholder text like [insert X]. If you don't have specific data, BE DIRECT about what you do know.
2. For stock prices, always use EXACTLY the data provided in the input.
3. Provide clear, data-driven investment recommendations based on user's risk appetite and preferences.
4. Keep responses conversational but professional.
5. If discussing risks, phrase constructively to maintain positive user experience.
"""
        
        # Generate response using Gemini
        try:
            model = genai.GenerativeModel(
                model_name="gemini-1.5-pro",
                system_instruction=system_prompt
            )
            
            generation_config = {
                "temperature": 0.4,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 2048,
            }
            
            # Generate streaming response
            def generate_response():
                try:
                    response = model.generate_content(
                        formatted_message,
                        generation_config=generation_config,
                        stream=True
                    )
                    
                    for chunk in response:
                        if chunk.text:
                            yield f"data: {json.dumps({'content': chunk.text})}\n\n"
                    
                    yield f"data: {json.dumps({'done': True})}\n\n"
                    
                except Exception as e:
                    print(f"Error generating response: {e}")
                    yield f"data: {json.dumps({'error': 'Sorry, I encountered an error while processing your request.'})}\n\n"
            
            return Response(
                stream_with_context(generate_response()),
                mimetype='text/plain',
                headers={
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'Access-Control-Allow-Origin': '*'
                }
            )
            
        except Exception as e:
            print(f"Gemini API error: {e}")
            return jsonify({'error': 'AI service temporarily unavailable'}), 500
            
    except Exception as e:
        print(f"Generate endpoint error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/test', methods=['POST'])
def test_endpoint():
    """Test endpoint for basic functionality"""
    try:
        data = request.get_json()
        return jsonify({
            'status': 'success',
            'message': 'Test endpoint working',
            'received_data': data,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/simple', methods=['POST'])
def simple_endpoint():
    """Simple test endpoint"""
    try:
        data = request.get_json()
        message = data.get('message', 'No message provided')
        
        return jsonify({
            'status': 'success',
            'echo': message,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/news', methods=['GET'])
def get_news():
    """Get latest financial news"""
    try:
        news_data = get_financial_news()
        return jsonify({'news': news_data})
    except Exception as e:
        print(f"Error in get_news: {e}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🤖 Starting AI Chatbot Server...")
    print(f"🔑 Gemini API Key configured: {'Yes' if GEMINI_API_KEY else 'No'}")
    app.run(host='0.0.0.0', port=5003, debug=True)
