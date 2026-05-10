"use client";

import React, { useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { StockHistory, TechnicalIndicators } from "@/types/stock";

interface StockChartProps {
  history: StockHistory[];
  indicators?: TechnicalIndicators;
  height?: number;
}

/**
 * 股票K线图组件
 * 使用 Recharts 实现价格走势图和成交量图
 */
export function StockChart({ history, indicators, height = 500 }: StockChartProps) {
  // 准备价格图表数据
  const priceData = useMemo(() => {
    return history.map((item) => ({
      date: item.date,
      price: item.close,
      open: item.open,
      high: item.high,
      low: item.low,
      volume: item.volume,
    }));
  }, [history]);

  // 准备技术指标数据
  const indicatorData = useMemo(() => {
    if (!indicators) return { macd: [], rsi: [], kdj: [] };

    const macdData = indicators.macd.map((item) => ({
      date: item.date,
      macd: item.macd,
      signal: item.signal,
      histogram: item.histogram,
    }));

    const rsiData = indicators.rsi.map((item) => ({
      date: item.date,
      rsi: item.rsi,
    }));

    const kdjData = indicators.kdj.map((item) => ({
      date: item.date,
      k: item.k,
      d: item.d,
      j: item.j,
    }));

    return { macd: macdData, rsi: rsiData, kdj: kdjData };
  }, [indicators]);

  if (!history || history.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-400">暂无数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 价格走势图 */}
      <div>
        <h3 className="text-lg font-semibold mb-2">价格走势</h3>
        <ResponsiveContainer width="100%" height={height * 0.6}>
          <LineChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => value.slice(5)} // 只显示MM-DD
            />
            <YAxis
              domain={["auto", "auto"]}
              tickFormatter={(value) => value.toFixed(2)}
            />
            <Tooltip
              formatter={(value: number) => [value.toFixed(2), "价格"]}
              labelFormatter={(label) => `日期: ${label}`}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3B82F6"
              dot={false}
              name="收盘价"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 成交量图 */}
      <div>
        <h3 className="text-lg font-semibold mb-2">成交量</h3>
        <ResponsiveContainer width="100%" height={height * 0.4}>
          <BarChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => value.slice(5)}
            />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [
                `${(value / 1000000).toFixed(2)}M`,
                "成交量",
              ]}
            />
            <Bar dataKey="volume" fill="#8884d8" name="成交量" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* MACD图 */}
      {indicators && indicatorData.macd.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">MACD</h3>
          <ResponsiveContainer width="100%" height={height * 0.4}>
            <BarChart data={indicatorData.macd}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => value.slice(5)}
              />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="histogram"
                name="MACD柱"
                fill="#8884d8"
              />
              <Line
                type="monotone"
                dataKey="macd"
                stroke="#FF7300"
                dot={false}
                name="MACD线"
              />
              <Line
                type="monotone"
                dataKey="signal"
                stroke="#387908"
                dot={false}
                name="信号线"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* RSI图 */}
      {indicators && indicatorData.rsi.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">RSI</h3>
          <ResponsiveContainer width="100%" height={height * 0.3}>
            <LineChart data={indicatorData.rsi}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => value.slice(5)}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <ReferenceLine y={70} stroke="red" strokeDasharray="3 3" />
              <ReferenceLine y={30} stroke="green" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="rsi"
                stroke="#8884d8"
                dot={false}
                name="RSI"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* KDJ图 */}
      {indicators && indicatorData.kdj.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">KDJ</h3>
          <ResponsiveContainer width="100%" height={height * 0.3}>
            <LineChart data={indicatorData.kdj}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => value.slice(5)}
              />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="k"
                stroke="#FF7300"
                dot={false}
                name="K值"
              />
              <Line
                type="monotone"
                dataKey="d"
                stroke="#387908"
                dot={false}
                name="D值"
              />
              <Line
                type="monotone"
                dataKey="j"
                stroke="#8884d8"
                dot={false}
                name="J值"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 买卖建议 */}
      {indicators && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">智能建议</h3>
          <div
            className={`text-2xl font-bold ${
              indicators.signal === "买入"
                ? "text-green-600"
                : indicators.signal === "卖出"
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {indicators.signal}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {indicators.signal === "买入" && "多个指标显示买入信号，可考虑建仓"}
            {indicators.signal === "卖出" && "多个指标显示卖出信号，可考虑止盈"}
            {indicators.signal === "持有" && "指标中性，建议继续持有观望"}
          </p>
        </div>
      )}
    </div>
  );
}
