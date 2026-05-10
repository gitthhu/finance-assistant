"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Bell, Palette, Database, Shield } from "lucide-react";

export default function SettingsPage() {
  // 主题设置
  const [darkMode, setDarkMode] = useState(false);
  
  // 通知设置
  const [priceAlert, setPriceAlert] = useState(true);
  const [dailyReport, setDailyReport] = useState(false);
  const [newsAlert, setNewsAlert] = useState(true);
  
  // 数据源设置
  const [apiEndpoint, setApiEndpoint] = useState("https://api.example.com");
  const [refreshInterval, setRefreshInterval] = useState("30");

  const handleSave = () => {
    alert("设置已保存！");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-3xl font-bold">设置</h1>
      </div>

      <Tabs defaultValue="appearance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            外观
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            通知
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="mr-2 h-4 w-4" />
            数据源
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            安全
          </TabsTrigger>
        </TabsList>

        {/* 外观设置 */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>主题设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="dark-mode">深色模式</Label>
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                开启后，界面将切换为深色主题
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 通知设置 */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>通知设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="price-alert">价格提醒</Label>
                <Switch
                  id="price-alert"
                  checked={priceAlert}
                  onCheckedChange={setPriceAlert}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                当持仓股票价格达到设定阈值时发送通知
              </p>

              <div className="flex items-center justify-between">
                <Label htmlFor="daily-report">每日报告</Label>
                <Switch
                  id="daily-report"
                  checked={dailyReport}
                  onCheckedChange={setDailyReport}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                每日推送持仓收益报告
              </p>

              <div className="flex items-center justify-between">
                <Label htmlFor="news-alert">新闻提醒</Label>
                <Switch
                  id="news-alert"
                  checked={newsAlert}
                  onCheckedChange={setNewsAlert}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                关注股票出现重大新闻时发送通知
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 数据源设置 */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>数据源配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-endpoint">API 地址</Label>
                <Input
                  id="api-endpoint"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="https://api.example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="refresh-interval">刷新间隔（秒）</Label>
                <Input
                  id="refresh-interval"
                  type="number"
                  value={refreshInterval}
                  onChange={(e) => setRefreshInterval(e.target.value)}
                  placeholder="30"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                设置实时行情数据的刷新频率
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 安全设置 */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>安全设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">当前密码</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="请输入当前密码"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">新密码</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="请输入新密码"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">确认新密码</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="请再次输入新密码"
                />
              </div>
              <Button className="w-full">修改密码</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <Button onClick={handleSave}>保存设置</Button>
      </div>
    </div>
  );
}
