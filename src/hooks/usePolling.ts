"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/**
 * 通用轮询Hook
 * @param fetchFn 获取数据的函数
 * @param interval 轮询间隔（毫秒），默认30000（30秒）
 * @param immediate 是否立即执行一次，默认true
 */
export function usePolling<T>(
  fetchFn: () => Promise<T>,
  interval: number = 30000,
  immediate: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      setData(result);
    } catch (err: any) {
      setError(err.message || "获取数据失败");
      console.error("轮询获取数据失败:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    // 立即执行一次
    if (immediate) {
      fetchData();
    }

    // 设置轮询
    intervalRef.current = setInterval(fetchData, interval);

    // 清理轮询
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, interval, immediate]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}
