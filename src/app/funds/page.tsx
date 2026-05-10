"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Plus } from "lucide-react";
import Link from "next/link";

// 模拟数据
const mockFunds = [
  {
    code: "000001",
    name: "华夏成长混合",
    type: "混合基金",
    nav: 1.2345,
    return1y: 15.2,
  },
  {
    code: "110022",
    name: "易方达消费行业",
    type: "公募基金",
    nav: 3.4567,
    return1y: 22.5,
  },
  {
    code: "161725",
    name: "招商中证白酒",
    type: "指数基金",
    nav: 1.0987,
    return1y: -8.3,
  },
];

export default function FundsPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("全部");

  const handleAddFund = () => {
    if (newCode && newName) {
      alert(`添加基金：${newCode} - ${newName}`);
      setShowAddForm(false);
      setNewCode("");
      setNewName("");
    }
  };

  // 筛选逻辑
  const filteredFunds = mockFunds.filter((fund) => {
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
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          添加基金
        </Button>
      </div>

      {/* 添加基金表单 */}
      {showAddForm && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="text-lg font-semibold">添加基金</h3>
            <div className="flex gap-4">
              <Input
                placeholder="基金代码（如：000001）"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
              <Input
                placeholder="基金名称（如：华夏成长混合）"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <Button onClick={handleAddFund}>确认</Button>
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
                  placeholder="搜索基金代码或名称..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              {["全部", "公募基金", "混合基金", "指数基金"].map((type) => (
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

      {/* 基金列表 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredFunds.map((fund) => (
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
                  <span className="font-medium">{fund.nav}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">近1年收益</span>
                  <span
                    className={`font-medium ${
                      fund.return1y >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
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
        ))}
      </div>
    </div>
  );
}
