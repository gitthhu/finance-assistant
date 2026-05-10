"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";

// 模拟数据
const mockAlerts = [
  {
    id: "1",
    symbol: "000001.SZ",
    name: "平安银行",
    alertType: "above",
    targetPrice: 15.0,
    currentPrice: 12.5,
    isActive: true,
    isTriggered: false,
  },
  {
    id: "2",
    symbol: "AAPL",
    name: "Apple Inc.",
    alertType: "below",
    targetPrice: 170.0,
    currentPrice: 178.5,
    isActive: true,
    isTriggered: false,
  },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    symbol: "",
    name: "",
    alertType: "above",
    targetPrice: "",
  });

  const handleSubmit = () => {
    if (formData.symbol && formData.name && formData.targetPrice) {
      if (editingId) {
        // 编辑提醒
        setAlerts(alerts.map(alert => 
          alert.id === editingId 
            ? { ...alert, ...formData, targetPrice: parseFloat(formData.targetPrice) }
            : alert
        ));
        setEditingId(null);
      } else {
        // 添加提醒
        const newAlert = {
          id: Date.now().toString(),
          symbol: formData.symbol,
          name: formData.name,
          alertType: formData.alertType,
          targetPrice: parseFloat(formData.targetPrice),
          currentPrice: 0,
          isActive: true,
          isTriggered: false,
        };
        setAlerts([newAlert, ...alerts]);
      }
      setShowForm(false);
      setFormData({ symbol: "", name: "", alertType: "above", targetPrice: "" });
    }
  };

  const handleEdit = (alert: any) => {
    setFormData({
      symbol: alert.symbol,
      name: alert.name,
      alertType: alert.alertType,
      targetPrice: alert.targetPrice.toString(),
    });
    setEditingId(alert.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个提醒吗？")) {
      setAlerts(alerts.filter(alert => alert.id !== id));
    }
  };

  const handleToggle = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">价格提醒</h1>
        <Button onClick={() => {
          setEditingId(null);
          setFormData({ symbol: "", name: "", alertType: "above", targetPrice: "" });
          setShowForm(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          添加提醒
        </Button>
      </div>

      {/* 添加/编辑表单 */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "编辑提醒" : "添加价格提醒"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">股票/基金代码</label>
                <Input
                  placeholder="如：000001.SZ"
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">名称</label>
                <Input
                  placeholder="如：平安银行"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">提醒类型</label>
                <select
                  value={formData.alertType}
                  onChange={(e) => setFormData({ ...formData, alertType: e.target.value })}
                  className="w-full rounded border px-3 py-2"
                >
                  <option value="above">价格高于</option>
                  <option value="below">价格低于</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">目标价格</label>
                <Input
                  type="number"
                  placeholder="如：15.0"
                  value={formData.targetPrice}
                  onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmit}>
                {editingId ? "保存" : "添加"}
              </Button>
              <Button variant="outline" onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}>
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 活跃提醒列表 */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">活跃提醒</h2>
        {alerts.filter(alert => alert.isActive && !alert.isTriggered).length === 0 ? (
          <p className="text-muted-foreground">暂无活跃提醒</p>
        ) : (
          <div className="space-y-4">
            {alerts
              .filter((alert) => alert.isActive && !alert.isTriggered)
              .map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{alert.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {alert.symbol}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="default">
                          {alert.alertType === "above" ? "价格高于" : "价格低于"}
                        </Badge>
                        <p className="mt-1 text-lg font-bold">
                          ¥{alert.targetPrice}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleEdit(alert)}
                      >
                        <Pencil className="mr-1 h-3 w-3" />
                        编辑
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDelete(alert.id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        删除
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        )}
      </div>

      {/* 已触发/已停用提醒 */}
      {alerts.filter(alert => !alert.isActive || alert.isTriggered).length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">已停用/已触发</h2>
          <div className="space-y-4">
            {alerts
              .filter(alert => !alert.isActive || alert.isTriggered)
              .map((alert) => (
                <Card key={alert.id} className="opacity-60">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{alert.name}</h3>
                        <Badge variant="secondary">
                          {alert.isTriggered ? "已触发" : "已停用"}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          目标价格
                        </p>
                        <p className="text-lg font-bold">
                          ¥{alert.targetPrice}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(alert.id)}
                      >
                        重新启用
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(alert.id)}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        删除
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
