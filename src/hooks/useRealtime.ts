"use client";

import { useEffect, useRef } from "react";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/**
 * 实时行情Hook
 * 使用 Supabase Realtime 订阅价格更新
 */
export function useRealtimePrice(
  symbols: string[],
  onUpdate: (symbol: string, price: number, change: number) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!symbols || symbols.length === 0) return;

    // 创建Realtime频道
    const channel = supabase
      .channel("price-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "price_history",
          filter: `symbol=in.(${symbols.join(",")})`,
        },
        (payload) => {
          const newData = payload.new;
          if (newData && onUpdate) {
            onUpdate(
              newData.symbol,
              newData.close,
              newData.close - newData.open
            );
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [symbols, onUpdate]);
}

/**
 * 价格提醒Hook
 * 监听价格提醒触发
 */
export function usePriceAlert(
  onAlert: (symbol: string, targetPrice: number, currentPrice: number) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    // 创建Realtime频道监听提醒
    const channel = supabase
      .channel("alert-notifications")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "alerts",
          filter: "is_active=eq.true",
        },
        (payload) => {
          const alert = payload.new;
          if (alert && onAlert) {
            // 检查价格是否达到目标
            // 这里需要结合当前价格判断
            onAlert(alert.symbol, alert.target_price, 0); // currentPrice需要从其他地方获取
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [onAlert]);
}

/**
 * 浏览器通知Hook
 */
export function useBrowserNotification() {
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      console.error("此浏览器不支持桌面通知");
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }, []);

  const sendNotification = useCallback(
    async (title: string, body: string) => {
      const hasPermission = await requestPermission();

      if (hasPermission) {
        new Notification(title, {
          body,
          icon: "/icon-192x192.png",
        });
      }
    },
    [requestPermission]
  );

  return {
    requestPermission,
    sendNotification,
  };
}
