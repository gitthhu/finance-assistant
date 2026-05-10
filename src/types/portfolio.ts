// 持仓和交易相关类型定义

export interface PortfolioItem {
  id?: string;
  symbol: string;
  symbolType: 'stock' | 'fund';
  buyDate: string;
  buyPrice: number;
  quantity: number;
  currentPrice: number;
  status: 'holding' | 'sold';
  notes?: string;
  created_at?: string;
  // 计算字段
  avgCost?: number;
  profitLoss?: number;
  profitLossPercent?: number;
}

export interface Transaction {
  id?: string;
  portfolioId?: string;
  transactionType: 'buy' | 'sell' | 'dividend';
  symbol: string;
  symbolType: 'stock' | 'fund';
  price: number;
  quantity: number;
  amount: number;
  date: string;
  notes?: string;
  created_at?: string;
}

export interface Alert {
  id?: string;
  symbol: string;
  symbolType: 'stock' | 'fund';
  alertType: 'above' | 'below';
  targetPrice: number;
  isActive: boolean;
  triggeredAt?: string;
  created_at?: string;
}

export interface WatchlistItem {
  id?: string;
  symbol: string;
  symbolType: 'stock' | 'fund';
  addedAt?: string;
}

export interface FundQuote {
  code: string;
  name: string;
  nav: number;
  navChange: number;
  navChangePercent: number;
  navDate: string;
  cumulativeNav: number;
}

export interface PortfolioSummary {
  totalAssets: number;
  totalCost: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  todayProfitLoss: number;
  holdingCount: number;
}
