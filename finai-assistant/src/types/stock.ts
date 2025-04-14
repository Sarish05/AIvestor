export interface StockData {
  SYMBOL: string;
  NAME: string;
  PRICE: number;
  CHANGE: number;
  CHANGE_PERCENT: number;
  VOLUME: string;
  MARKET_CAP: string;
  PREV_CLOSE: number;
  OPEN: number;
  HIGH: number;
  LOW: number;
  CLOSE: number;
  SECTOR: string;
  timestamp: Date;
  lastUpdated: string;
}

export interface StockHistoryData {
  date: Date;
  timestamp?: string; // Added for compatibility with Upstox API
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PortfolioStock {
  symbol: string;
  name: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  totalValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  weight: number;
  sector: string;
  purchaseDate: string;
  lastUpdated: string;
  transactions: Transaction[];
}

export interface MarketStock {
  SYMBOL: string;
  NAME: string;
  PRICE: number;
  CHANGE: number;
  CHANGE_PERCENT: number;
  VOLUME: string;
  MARKET_CAP: string;
  PREV_CLOSE: number;
  OPEN: number;
  HIGH: number;
  LOW: number;
  CLOSE: number;
  SECTOR: string;
  timestamp: Date;
  lastUpdated: string;
}

export interface Transaction {
  date: Date;
  ticker: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  total: number;
}

export interface Portfolio {
  cash: number;
  assets: PortfolioStock[];
  transactions: Transaction[];
  initialInvestment: number;
} 