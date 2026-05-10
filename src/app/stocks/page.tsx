"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useStocks } from "@/hooks/useStocks";
import { usePolling } from "@/hooks/usePolling";

export default function StocksPage() {
  const { stocks, loading, error, refetch } = useStocks();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("全部");

  // 实时更新：每30秒刷新一次数据
  usePolling(
    async () => {
      refetch();
      return true;
    },
    30000, // 30秒
    false // 不立即执行，因为 useStocks 已经获取了数据
  );

  // 筛选逻辑
  const filteredStocks = stocks.filter((stock) => {
    const matchesSearch =
      stock.name.includes(searchTerm) || stock.symbol.includes(searchTerm);
    const matchesMarket =
      selectedMarket === "全部" || stock.market === selectedMarket;
    return matchesSearch && matchesMarket;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">股票</h1>
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

      {/* 搜索和筛选 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="搜索股票代码或名称..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              {["全部", "A股", "港股", "美股"].map((market) => (
                <Button
                  key={market}
                  variant={selectedMarket === market ? "default" : "outline"}
                  onClick={() => setSelectedMarket(market)}
                >
                  {market}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 加载状态 */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
          <span className="ml-2 text-lg">加载中...</span>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <Card>
          <CardContent className="p-6 text-center text-red-500">
            {error}
          </CardContent>
        </Card>
      )}

      {/* 股票列表 */}
      {!loading && !error && (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left text-sm font-medium">代码</th>
                <th className="p-4 text-left text-sm font-medium">名称</th>
                <th className="p-4 text-left text-sm font-medium">市场</th>
                <th className="p-4 text-right text-sm font-medium">最新价</th>
                <th className="p-4 text-right text-sm font-medium">涨跌幅</th>
                <th className="p-4 text-right text-sm font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map((stock) => {
                const isUp = stock.change >= 0;
                const colorClass = isUp ? "text-red-500" : "text-green-500"; // A股红涨绿跌
                
                return (
                  <tr key={stock.symbol} className="border-b hover:bg-muted/50">
                    <td className="p-4 text-sm font-medium">{stock.symbol}</td>
                    <td className="p-4 text-sm">{stock.name}</td>
                    <td className="p-4 text-sm">
                      <Badge variant="secondary">{stock.market}</Badge>
                    </td>
                    <td className="p-4 text-right text-sm font-medium">
                      ¥{stock.price.toFixed(2)}
                    </td>
                    <td className={`p-4 text-right text-sm font-medium ${colorClass}`}>
                      {isUp ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </td>
                    <td className="p-4 text-right text-sm">
                      <Link href={`/stocks/${stock.symbol}`}>
                        <Button variant="ghost" size="sm">
                          查看
                        </Button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredStocks.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              暂无数据
            </div>
          )}
        </div>
      )}

      {/* 实时更新提示 */}
      <div className="text-center text-xs text-muted-foreground">
        数据每30秒自动更新 <span className="text-green-500">(实时更新中...)</span>
      </div>
    </div>
  );
}
