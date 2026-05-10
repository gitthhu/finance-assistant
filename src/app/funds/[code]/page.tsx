"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Star, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useFund } from "@/hooks/useFunds";
import { usePolling } from "@/hooks/usePolling";

export default function FundDetailPage({
  params,
}: {
  params: { code: string };
}) {
  const { quote, history, loading, error, refetch } = useFund(params.code);
  const [isAlertSet, setIsAlertSet] = useState(false);

  // 实时更新：每30秒刷新一次数据
  usePolling(
    async () => {
      refetch();
      return true;
    },
    30000, // 30秒
    false // 不立即执行，因为 useFund 已经获取了数据
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
          href="/funds"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          返回列表
        </Link>
        <Card>
          <CardContent className="p-6 text-center text-red-500">
            {error || "未找到基金信息"}
          </CardContent>
        </Card>
      </div>
    );
  }

  const isUp = quote.change >= 0;
  const colorClass = isUp ? "text-red-500" : "text-green-500"; // A股红涨绿跌

  return (
    <div className="space-y-6">
      {/* 返回按钮和刷新 */}
      <div className="flex items-center justify-between">
        <Link
          href="/funds"
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

      {/* 基金基本信息 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{quote.name}</h1>
          <div className="mt-2 flex items-center gap-4">
            <span className="text-muted-foreground">{quote.code}</span>
            <Badge>{quote.type}</Badge>
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
              alert(isAlertSet ? "已取消提醒" : "已设置价格提醒");
            }}
          >
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 净值信息 */}
      <Card>
        <CardContent className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="text-sm text-muted-foreground">最新净值</div>
              <div className="mt-1 text-3xl font-bold">{quote.nav.toFixed(4)}</div>
              <div className={`mt-1 text-lg ${colorClass}`}>
                {isUp ? "+" : ""}
                {quote.change.toFixed(4)} ({quote.changePercent.toFixed(2)}%)
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                数据更新时间: {new Date().toLocaleTimeString("zh-CN")}
                <span className="ml-2 text-green-500">(实时更新中...)</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">基金经理</span>
                <span className="font-medium">{quote.manager}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">基金公司</span>
                <span className="font-medium">{quote.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">基金规模</span>
                <span className="font-medium">{quote.scale}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">成立日期</span>
                <span className="font-medium">{quote.established}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 历史业绩 */}
      <Card>
        <CardHeader>
          <CardTitle>历史业绩</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>近1年收益</span>
              <span className={`font-medium ${quote.return1y >= 0 ? "text-red-500" : "text-green-500"}`}>
                {quote.return1y >= 0 ? "+" : ""}{quote.return1y}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>近3年收益</span>
              <span className={`font-medium ${quote.return3y >= 0 ? "text-red-500" : "text-green-500"}`}>
                {quote.return3y >= 0 ? "+" : ""}{quote.return3y}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 历史净值走势 */}
      {history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>历史净值走势</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              净值走势图（需要集成图表库）
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
