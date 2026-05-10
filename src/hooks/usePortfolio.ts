"use client";

import { useState, useEffect, useCallback } from "react";
import { PortfolioItem, Transaction } from "@/types/portfolio";

/**
 * 持仓数据Hook
 */
export function usePortfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 获取持仓列表
   */
  const fetchPortfolio = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/portfolio");
      const data = await response.json();
      
      if (data.success) {
        setPortfolio(data.data || []);
      } else {
        setError(data.error || "获取持仓失败");
      }
    } catch (err) {
      setError("网络错误，请稍后重试");
      console.error("获取持仓失败:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 获取交易记录
   */
  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch("/api/transactions");
      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data || []);
      }
    } catch (err) {
      console.error("获取交易记录失败:", err);
    }
  }, []);

  useEffect(() => {
    fetchPortfolio();
    fetchTransactions();
  }, [fetchPortfolio, fetchTransactions]);

  /**
   * 添加交易记录
   */
  const addTransaction = useCallback(async (transaction: Omit<Transaction, "id" | "created_at">) => {
    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchPortfolio();
        await fetchTransactions();
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (err) {
      console.error("添加交易失败:", err);
      return { success: false, error: "网络错误" };
    }
  }, [fetchPortfolio, fetchTransactions]);

  /**
   * 计算总收益
   */
  const calculateTotalReturn = useCallback(() => {
    return portfolio.reduce((total, item) => {
      const returnRate = (item.current_price - item.avg_cost) / item.avg_cost * 100;
      return total + returnRate * item.quantity;
    }, 0);
  }, [portfolio]);

  return {
    portfolio,
    transactions,
    loading,
    error,
    addTransaction,
    calculateTotalReturn,
    refetch: fetchPortfolio,
  };
}
