export const dynamic = 'force-dynamic';

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
const watchlistFile = join(dataDir, "watchlist.json");

// 读取本地数据
function readLocalData() {
  try {
    if (existsSync(watchlistFile)) {
      const content = readFileSync(watchlistFile, "utf-8");
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
    writeFileSync(watchlistFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("写入本地数据失败:", error);
  }
}

// 模拟数据
const mockWatchlist = [
  {
    id: "1",
    symbol: "600519",
    symbol_type: "stock",
    added_at: new Date().toISOString(),
  },
  {
    id: "2",
    symbol: "AAPL",
    symbol_type: "stock",
    added_at: new Date().toISOString(),
  },
];

// 获取关注列表
export async function GET(request: NextRequest) {
  try {
    // 如果配置了 Supabase，使用数据库
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .order("added_at", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "获取关注列表失败" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data });
    } else {
      // 使用本地数据
      let watchlist = readLocalData();
      
      if (watchlist.length === 0) {
        watchlist = mockWatchlist;
        writeLocalData(watchlist);
      }

      return NextResponse.json({ success: true, data: watchlist });
    }
  } catch (error) {
    console.error("Error in GET /api/watchlist:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 添加到关注列表
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, symbol_type } = body;

    if (!symbol) {
      return NextResponse.json(
        { error: "缺少必填字段：symbol" },
        { status: 400 }
      );
    }

    // 如果配置了 Supabase，使用数据库
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("watchlist")
        .insert([
          {
            symbol,
            symbol_type: symbol_type || "stock",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "添加到关注列表失败" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data }, { status: 201 });
    } else {
      // 使用本地数据
      const watchlist = readLocalData();
      
      // 检查是否已存在
      if (watchlist.find((item: any) => item.symbol === symbol)) {
        return NextResponse.json(
          { error: "已在关注列表中" },
          { status: 409 }
        );
      }

      const newItem = {
        id: Date.now().toString(),
        symbol,
        symbol_type: symbol_type || "stock",
        added_at: new Date().toISOString(),
      };

      watchlist.push(newItem);
      writeLocalData(watchlist);

      return NextResponse.json(
        { success: true, data: newItem },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/watchlist:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 从关注列表删除
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json(
        { error: "缺少参数：symbol" },
        { status: 400 }
      );
    }

    // 如果配置了 Supabase，使用数据库
    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("symbol", symbol);

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "删除失败" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    } else {
      // 使用本地数据
      const watchlist = readLocalData();
      const filtered = watchlist.filter((item: any) => item.symbol !== symbol);
      
      if (filtered.length === watchlist.length) {
        return NextResponse.json(
          { error: "关注项不存在" },
          { status: 404 }
        );
      }

      writeLocalData(filtered);

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error in DELETE /api/watchlist:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
