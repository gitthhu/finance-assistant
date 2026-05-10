// Yahoo Finance API 封装 - 用于美股数据
// 使用 yahoo-finance2 库

export interface StockQuote {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
}

export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

/**
 * 获取美股实时行情
 */
export async function getUSStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    // 使用 Yahoo Finance API (通过代理或直接使用)
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result) return null;
    
    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];
    const timestamp = result.timestamp?.[result.timestamp.length - 1];
    const close = quote?.close?.[quote.close.length - 1];
    const open = quote?.open?.[0];
    const high = Math.max(...(quote?.high?.filter(Boolean) || []));
    const low = Math.min(...(quote?.low?.filter(Boolean) || []));
    const volume = quote?.volume?.[quote.volume.length - 1] || 0;
    
    const prevClose = meta.chartPreviousClose || close;
    const change = close - prevClose;
    const changePercent = (change / prevClose) * 100;
    
    return {
      symbol: meta.symbol,
      name: meta.longName || meta.shortName,
      price: close,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      open,
      high,
      low,
      volume,
      marketCap: meta.marketCap,
    };
  } catch (error) {
    console.error(`获取美股 ${symbol} 行情失败:`, error);
    return null;
  }
}

/**
 * 获取美股历史数据
 */
export async function getUSStockHistory(
  symbol: string,
  period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'max' = '1y'
): Promise<HistoricalData[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${period}&interval=1d`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result) return [];
    
    const timestamps = result.timestamp || [];
    const quote = result.indicators?.quote?.[0] || {};
    
    const history: HistoricalData[] = timestamps.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      open: quote.open?.[index] || 0,
      high: quote.high?.[index] || 0,
      low: quote.low?.[index] || 0,
      close: quote.close?.[index] || 0,
      volume: quote.volume?.[index] || 0,
      adjClose: quote.adjclose?.[index],
    }));
    
    return history.filter(h => h.close > 0);
  } catch (error) {
    console.error(`获取美股 ${symbol} 历史数据失败:`, error);
    return [];
  }
}

/**
 * 搜索美股
 */
export async function searchUSStocks(query: string): Promise<Array<{symbol: string, name: string}>> {
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const quotes = data.quotes || [];
    
    return quotes
      .filter((q: any) => q.symbol && q.longname)
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.longname || q.shortname || q.symbol,
      }));
  } catch (error) {
    console.error('搜索美股失败:', error);
    return [];
  }
}
