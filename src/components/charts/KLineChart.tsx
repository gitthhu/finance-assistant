"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  type TooltipProps,
} from "recharts";
import { StockHistory } from "@/types/stock";

interface KLineChartProps {
  history: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
  height?: number;
  showVolume?: boolean;
}

/**
 * 专业K线图组件（使用 Recharts Area 模拟K线）
 * 显示：K线、成交量、均线
 */
export function KLineChart({ 
  history, 
  height = 500, 
  showVolume = true 
}: KLineChartProps) {
  
  if (!history || history.length === 0) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 rounded-lg border"
        style={{ height: `${height}px` }}
      >
        <p className="text-gray-400">暂无数据</p>
      </div>
    );
  }

  // 准备图表数据（含均线）
  const chartData = useMemo(() => {
    return history.map((item, index, arr) => {
      const ma5 = index >= 4 ? calcMA(arr.slice(index - 4, index + 1)) : null;
      const ma10 = index >= 9 ? calcMA(arr.slice(index - 9, index + 1)) : null;
      const ma20 = index >= 19 ? calcMA(arr.slice(index - 19, index + 1)) : null;
      
      return {
        ...item,
        ma5,
        ma10,
        ma20,
        // 用于K线颜色判断
        isUp: item.close >= item.open,
      };
    });
  }, [history]);

  const chartHeight = showVolume ? height * 0.65 : height;
  const volumeHeight = height * 0.35;

  return (
    <div className="space-y-2">
      {/* 图例 */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-0.5" style={{ backgroundColor: '#FF6B35' }}></span>
          MA5
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-0.5" style={{ backgroundColor: '#4ECDC4' }}></span>
          MA10
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-4 h-0.5" style={{ backgroundColor: '#45B7D1' }}></span>
          MA20
        </span>
        <span className="ml-auto text-xs">🔴涨 🟢跌</span>
      </div>

      {/* K线图 */}
      <div className="border rounded-lg bg-white p-4">
        <ResponsiveContainer width="100%" height={chartHeight}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 11 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={["auto", "auto"]}
              tick={{ fontSize: 11 }}
              dx={5}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* 收盘价线（模拟K线） */}
            <Area
              type="monotone"
              dataKey="close"
              fill="rgba(239, 68, 68, 0.1)"
              stroke="#ef4444"
              strokeWidth={2}
              name="价格"
              connectNulls
            />
            
            {/* 高低价范围（用透明Area显示波动） */}
            <Area
              type="monotone"
              dataKey="high"
              fill="none"
              stroke="transparent"
              hide
            />
            
            {/* 均线 */}
            <Area
              type="monotone"
              dataKey="ma5"
              fill="none"
              stroke="#FF6B35"
              strokeWidth={1}
              name="MA5"
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="ma10"
              fill="none"
              stroke="#4ECDC4"
              strokeWidth={1}
              name="MA10"
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="ma20"
              fill="none"
              stroke="#45B7D1"
              strokeWidth={1}
              name="MA20"
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 成交量 */}
      {showVolume && (
        <div className="border rounded-lg bg-white p-4">
          <h4 className="text-sm font-medium mb-2">成交量</h4>
          <ResponsiveContainer width="100%" height={volumeHeight}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar 
                dataKey="volume" 
                name="成交量"
                fill="#8884d8"
                opacity={0.6}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/**
 * 自定义Tooltip
 */
function CustomTooltip({ active, payload, label }: TooltipProps<any, any>) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0]?.payload;
  if (!data) return null;

  const isUp = data.close >= data.open;
  const color = isUp ? "#ef4444" : "#22c55e";

  return (
    <div className="bg-white p-3 border rounded-lg shadow-lg min-w-[200px]">
      <p className="font-semibold text-sm mb-2">{label}</p>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">开盘</span>
          <span style={{ color }}>{data.open?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">最高</span>
          <span style={{ color }}>{data.high?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">最低</span>
          <span style={{ color }}>{data.low?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">收盘</span>
          <span className="font-semibold" style={{ color }}>{data.close?.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">成交量</span>
          <span>{(data.volume / 1000000).toFixed(2)}M</span>
        </div>
        {data.ma5 !== null && (
          <div className="flex justify-between gap-4">
            <span style={{ color: '#FF6B35' }}>MA5</span>
            <span style={{ color: '#FF6B35' }}>{data.ma5.toFixed(2)}</span>
          </div>
        )}
        {data.ma10 !== null && (
          <div className="flex justify-between gap-4">
            <span style={{ color: '#4ECDC4' }}>MA10</span>
            <span style={{ color: '#4ECDC4' }}>{data.ma10.toFixed(2)}</span>
          </div>
        )}
        {data.ma20 !== null && (
          <div className="flex justify-between gap-4">
            <span style={{ color: '#45B7D1' }}>MA20</span>
            <span style={{ color: '#45B7D1' }}>{data.ma20.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 计算移动平均
 */
function calcMA(data: { close: number }[]): number {
  if (data.length === 0) return 0;
  const sum = data.reduce((acc, d) => acc + d.close, 0);
  return parseFloat((sum / data.length).toFixed(2));
}
