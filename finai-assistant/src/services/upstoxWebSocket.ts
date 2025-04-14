import { MarketStock } from '../types/stock';
import { upstoxService } from './upstoxService';

type OnDataCallback = (data: MarketStock) => void;

class UpstoxWebSocket {
  private symbols: string[] = [];
  private onDataCallback: OnDataCallback | null = null;
  private feedConnection: { close: () => void } | null = null;
  private connected: boolean = false;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private defaultSymbols = [
    'NSE:RELIANCE', 'NSE:TCS', 'NSE:HDFCBANK', 'NSE:INFY', 'NSE:ICICIBANK',
    'NSE:HINDUNILVR', 'NSE:ITC', 'NSE:SBIN', 'NSE:BHARTIARTL', 'NSE:KOTAKBANK',
    'NSE:WIPRO', 'NSE:TATAMOTORS', 'NSE:MARUTI'
  ];

  constructor() {
    this.symbols = this.defaultSymbols;
  }

  public connect(customSymbols?: string[]): void {
    if (customSymbols && customSymbols.length > 0) {
      this.symbols = customSymbols;
    }

    if (this.connected) {
      this.disconnect();
    }

    this.setupFeed();
    this.connected = true;

    // Initial data fetch for immediate display
    this.fetchInitialData();
  }

  public disconnect(): void {
    if (this.feedConnection) {
      this.feedConnection.close();
      this.feedConnection = null;
    }

    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    this.connected = false;
  }

  public setOnDataCallback(callback: OnDataCallback): void {
    this.onDataCallback = callback;
    
    // If we're not connected yet, connect now
    if (!this.connected) {
      this.connect();
    }
  }

  public addSymbol(symbol: string): void {
    if (!this.symbols.includes(symbol)) {
      this.symbols.push(symbol);
      
      // Reconnect with new symbol if already connected
      if (this.connected) {
        this.disconnect();
        this.connect();
      }
    }
  }

  public removeSymbol(symbol: string): void {
    this.symbols = this.symbols.filter(s => s !== symbol);
    
    // Reconnect with updated symbols if already connected
    if (this.connected) {
      this.disconnect();
      this.connect();
    }
  }

  private async fetchInitialData(): Promise<void> {
    try {
      const data = await upstoxService.fetchMarketData(this.symbols);
      
      if (this.onDataCallback) {
        data.forEach(stock => {
          this.onDataCallback!(stock);
        });
      }
    } catch (error) {
      console.error('Error fetching initial market data:', error);
    }
  }

  private setupFeed(): void {
    if (this.symbols.length > 0 && this.onDataCallback) {
      // Use polling instead of SSE for compatibility with our server
      this.feedConnection = upstoxService.setupMarketFeed(this.symbols, (stock) => {
        if (this.onDataCallback) {
          this.onDataCallback(stock);
        }
      });
      
      // Set up a less frequent refresh to ensure data doesn't get stale
      this.reconnectInterval = setInterval(() => {
        this.fetchInitialData();
      }, 60000); // Refresh every minute
    }
  }
}

export const upstoxWebSocket = new UpstoxWebSocket(); 