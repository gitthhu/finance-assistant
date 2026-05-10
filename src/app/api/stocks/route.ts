export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { readFileSync, writeFileSync, existsSync } from "fs";
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
const stocksFile = join(dataDir, "stocks.json");

// 读取本地数据
function readLocalData() {
  try {
    if (existsSync(stocksFile)) {
      const content = readFileSync(stocksFile, "utf-8");
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
    const { mkdirSync } = require("fs");
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    writeFileSync(stocksFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("写入本地数据失败:", error);
  }
}

// 模拟数据
const mockStocks = [
  {
    id: "1",
    symbol: "600519",
    name: "贵州茅台",
    market: "A",
    industry: "白酒",
    list_date: "2001-08-27",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    symbol: "000001",
    name: "平安银行",
    market: "A",
    industry: "银行",
    list_date: "1991-04-03",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    symbol: "AAPL",
    name: "Apple Inc.",
    market: "US",
    industry: "科技",
    list_date: "1980-12-12",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    symbol: "TSLA",
    name: "Tesla Inc.",
    market: "US",
    industry: "汽车",
    list_date: "2010-06-29",
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    symbol: "0700",
    name: "腾讯控股",
    market: "HK",
    industry: "互联网",
    list_date: "2004-06-16",
    created_at: new Date().toISOString(),
  },
];

// 获取股票列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const market = searchParams.get("market");
    const search = searchParams.get("search");

    // 如果配置了 Supabase，使用数据库
    if (isSupabaseConfigured()) {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      let query = supabase.from("stocks").select("*", { count: "exact" });

      if (market) {
        query = query.eq("market", market);
      }
      if (search) {
        query = query.or(`symbol.ilike.%${search}%,name.ilike.%${search}%`);
      }

      query = query.order("symbol", { ascending: true });
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "获取股票列表失败" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      });
    } else {
      // 使用本地数据或模拟数据
      let stocks = readLocalData();
      
      if (stocks.length === 0) {
        stocks = mockStocks;
        writeLocalData(stocks);
      }

      // 筛选
      if (market) {
        stocks = stocks.filter((s: any) => s.market === market);
      }
      if (search) {
        stocks = stocks.filter(
          (s: any) =>
            s.symbol.includes(search) || s.name.includes(search)
        );
      }

      // 分页
      const from = (page - 1) * limit;
      const paginatedStocks = stocks.slice(from, from + limit);

      return NextResponse.json({
        success: true,
        data: paginatedStocks,
        pagination: {
          page,
          limit,
          total: stocks.length,
          totalPages: Math.ceil(stocks.length / limit),
        },
      });
    }
  } catch (error) {
    console.error("Error in GET /api/stocks:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 添加新股票
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, name, market, industry } = body;

    if (!symbol) {
      return NextResponse.json(
        { error: "缺少必填字段：symbol" },
        { status: 400 }
      );
    }

    // 如果配置了 Supabase，使用数据库
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("stocks")
        .insert([{ symbol, name, market, industry }])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "创建股票失败" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data }, { status: 201 });
    } else {
      // 使用本地数据
      const stocks = readLocalData();
      
      // 检查是否已存在
      if (stocks.find((s: any) => s.symbol === symbol)) {
        return NextResponse.json(
          { error: "股票代码已存在" },
          { status: 409 }
        );
      }

      const newStock = {
        id: Date.now().toString(),
        symbol,
        name: name || symbol,
        market: market || "A",
        industry: industry || "",
        created_at: new Date().toISOString(),
      };

      stocks.push(newStock);
      writeLocalData(stocks);

      return NextResponse.json(
        { success: true, data: newStock },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/stocks:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 删除股票
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
        .from("stocks")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "删除股票失败" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    } else {
      // 使用本地数据
      const stocks = readLocalData();
      const filtered = stocks.filter((s: any) => s.id !== id);
      
      if (filtered.length === stocks.length) {
        return NextResponse.json(
          { error: "股票不存在" },
          { status: 404 }
        );
      }

      writeLocalData(filtered);

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error in DELETE /api/stocks:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
