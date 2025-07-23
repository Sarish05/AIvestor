import yfinance as yf
import pandas as pd
import time
from datetime import datetime

def get_current_stock_data(ticker_symbol):
    """
    Fetches the nearly real-time data for a given stock ticker symbol
    from Yahoo Finance using yfinance.

    Note: For non-US markets like NSE/BSE, this data is typically 15-minute delayed.
    """
    try:
        stock = yf.Ticker(ticker_symbol)

        # Get current info (often contains delayed real-time price)
        # The 'info' attribute contains a dictionary of various current details.
        # 'regularMarketPrice' is usually the most relevant "current" price.
        # 'currentPrice' is another common key that might hold the same value.
        info = stock.info

        current_price = info.get('regularMarketPrice') or info.get('currentPrice')
        previous_close = info.get('previousClose')
        day_high = info.get('dayHigh')
        day_low = info.get('dayLow')
        volume = info.get('volume')
        market_open_time_unix = info.get('regularMarketOpen')
        market_time_stamp_unix = info.get('regularMarketTime')


        print(f"--- Data for {ticker_symbol} ---")
        if current_price:
            print(f"Current Price (delayed): {current_price:.2f}")
        else:
            print("Current Price: Not available or market closed.")

        if previous_close:
            print(f"Previous Close: {previous_close:.2f}")
        if day_high:
            print(f"Day High: {day_high:.2f}")
        if day_low:
            print(f"Day Low: {day_low:.2f}")
        if volume:
            print(f"Volume: {volume:,}")

        if market_time_stamp_unix:
            # Convert Unix timestamp to human-readable datetime
            market_time = datetime.fromtimestamp(market_time_stamp_unix)
            print(f"Last Update Time (server time): {market_time.strftime('%Y-%m-%d %H:%M:%S')}")
        else:
            print("Last Update Time: Not available.")

        print("-" * 30)

    except Exception as e:
        print(f"Error fetching data for {ticker_symbol}: {e}")
        print("Please ensure the ticker symbol is correct and you have an active internet connection.")
        print("Yahoo Finance may also temporarily rate-limit requests if too many are made quickly.")


def get_intraday_data(ticker_symbol, interval="1m", period="1d"):
    """
    Fetches intraday historical data for a given stock ticker symbol.
    Intervals: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
    Periods: 1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max
    Note: 1m data is only for the last 7 days. Intraday data (<1d interval) is only for the last 60 days.
    """
    print(f"\n--- Intraday Data for {ticker_symbol} ({period} period, {interval} interval) ---")
    try:
        data = yf.download(ticker_symbol, period=period, interval=interval)
        if not data.empty:
            print(data.tail()) # Print the last few rows of the DataFrame
        else:
            print("No intraday data available for the given period/interval.")
    except Exception as e:
        print(f"Error fetching intraday data for {ticker_symbol}: {e}")

# --- Examples for Indian Stocks (NSE tickers usually end with .NS) ---

# Example 1: Get nearly real-time data for Reliance Industries (NSE)
get_current_stock_data("RELIANCE.NS")

# Example 2: Get nearly real-time data for Infosys (NSE)
get_current_stock_data("INFY.NS")

# Example 3: Get nearly real-time data for State Bank of India (NSE)
get_current_stock_data("SBIN.NS")

# Example 4: Get nearly real-time data for Nifty 50 Index
get_current_stock_data("^NSEI") # ^NSEI is the ticker for Nifty 50

# Example 5: Get 1-minute intraday data for TCS for the current day (if market is open)
# This will also be 15-minute delayed
print("\nFetching 1-minute intraday data for TCS for the current day...")
get_intraday_data("TCS.NS", interval="1m", period="1d")

# You can put this in a loop to periodically update, but be mindful of rate limits
# For example, update every 60 seconds (1 minute)
# print("\n--- Continuously updating INFY.NS (Ctrl+C to stop) ---")
# while True:
#     get_current_stock_data("INFY.NS")
#     time.sleep(60) # Wait for 60 seconds before fetching again