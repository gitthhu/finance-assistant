"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Star } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

// 模拟基金数据
const mockFundData: Record<string, any> = {
  "000001": {
    code: "000001",
    name: "华夏成长混合",
    type: "混合基金",
    nav: 1.2345,
    return1y: 15.2,
    return3y: 45.6,
    manager: "王经理",
    company: "华夏基金",
    scale: "120亿",
    established: "2005-03-15",
  },
  "110022": {
    code: "110022",
    name: "易方达消费行业",
    type: "公募基金",
    nav: 3.4567,
    return1y: 22.5,
    return3y: 68.9,
    manager: "张经理",
    company: "易方达基金",
    scale: "280亿",
    established: "2010-08-20",
  },
  "161725": {
    code: "161725",
    name: "招商中证白酒",
    type: "指数基金",
    nav: 1.0987,
    return1y: -8.3,
    return3y: 25.4,
    manager: "李经理",
    company: "招商基金",
    scale: "450亿",
    established: "2015-06-10",
  },
  "510300": {
    code: "510300",
    name: "华泰柏瑞沪深300ETF",
    type: "ETF",
    nav: 4.5678,
    return1y: 8.9,
    return3y: 35.2,
    manager: "刘经理",
    company: "华泰柏瑞基金",
    scale: "800亿",
    established: "2012-05-28",
  },
};

export default function FundDetailPage({
  params,
}: {
  params: { code: string };
}) {
  const [code, setCode] = useState<string>("");
  const [isAlertSet, setIsAlertSet] = useState(false);

  useEffect(() => {
    setCode(params.code);
  }, [params]);

  const fund = mockFundData[code] || {
    code: code,
    name: "未知基金",
    type: "未知",
    nav: 0,
    return1y: 0,
    return3y: 0,
    manager: "未知",
    company: "未知",
    scale: "未知",
    established: "未知",
  };

  const isUp = fund.return1y >= 0;

  return (
    <div className="space-y-6">
      {/* 返回按钮 */}
      <Link href="/funds">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回列表
        </Button>
      </Link>

      {/* 基金基本信息 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{fund.name}</h1>
          <div className="mt-2 flex items-center gap-4">
            <span className="text-muted-foreground">{fund.code}</span>
            <Badge>{fund.type}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => alert("已添加到关注列表")}
          >
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
              <div className="mt-1 text-3xl font-bold">{fund.nav.toFixed(4)}</div>
              <div className={`mt-1 text-lg ${isUp ? "text-red-500" : "text-green-500"}`}>
                {isUp ? "+" : ""}
                {fund.return1y}% (近1年)
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">基金经理</span>
                <span className="font-medium">{fund.manager}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">基金公司</span>
                <span className="font-medium">{fund.company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">基金规模</span>
                <span className="font-medium">{fund.scale}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">成立日期</span>
                <span className="font-medium">{fund.established}</span>
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
              <span className={`font-medium ${fund.return1y >= 0 ? "text-red-500" : "text-green-500"}`}>
                {fund.return1y >= 0 ? "+" : ""}{fund.return1y}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>近3年收益</span>
              <span className={`font-medium ${fund.return3y >= 0 ? "text-red-500" : "text-green-500"}`}>
                {fund.return3y >= 0 ? "+" : ""}{fund.return3y}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
