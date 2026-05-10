"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import Link from "next/link";

// 模拟数据
const mockStocks = [
  {
    symbol: "000001.SZ",
    name: "平安银行",
    market: "A股",
    industry: "金融",
    price: 12.5,
    change: 1.2,
  },
  {
    symbol: "600000.SH",
    name: "浦发银行",
    market: "A股",
    industry: "金融",
    price: 8.3,
    change: -0.5,
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    market: "美股",
    industry: "科技",
    price: 178.5,
    change: 2.1,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    market: "美股",
    industry: "汽车",
    price: 245.8,
    change: -1.3,
  },
];

export default function StocksPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSymbol, setNewSymbol] = useState("");
  const [newName, setNewName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("全部");

  const handleAddStock = () => {
    if (newSymbol && newName) {
      alert(`添加股票：${newSymbol} - ${newName}`);
      setShowAddForm(false);
      setNewSymbol("");
      setNewName("");
    }
  };

  // 筛选逻辑
  const filteredStocks = mockStocks.filter((stock) => {
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
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          添加股票
        </Button>
      </div>

      {/* 添加股票表单 */}
      {showAddForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">添加股票</h3>
            <div className="flex gap-4">
              <Input
                placeholder="股票代码（如：600519）"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
              />
              <Input
                placeholder="股票名称（如：贵州茅台）"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Button onClick={handleAddStock}>确认</Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>取消</Button>
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* 股票列表 */}
      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4 text-left text-sm font-medium">代码</th>
              <th className="p-4 text-left text-sm font-medium">名称</th>
              <th className="p-4 text-left text-sm font-medium">市场</th>
              <th className="p-4 text-left text-sm font-medium">行业</th>
              <th className="p-4 text-right text-sm font-medium">最新价</th>
              <th className="p-4 text-right text-sm font-medium">涨跌幅</th>
              <th className="p-4 text-right text-sm font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredStocks.map((stock) => (
              <tr key={stock.symbol} className="border-b hover:bg-muted/50">
                <td className="p-4 text-sm font-medium">{stock.symbol}</td>
                <td className="p-4 text-sm">{stock.name}</td>
                <td className="p-4 text-sm">
                  <Badge variant="secondary">{stock.market}</Badge>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {stock.industry}
                </td>
                <td className="p-4 text-right text-sm font-medium">
                  ¥{stock.price}
                </td>
                <td
                  className={`p-4 text-right text-sm font-medium ${
                    stock.change >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {stock.change >= 0 ? "+" : ""}
                  {stock.change}%
                </td>
                <td className="p-4 text-right text-sm">
                  <Link href={`/stocks/${stock.symbol}`}>
                    <Button variant="ghost" size="sm">
                      查看
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="sm" disabled>
          上一页
        </Button>
        <span className="text-sm text-muted-foreground">第 1 页</span>
        <Button variant="outline" size="sm">
          下一页
        </Button>
      </div>
    </div>
  );
}
