"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useFunds } from "@/hooks/useFunds";
import { usePolling } from "@/hooks/usePolling";

export default function FundsPage() {
  const { funds, loading, error, refetch } = useFunds();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("全部");

  // 实时更新：每30秒刷新一次数据
  usePolling(
    async () => {
      refetch();
      return true;
    },
    30000, // 30秒
    false // 不立即执行，因为 useFunds 已经获取了数据
  );

  // 筛选逻辑
  const filteredFunds = funds.filter((fund) => {
    const matchesSearch =
      fund.name.includes(searchTerm) || fund.code.includes(searchTerm);
    const matchesType =
      selectedType === "全部" || fund.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">基金</h1>
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
                  placeholder="搜索基金代码或名称..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              {["全部", "公募基金", "混合基金", "指数基金", "ETF"].map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  onClick={() => setSelectedType(type)}
                >
                  {type}
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

      {/* 基金列表 */}
      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredFunds.map((fund) => {
            const isUp = fund.change >= 0;
            const colorClass = isUp ? "text-red-500" : "text-green-500"; // A股红涨绿跌
            
            return (
              <Card key={fund.code} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{fund.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {fund.code}
                      </p>
                    </div>
                    <Badge variant="secondary">{fund.type}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">净值</span>
                      <span className="font-medium">{fund.nav.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">涨跌幅</span>
                      <span className={`font-medium ${colorClass}`}>
                        {isUp ? "+" : ""}
                        {fund.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">近1年收益</span>
                      <span className={`font-medium ${fund.return1y >= 0 ? "text-red-500" : "text-green-500"}`}>
                        {fund.return1y >= 0 ? "+" : ""}
                        {fund.return1y}%
                      </span>
                    </div>
                  </div>
                  <Link href={`/funds/${fund.code}`}>
                    <Button className="mt-4 w-full" variant="outline">
                      查看详情
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!loading && !error && filteredFunds.length === 0 && (
        <div className="text-center text-muted-foreground p-8">
          暂无数据
        </div>
      )}

      {/* 实时更新提示 */}
      <div className="text-center text-xs text-muted-foreground">
        数据每30秒自动更新 <span className="text-green-500">(实时更新中...)</span>
      </div>
    </div>
  );
}
