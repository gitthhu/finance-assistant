// 通用类型定义

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

export type MarketType = 'A' | 'HK' | 'US';
export type SymbolType = 'stock' | 'fund';
export type TransactionType = 'buy' | 'sell' | 'dividend';
export type AlertType = 'above' | 'below';
export type PortfolioStatus = 'holding' | 'sold';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  [key: string]: any;
}
