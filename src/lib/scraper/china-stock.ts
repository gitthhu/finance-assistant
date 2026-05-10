// A股和港股数据抓取 - 使用免费API
// 数据源：新浪财经、东方财富

export interface ChinaStockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  amount: number; // 成交额
  market: 'A' | 'HK';
}

export interface ChinaStockHistory {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  amount: number;
}

/**
 * 格式化股票代码为API所需格式
 * A股：600000 -> sh600000 (上海) 或 sz000001 (深圳)
 * 港股：00700 -> hk00700
 */
function formatSymbol(symbol: string, market: 'A' | 'HK'): string {
  if (market === 'HK') {
    return `hk${symbol.replace(/^0+/, '')}`;
  }
  
  // A股判断上海还是深圳
  const prefix = symbol.startsWith('6') ? 'sh' : 'sz';
  return `${prefix}${symbol}`;
}

/**
 * 获取A股/港股实时行情（新浪财经API）
 */
export async function getChinaStockQuote(
  symbol: string,
  market: 'A' | 'HK' = 'A'
): Promise<ChinaStockQuote | null> {
  try {
    const formattedSymbol = formatSymbol(symbol, market);
    const url = `https://hq.sinajs.cn/list=${formattedSymbol}`;
    
    const response = await fetch(url);
    const text = await response.text();
    
    // 解析新浪财经返回的数据
    // 格式: var hq_str_sh600000="浦发银行,12.34,12.35,12.33,12.36,12.32,12.33,10000,123456789,..."
    const match = text.match(/="([^"]+)"/);
    if (!match) return null;
    
    const data = match[1].split(',');
    
    if (market === 'A') {
      // A股数据格式
      const name = data[0];
      const open = parseFloat(data[1]) || 0;
      const close = parseFloat(data[2]) || 0; // 昨收
      const price = parseFloat(data[3]) || 0; // 当前价
      const high = parseFloat(data[4]) || 0;
      const low = parseFloat(data[5]) || 0;
      const volume = parseFloat(data[8]) || 0;
      const amount = parseFloat(data[9]) || 0;
      
      const change = price - close;
      const changePercent = close > 0 ? (change / close) * 100 : 0;
      
      return {
        symbol,
        name,
        price,
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        open,
        high,
        low,
        volume,
        amount,
        market,
      };
    } else {
      // 港股数据格式类似但略有不同
      const name = data[1];
      const price = parseFloat(data[6]) || 0;
      const change = parseFloat(data[7]) || 0;
      const changePercent = parseFloat(data[8]) || 0;
      const volume = parseFloat(data[12]) || 0;
      
      return {
        symbol,
        name,
        price,
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        open: parseFloat(data[2]) || 0,
        high: parseFloat(data[4]) || 0,
        low: parseFloat(data[5]) || 0,
        volume,
        amount: 0,
        market,
      };
    }
  } catch (error) {
    console.error(`获取${market}股 ${symbol} 行情失败:`, error);
    return null;
  }
}

/**
 * 获取A股/港股历史数据（网易财经API）
 */
export async function getChinaStockHistory(
  symbol: string,
  market: 'A' | 'HK' = 'A',
  startDate?: string,
  endDate?: string
): Promise<ChinaStockHistory[]> {
  try {
    // 网易财经API (免费，无需认证)
    const formattedSymbol = market === 'A' 
      ? (symbol.startsWith('6') ? `0${symbol}` : `1${symbol}`)
      : symbol;
    
    const start = startDate || '20240101';
    const end = endDate || new Date().toISOString().split('T')[0].replace(/-/g, '');
    
    const url = `https://quotes.money.163.com/service/chddata.html?code=${formattedSymbol}&start=${start}&end=${end}&fields=TCLOSE;HIGH;LOW;TOPEN;CHG;PCHG;TURNOVER;VOTURNOVER;VATURNOVER`;
    
    const response = await fetch(url);
    const text = await response.text();
    
    // 解析CSV数据
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const history: ChinaStockHistory[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const data = lines[i].split(',');
      if (data.length < 10) continue;
      
      history.push({
        date: data[0], // 日期格式: YYYY-MM-DD
        open: parseFloat(data[5]) || 0,
        high: parseFloat(data[3]) || 0,
        low: parseFloat(data[4]) || 0,
        close: parseFloat(data[1]) || 0,
        volume: parseFloat(data[8]) || 0,
        amount: parseFloat(data[9]) || 0,
      });
    }
    
    return history;
  } catch (error) {
    console.error(`获取${market}股 ${symbol} 历史数据失败:`, error);
    return [];
  }
}

/**
 * 搜索A股（东方财富API）
 */
export async function searchChinaStocks(query: string): Promise<Array<{symbol: string, name: string, market: 'A' | 'HK'}>> {
  try {
    const url = `https://searchapi.eastmoney.com/api/suggest/get?input=${encodeURIComponent(query)}&type=14&token= D43BF722C8E33BDC906FB84D85E326E8&count=10`;
    const response = await fetch(url);
    const data = await response.json();
    
    const results = data.QuotationCodeTable?.Data || [];
    
    return results.map((item: any) => ({
      symbol: item.Code,
      name: item.Name,
      market: item.MarketType === '90' ? 'HK' as const : 'A' as const,
    }));
  } catch (error) {
    console.error('搜索A股失败:', error);
    return [];
  }
}
