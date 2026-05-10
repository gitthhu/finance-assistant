"use client";

import { useState, useCallback, useEffect } from "react";
import { FundQuote, FundHistory } from "@/types/fund";

/**
 * 基金列表Hook
 */
export function useFunds() {
  const [funds, setFunds] = useState<FundQuote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFunds = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/funds?includeNav=true");
      const data = await response.json();
      
      if (data.success) {
        setFunds(data.data || []);
      } else {
        setError(data.error || "获取基金列表失败");
      }
    } catch (err) {
      setError("网络错误，请稍后重试");
      console.error("获取基金列表失败:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFunds();
  }, [fetchFunds]);

  return {
    funds,
    loading,
    error,
    refetch: fetchFunds,
  };
}

/**
 * 单个基金数据Hook
 */
export function useFund(code: string) {
  const [quote, setQuote] = useState<FundQuote | null>(null);
  const [history, setHistory] = useState<FundHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFund = useCallback(async () => {
    if (!code) return;
    
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
          type: "fund",
          symbol: code,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setQuote(data.data.quote);
        setHistory(data.data.history || []);
      } else {
        setError(data.error || "获取基金数据失败");
      }
    } catch (err) {
      setError("网络错误，请稍后重试");
      console.error("获取基金详情失败:", err);
    } finally {
      setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    fetchFund();
  }, [fetchFund]);

  return {
    quote,
    history,
    loading,
    error,
    refetch: fetchFund,
  };
}
