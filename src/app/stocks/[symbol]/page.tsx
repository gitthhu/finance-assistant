"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Star } from "lucide-react";
import Link from "next/link";
import { KLineChart } from "@/components/charts/KLineChart";

// 模拟股票数据
const mockStockData: Record<string, any> = {
  "000001.SZ": {
    symbol: "000001.SZ",
    name: "平安银行",
    market: "A股",
    price: 12.5,
    change: 1.2,
    changePercent: 1.2,
    open: 12.3,
    high: 12.8,
    low: 12.2,
    volume: 50000000,
  },
  "600000.SH": {
    symbol: "600000.SH",
    name: "浦发银行",
    market: "A股",
    price: 8.3,
    change: -0.5,
    changePercent: -0.5,
    open: 8.4,
    high: 8.5,
    low: 8.2,
    volume: 30000000,
  },
  "AAPL": {
    symbol: "AAPL",
    name: "Apple Inc.",
    market: "美股",
    price: 178.5,
    change: 2.1,
    changePercent: 1.2,
    open: 177.0,
    high: 179.5,
    low: 176.5,
    volume: 55000000,
  },
  "TSLA": {
    symbol: "TSLA",
    name: "Tesla Inc.",
    market: "美股",
    price: 245.8,
    change: -1.3,
    changePercent: -0.5,
    open: 247.0,
    high: 248.0,
    low: 244.0,
    volume: 35000000,
  },
};

export default function StockDetailPage({
  params,
}: {
  params: { symbol: string };
}) {
  const [symbol, setSymbol] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setSymbol(params.symbol);
    // 模拟加载
    setTimeout(() => setLoading(false), 500);
  }, [params]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  const quote = mockStockData[symbol] || null;

  if (!quote) {
    return (
      <div className="space-y-6">
        <Link
          href="/stocks"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回列表
        </Link>
        <div className="text-center text-muted-foreground">
          未找到股票信息
        </div>
      </div>
    );
  }

  const isUp = quote.change >= 0;
  const colorClass = isUp ? "text-red-500" : "text-green-500"; // A股红涨绿跌
  const bgColorClass = isUp ? "bg-red-50" : "bg-green-50";

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Link
        href="/stocks"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        返回列表
      </Link>

      {/* 股票基本信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{quote.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {quote.symbol}
            </span>
            <Badge variant="secondary">{quote.market}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Star className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 价格和涨跌 */}
      <Card className={bgColorClass}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold">
                ¥{quote.price.toFixed(2)}
              </div>
              <div className={`mt-1 text-lg ${colorClass}`}>
                {isUp ? "+" : ""}
                {quote.change.toFixed(2)} (
                {quote.changePercent.toFixed(2)}%)
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <div>开盘: ¥{quote.open.toFixed(2)}</div>
              <div>最高: ¥{quote.high.toFixed(2)}</div>
              <div>最低: ¥{quote.low.toFixed(2)}</div>
              <div>成交量: {(quote.volume / 1000000).toFixed(2)}M</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* K线图（模拟数据） */}
      <Card>
        <CardHeader>
          <CardTitle>K线图</CardTitle>
        </CardHeader>
        <CardContent>
          <KLineChart
            history={generateMockHistory()}
            height={400}
            showVolume={true}
          />
        </CardContent>
      </Card>

      {/* 交易操作区 */}
      <Card>
        <CardHeader>
          <CardTitle>交易操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button className="flex-1 bg-red-500 hover:bg-red-600">
              买入
            </Button>
            <Button className="flex-1 bg-green-500 hover:bg-green-600">
              卖出
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 生成模拟历史数据
function generateMockHistory() {
  const history = [];
  const basePrice = 100;
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const open = basePrice + Math.random() * 20 - 10;
    const close = open + Math.random() * 4 - 2;
    history.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat((Math.max(open, close) + Math.random() * 2).toFixed(2)),
      low: parseFloat((Math.min(open, close) - Math.random() * 2).toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 500000,
    });
  }
  return history;
}
