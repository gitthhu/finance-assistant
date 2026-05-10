"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Star, RefreshCw } from "lucide-react";
import Link from "next/link";
import { KLineChart } from "@/components/charts/KLineChart";
import { useStock } from "@/hooks/useStocks";
import { usePolling } from "@/hooks/usePolling";

export default function StockDetailPage({
  params,
}: {
  params: { symbol: string };
}) {
  const { quote, history, indicators, loading, error, refetch } = useStock(params.symbol);
  const [isAlertSet, setIsAlertSet] = useState(false);

  // 实时更新：每30秒刷新一次数据
  usePolling(
    async () => {
      refetch();
      return true;
    },
    30000, // 30秒
    false // 不立即执行，因为 useStock 已经获取了数据
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-lg">加载中...</span>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="space-y-6">
        <Link
          href="/stocks"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回列表
        </Link>
        <Card>
          <CardContent className="p-6 text-center text-red-500">
            {error || "未找到股票信息"}
          </CardContent>
        </Card>
      </div>
    );
  }

  const isUp = quote.change >= 0;
  const colorClass = isUp ? "text-red-500" : "text-green-500"; // A股红涨绿跌
  const bgColorClass = isUp ? "bg-red-50" : "bg-green-50";

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <div className="flex items-center justify-between">
        <Link
          href="/stocks"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回列表
        </Link>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => refetch()}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          刷新
        </Button>
      </div>

      {/* 股票基本信息 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{quote.name}</h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {quote.symbol}
            </span>
            <Badge variant="secondary">{quote.market || "A股"}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon">
            <Star className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setIsAlertSet(!isAlertSet);
              alert(isAlertSet ? "已取消价格提醒" : "已设置价格提醒");
            }}
          >
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
              <div className="mt-2 text-xs text-muted-foreground">
                数据更新时间: {new Date().toLocaleTimeString("zh-CN")}
                <span className="ml-2 text-green-500">(实时更新中...)</span>
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

      {/* K线图 */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>K线图</CardTitle>
          </CardHeader>
          <CardContent>
            <KLineChart
              history={history}
              height={400}
              showVolume={true}
            />
          </CardContent>
        </Card>
      )}

      {/* 技术指标 */}
      {indicators && (
        <Card>
          <CardHeader>
            <CardTitle>技术指标</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">MACD</div>
                <div className="mt-1 text-lg font-bold">
                  {indicators.macd && indicators.macd.length > 0
                    ? indicators.macd[indicators.macd.length - 1].MACD.toFixed(3)
                    : "-"}
                </div>
                <div className="mt-1 text-sm">
                  信号: <span className={indicators.signal === "买入" ? "text-red-500" : "text-green-500"}>
                    {indicators.signal || "-"}
                  </span>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">RSI</div>
                <div className="mt-1 text-lg font-bold">
                  {indicators.rsi && indicators.rsi.length > 0
                    ? indicators.rsi[indicators.rsi.length - 1].rsi.toFixed(2)
                    : "-"}
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="text-sm text-muted-foreground">KDJ</div>
                <div className="mt-1 text-sm">
                  K: {indicators.kdj && indicators.kdj.length > 0 ? indicators.kdj[indicators.kdj.length - 1].K.toFixed(2) : "-"}<br />
                  D: {indicators.kdj && indicators.kdj.length > 0 ? indicators.kdj[indicators.kdj.length - 1].D.toFixed(2) : "-"}<br />
                  J: {indicators.kdj && indicators.kdj.length > 0 ? indicators.kdj[indicators.kdj.length - 1].J.toFixed(2) : "-"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
