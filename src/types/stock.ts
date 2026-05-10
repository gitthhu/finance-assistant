// 股票相关类型定义

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  market: 'A' | 'HK' | 'US';
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
}

export interface StockHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  amount?: number;
}

export interface TechnicalIndicators {
  macd: MACDData[];
  rsi: RSIData[];
  kdj: KDJData[];
  signal: '买入' | '卖出' | '持有';
}

export interface MACDData {
  date: string;
  macd: number;
  signal: number;
  histogram: number;
}

export interface RSIData {
  date: string;
  rsi: number;
}

export interface KDJData {
  date: string;
  k: number;
  d: number;
  j: number;
}

export interface Stock {
  id?: string;
  symbol: string;
  name: string;
  market: 'A' | 'HK' | 'US';
  industry?: string;
  created_at?: string;
}

export interface FinancialReport {
  id?: string;
  symbol: string;
  reportDate: string;
  revenue: number;
  profit: number;
  assets: number;
  liabilities: number;
  roe: number;
  roa: number;
  debtRatio: number;
  created_at?: string;
}
