/**
 * 浏览器本地存储工具库
 * 用于替代 Supabase 数据库
 */

const PREFIX = "finance_app_";

/**
 * 获取数据
 */
export function getStorageData<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  
  try {
    const data = localStorage.getItem(PREFIX + key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`读取 ${key} 失败:`, error);
    return [];
  }
}

/**
 * 保存数据
 */
export function setStorageData<T>(key: string, data: T[]): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch (error) {
    console.error(`保存 ${key} 失败:`, error);
  }
}

/**
 * 添加单条数据
 */
export function addStorageData<T extends { id?: string }>(
  key: string,
  item: T
): T {
  const data = getStorageData<T>(key);
  const newItem = {
    ...item,
    id: item.id || Date.now().toString(),
    created_at: new Date().toISOString(),
  };
  data.push(newItem);
  setStorageData(key, data);
  return newItem as T;
}

/**
 * 更新单条数据
 */
export function updateStorageData<T extends { id: string }>(
  key: string,
  id: string,
  updates: Partial<T>
): T | null {
  const data = getStorageData<T>(key);
  const index = data.findIndex((item: any) => item.id === id);
  
  if (index === -1) return null;
  
  data[index] = { ...data[index], ...updates };
  setStorageData(key, data);
  return data[index] as T;
}

/**
 * 删除单条数据
 */
export function deleteStorageData<T extends { id: string }>(
  key: string,
  id: string
): boolean {
  const data = getStorageData<T>(key);
  const filtered = data.filter((item: any) => item.id !== id);
  
  if (filtered.length === data.length) return false;
  
  setStorageData(key, filtered);
  return true;
}

/**
 * 生成模拟数据（用于演示）
 */
export function generateMockData() {
  // 模拟股票数据
  const stocks = [
    {
      id: "1",
      symbol: "600519",
      name: "贵州茅台",
      market: "A",
      industry: "白酒",
      list_date: "2001-08-27",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      symbol: "000001",
      name: "平安银行",
      market: "A",
      industry: "银行",
      list_date: "1991-04-03",
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      symbol: "AAPL",
      name: "Apple Inc.",
      market: "US",
      industry: "科技",
      list_date: "1980-12-12",
      created_at: new Date().toISOString(),
    },
  ];
  
  setStorageData("stocks", stocks);
  
  // 模拟价格历史
  const priceHistory = [];
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const basePrice = 1800 + Math.random() * 200;
    
    priceHistory.push({
      id: `ph_${i}`,
      symbol: "600519",
      date: date.toISOString().split("T")[0],
      open: basePrice - Math.random() * 20,
      high: basePrice + Math.random() * 30,
      low: basePrice - Math.random() * 30,
      close: basePrice + Math.random() * 40 - 20,
      volume: Math.floor(Math.random() * 1000000),
      created_at: new Date().toISOString(),
    });
  }
  
  setStorageData("price_history", priceHistory);
  
  // 模拟持仓
  const portfolio = [
    {
      id: "1",
      symbol: "600519",
      symbol_type: "stock",
      buy_date: "2024-01-15",
      buy_price: 1680,
      quantity: 100,
      status: "holding",
      current_price: 1850,
      profit_loss: 17000,
      profit_loss_rate: 10.12,
      created_at: new Date().toISOString(),
    },
  ];
  
  setStorageData("portfolio", portfolio);
  
  // 模拟交易记录
  const transactions = [
    {
      id: "1",
      portfolio_id: "1",
      symbol: "600519",
      symbol_type: "stock",
      transaction_type: "buy",
      price: 1680,
      quantity: 100,
      amount: 168000,
      transaction_date: "2024-01-15",
      note: "首次买入",
      created_at: new Date().toISOString(),
    },
  ];
  
  setStorageData("transactions", transactions);
  
  // 模拟关注列表
  const watchlist = [
    {
      id: "1",
      symbol: "600519",
      symbol_type: "stock",
      added_at: new Date().toISOString(),
    },
  ];
  
  setStorageData("watchlist", watchlist);
  
  // 模拟提醒
  const alerts = [
    {
      id: "1",
      symbol: "600519",
      symbol_type: "stock",
      alert_type: "price_above",
      target_price: 2000,
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ];
  
  setStorageData("alerts", alerts);
  
  console.log("✅ 模拟数据生成成功！");
  
  return {
    stocks,
    priceHistory,
    portfolio,
    transactions,
    watchlist,
    alerts,
  };
}
