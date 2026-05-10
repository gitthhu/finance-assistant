"use client";

import { useState, useEffect, useCallback } from "react";
import { StockQuote, StockHistory, TechnicalIndicators } from "@/types/stock";

/**
 * 股票数据Hook
 */
export function useStocks() {
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取股票列表
   */
  const fetchStocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/stocks");
      const data = await response.json();
      
      if (data.success) {
        setStocks(data.data || []);
      } else {
        setError(data.error || "获取股票列表失败");
      }
    } catch (err) {
      setError("网络错误，请稍后重试");
      console.error("获取股票列表失败:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  return {
    stocks,
    loading,
    error,
    refetch: fetchStocks,
  };
}

/**
 * 单个股票数据Hook
 */
export function useStock(symbol: string) {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<StockHistory[]>([]);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取股票详情
   */
  const fetchStock = useCallback(async () => {
    if (!symbol) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // 调用数据抓取API
      const response = await fetch("/api/scraper", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "stock",
          symbol,
          market: detectMarket(symbol),
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQuote(data.data.quote);
        setHistory(data.data.history || []);
        setIndicators(data.data.technicalIndicators || null);
      } else {
        setError(data.error || "获取股票数据失败");
      }
    } catch (err) {
      setError("网络错误，请稍后重试");
      console.error("获取股票详情失败:", err);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchStock();
  }, [fetchStock]);

  return {
    quote,
    history,
    indicators,
    loading,
    error,
    refetch: fetchStock,
  };
}

/**
 * 检测股票市场类型
 */
function detectMarket(symbol: string): string {
  if (symbol.startsWith("6") || symbol.startsWith("5")) {
    return "A"; // 上海
  } else if (symbol.startsWith("0") || symbol.startsWith("3")) {
    return "A"; // 深圳
  } else if (symbol.length === 5 && /^\d+$/.test(symbol)) {
    return "HK"; // 港股
  } else {
    return "US"; // 美股
  }
}
