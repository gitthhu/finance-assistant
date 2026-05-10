import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

// 检查是否配置了 Supabase
const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

// 本地数据文件路径
const dataDir = join(process.cwd(), ".local-data");
const alertsFile = join(dataDir, "alerts.json");

// 读取本地数据
function readLocalData() {
  try {
    if (existsSync(alertsFile)) {
      const content = readFileSync(alertsFile, "utf-8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error("读取本地数据失败:", error);
  }
  return [];
}

// 写入本地数据
function writeLocalData(data: any[]) {
  try {
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    writeFileSync(alertsFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("写入本地数据失败:", error);
  }
}

// 模拟数据
const mockAlerts = [
  {
    id: "1",
    symbol: "600519",
    symbol_type: "stock",
    alert_type: "price_above",
    target_price: 2000,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

// 获取提醒列表
export async function GET(request: NextRequest) {
  try {
    // 如果配置了 Supabase，使用数据库
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "获取提醒列表失败" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data });
    } else {
      // 使用本地数据
      let alerts = readLocalData();
      
      if (alerts.length === 0) {
        alerts = mockAlerts;
        writeLocalData(alerts);
      }

      return NextResponse.json({ success: true, data: alerts });
    }
  } catch (error) {
    console.error("Error in GET /api/alerts:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 添加提醒
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, symbol_type, alert_type, target_price } = body;

    if (!symbol || !alert_type || !target_price) {
      return NextResponse.json(
        { error: "缺少必填字段" },
        { status: 400 }
      );
    }

    // 如果配置了 Supabase，使用数据库
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("alerts")
        .insert([
          {
            symbol,
            symbol_type: symbol_type || "stock",
            alert_type,
            target_price: parseFloat(target_price),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "添加提醒失败" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data }, { status: 201 });
    } else {
      // 使用本地数据
      const alerts = readLocalData();
      
      const newAlert = {
        id: Date.now().toString(),
        symbol,
        symbol_type: symbol_type || "stock",
        alert_type,
        target_price: parseFloat(target_price),
        is_active: true,
        created_at: new Date().toISOString(),
      };

      alerts.push(newAlert);
      writeLocalData(alerts);

      return NextResponse.json(
        { success: true, data: newAlert },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/alerts:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 删除提醒
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "缺少参数：id" },
        { status: 400 }
      );
    }

    // 如果配置了 Supabase，使用数据库
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("alerts")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "删除提醒失败" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    } else {
      // 使用本地数据
      const alerts = readLocalData();
      const filtered = alerts.filter((item: any) => item.id !== id);
      
      if (filtered.length === alerts.length) {
        return NextResponse.json(
          { error: "提醒不存在" },
          { status: 404 }
        );
      }

      writeLocalData(filtered);

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error in DELETE /api/alerts:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
