"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";

// 模拟数据
const mockPortfolio = {
  totalAssets: 125000,
  totalCost: 110000,
  totalProfit: 15000,
  totalProfitPercent: 13.6,
  holdings: [
    {
      id: "1",
      symbol: "000001.SZ",
      name: "平安银行",
      buyDate: "2024-01-15",
      buyPrice: 10.5,
      quantity: 1000,
      currentPrice: 12.5,
      profit: 2000,
      profitPercent: 19.0,
    },
    {
      id: "2",
      symbol: "AAPL",
      name: "Apple Inc.",
      buyDate: "2024-02-20",
      buyPrice: 170.0,
      quantity: 50,
      currentPrice: 178.5,
      profit: 425,
      profitPercent: 5.0,
    },
  ],
  transactions: [
    {
      date: "2024-01-15",
      symbol: "000001.SZ",
      type: "buy",
      price: 10.5,
      quantity: 1000,
    },
    {
      date: "2024-02-20",
      symbol: "AAPL",
      type: "buy",
      price: 170.0,
      quantity: 50,
    },
  ],
};

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState(mockPortfolio.holdings);
  const [transactions, setTransactions] = useState(mockPortfolio.transactions);
  const [showBuyForm, setShowBuyForm] = useState(false);
  const [showSellForm, setShowSellForm] = useState<string | null>(null);
  const [buyForm, setBuyForm] = useState({ symbol: "", name: "", price: "", quantity: "", date: "" });
  const [sellPrice, setSellPrice] = useState<string>("");
  const [sellQuantity, setSellQuantity] = useState<string>("");

  const handleBuy = () => {
    if (buyForm.symbol && buyForm.name && buyForm.price && buyForm.quantity) {
      const newHolding = {
        id: Date.now().toString(),
        symbol: buyForm.symbol,
        name: buyForm.name,
        buyDate: buyForm.date || new Date().toISOString().split("T")[0],
        buyPrice: parseFloat(buyForm.price),
        quantity: parseInt(buyForm.quantity),
        currentPrice: parseFloat(buyForm.price),
        profit: 0,
        profitPercent: 0,
      };
      setHoldings([newHolding, ...holdings]);
      setTransactions([
        { date: newHolding.buyDate, symbol: buyForm.symbol, type: "buy", price: parseFloat(buyForm.price), quantity: parseInt(buyForm.quantity) },
        ...transactions,
      ]);
      setShowBuyForm(false);
      setBuyForm({ symbol: "", name: "", price: "", quantity: "", date: "" });
      alert(`成功买入 ${buyForm.name}！`);
    }
  };

  const handleSell = (id: string) => {
    if (sellPrice && sellQuantity) {
      alert(`卖出持仓 ${id}：价格 ¥${sellPrice}，数量 ${sellQuantity}`);
      setShowSellForm(null);
      setSellPrice("");
      setSellQuantity("");
    }
  };

  // 计算总览数据
  const totalAssets = holdings.reduce((sum, h) => sum + h.currentPrice * h.quantity, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.buyPrice * h.quantity, 0);
  const totalProfit = totalAssets - totalCost;
  const totalProfitPercent = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">持仓</h1>
        <Button onClick={() => setShowBuyForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          买入
        </Button>
      </div>

      {/* 买入表单 */}
      {showBuyForm && (
        <Card>
          <CardHeader>
            <CardTitle>买入股票/基金</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">代码</label>
                <Input
                  placeholder="如：000001.SZ"
                  value={buyForm.symbol}
                  onChange={(e) => setBuyForm({ ...buyForm, symbol: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">名称</label>
                <Input
                  placeholder="如：平安银行"
                  value={buyForm.name}
                  onChange={(e) => setBuyForm({ ...buyForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">买入价格</label>
                <Input
                  type="number"
                  placeholder="如：12.5"
                  value={buyForm.price}
                  onChange={(e) => setBuyForm({ ...buyForm, price: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">数量</label>
                <Input
                  type="number"
                  placeholder="如：1000"
                  value={buyForm.quantity}
                  onChange={(e) => setBuyForm({ ...buyForm, quantity: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">日期</label>
                <Input
                  type="date"
                  value={buyForm.date}
                  onChange={(e) => setBuyForm({ ...buyForm, date: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleBuy}>确认买入</Button>
              <Button variant="outline" onClick={() => setShowBuyForm(false)}>取消</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 收益概览 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总资产</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{totalAssets.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总成本</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ¥{totalCost.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总收益</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalProfit >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {totalProfit >= 0 ? "+" : ""}¥
              {totalProfit.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">收益率</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                totalProfitPercent >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {totalProfitPercent >= 0 ? "+" : ""}
              {totalProfitPercent.toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 持仓列表 */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">持仓列表</h2>
        {holdings.length === 0 ? (
          <p className="text-muted-foreground">暂无持仓，点击"买入"按钮添加</p>
        ) : (
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left text-sm font-medium">代码</th>
                  <th className="p-4 text-left text-sm font-medium">名称</th>
                  <th className="p-4 text-right text-sm font-medium">持仓成本</th>
                  <th className="p-4 text-right text-sm font-medium">最新价</th>
                  <th className="p-4 text-right text-sm font-medium">盈亏</th>
                  <th className="p-4 text-right text-sm font-medium">收益率</th>
                  <th className="p-4 text-right text-sm font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => (
                  <tr key={holding.id} className="border-b">
                    <td className="p-4 text-sm">{holding.symbol}</td>
                    <td className="p-4 text-sm font-medium">{holding.name}</td>
                    <td className="p-4 text-right text-sm">
                      ¥{holding.buyPrice}
                    </td>
                    <td className="p-4 text-right text-sm font-medium">
                      ¥{holding.currentPrice}
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
                        holding.profitPercent >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {holding.profitPercent >= 0 ? "+" : ""}
                      {holding.profitPercent}%
                    </td>
                    <td className="p-4 text-right text-sm">
                      {showSellForm === holding.id ? (
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="价格"
                            value={sellPrice}
                            onChange={(e) => setSellPrice(e.target.value)}
                            className="w-20 rounded border px-2 py-1 text-xs"
                          />
                          <input
                            type="number"
                            placeholder="数量"
                            value={sellQuantity}
                            onChange={(e) => setSellQuantity(e.target.value)}
                            className="w-20 rounded border px-2 py-1 text-xs"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleSell(holding.id)}
                          >
                            确认
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowSellForm(null)}
                          >
                            取消
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSellForm(holding.id)}
                        >
                          <Minus className="mr-1 h-3 w-3" />
                          卖出
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 交易历史 */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">交易历史</h2>
        {transactions.length === 0 ? (
          <p className="text-muted-foreground">暂无交易记录</p>
        ) : (
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-4 text-left text-sm font-medium">日期</th>
                  <th className="p-4 text-left text-sm font-medium">代码</th>
                  <th className="p-4 text-left text-sm font-medium">类型</th>
                  <th className="p-4 text-right text-sm font-medium">价格</th>
                  <th className="p-4 text-right text-sm font-medium">数量</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-4 text-sm">{tx.date}</td>
                    <td className="p-4 text-sm">{tx.symbol}</td>
                    <td className="p-4 text-sm">
                      <Badge
                        variant={
                          tx.type === "buy" ? "default" : "destructive"
                        }
                      >
                        {tx.type === "buy" ? "买入" : "卖出"}
                      </Badge>
                    </td>
                    <td className="p-4 text-right text-sm">¥{tx.price}</td>
                    <td className="p-4 text-right text-sm">{tx.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
