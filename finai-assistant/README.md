# FinAI Assistant

An AI-powered financial assistant that provides investment recommendations and answers financial queries.

## Project Structure

- `server/`: Flask backend that handles AI integration and stock data
- `src/`: React frontend application
- `public/`: Static assets for the frontend

## Setup Instructions

### Backend Setup

1. Install Python 3.9+ if not already installed
2. Navigate to the project root directory
3. Create a virtual environment:
   ```
   python -m venv venv
   ```
4. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`
5. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```
6. Create a `.env` file in the server directory with your API keys:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key
   RAPIDAPI_KEY=your_rapidapi_key
   RAPIDAPI_HOST=yahoo-finance-real-time1.p.rapidapi.com
   ```
7. Start the Flask server:
   ```
   cd server
   python app.py
   ```
   The server will run on http://localhost:5000

### Frontend Setup

1. Install Node.js 14+ and npm if not already installed
2. Navigate to the project root directory
3. Create a `.env` file in the project root with:
   ```
   REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_app.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   REACT_APP_NEWS_API_KEY=your_news_api_key
   REACT_APP_GEMINI_API_KEY=your_gemini_api_key
   ```
4. Install frontend dependencies:
   ```
   npm install
   ```
5. Start the development server:
   ```
   npm start
   ```
   The frontend will run on http://localhost:3000

## API Keys Required

This project uses several external APIs. You'll need to obtain API keys for:

1. **Google Generative AI API (Gemini)** - For AI responses
   - Get it from: https://makersuite.google.com/app/apikey

2. **News API** - For financial news
   - Get it from: https://newsapi.org/register

3. **RapidAPI Yahoo Finance API** - For stock data
   - Get it from: https://rapidapi.com/apidojo/api/yahoo-finance1

4. **Alpha Vantage API** - As fallback for financial data
   - Get it from: https://www.alphavantage.co/support/#api-key

5. **Firebase** - For user data and authentication
   - Set up a project at: https://console.firebase.google.com/

## Features

- Real-time stock price data from multiple sources
- Investment recommendations based on user preferences and risk profile
- Financial news integration from NewsAPI
- Retrieval-Augmented Generation (RAG) for improved responses
- Multi-level fallback system for reliability 