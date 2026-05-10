"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, TrendingDown, Wallet } from "lucide-react";

// 模拟数据（后续从 API 获取）
const mockData = {
  totalAssets: 125000,
  todayProfit: 2500,
  totalProfit: 15000,
  todayProfitPercent: 2.0,
  totalProfitPercent: 13.6,
  holdings: [
    { symbol: "000001.SZ", name: "平安银行", market: "A股", profit: 2000, percent: 19.0 },
    { symbol: "AAPL", name: "Apple Inc.", market: "美股", profit: 425, percent: 5.0 },
  ],
  watchlist: [
    { symbol: "600000.SH", name: "浦发银行", market: "A股", price: 8.30, change: -0.5 },
    { symbol: "TSLA", name: "Tesla Inc.", market: "美股", price: 245.80, change: -1.3 },
  ],
};

export default function DashboardPage() {
  const data = mockData;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">仪表盘</h1>

      {/* 资产概览卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总资产</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{data.totalAssets.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日收益</CardTitle>
            {data.todayProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                data.todayProfit >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {data.todayProfit >= 0 ? "+" : ""}¥
              {data.todayProfit.toLocaleString()}
            </div>
            <p
              className={`text-xs ${
                data.todayProfitPercent >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {data.todayProfitPercent >= 0 ? "+" : ""}
              {data.todayProfitPercent}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">持仓收益</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                data.totalProfit >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {data.totalProfit >= 0 ? "+" : ""}¥
              {data.totalProfit.toLocaleString()}
            </div>
            <p
              className={`text-xs ${
                data.totalProfitPercent >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {data.totalProfitPercent >= 0 ? "+" : ""}
              {data.totalProfitPercent}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">持仓数量</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.holdings.length}
            </div>
            <p className="text-xs text-muted-foreground">只/支</p>
          </CardContent>
        </Card>
      </div>

      {/* 持仓列表 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">持仓列表</h2>
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left text-sm font-medium">代码</th>
                <th className="p-4 text-left text-sm font-medium">名称</th>
                <th className="p-4 text-left text-sm font-medium">市场</th>
                <th className="p-4 text-right text-sm font-medium">盈亏</th>
                <th className="p-4 text-right text-sm font-medium">收益率</th>
              </tr>
            </thead>
            <tbody>
              {data.holdings.map((holding) => (
                <tr key={holding.symbol} className="border-b">
                  <td className="p-4 text-sm">{holding.symbol}</td>
                  <td className="p-4 text-sm font-medium">
                    {holding.name}
                  </td>
                  <td className="p-4 text-sm">
                    <Badge variant="secondary">{holding.market}</Badge>
                  </td>
                  <td
                    className={`p-4 text-right text-sm font-medium ${
                      holding.profit >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {holding.profit >= 0 ? "+" : ""}¥
                    {holding.profit.toLocaleString()}
                  </td>
                  <td
                    className={`p-4 text-right text-sm font-medium ${
                      holding.percent >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {holding.percent >= 0 ? "+" : ""}
                    {holding.percent}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 关注列表 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">关注列表</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.watchlist.map((item) => (
            <Card key={item.symbol}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.symbol}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">¥{item.price}</p>
                    <p
                      className={`text-sm ${
                        item.change >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {item.change >= 0 ? "+" : ""}
                      {item.change}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
