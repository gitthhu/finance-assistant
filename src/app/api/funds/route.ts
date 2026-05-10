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
const fundsFile = join(dataDir, "funds.json");

// 读取本地数据
function readLocalData() {
  try {
    if (existsSync(fundsFile)) {
      const content = readFileSync(fundsFile, "utf-8");
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
    writeFileSync(fundsFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("写入本地数据失败:", error);
  }
}

// 模拟数据
const mockFunds = [
  {
    id: "1",
    code: "110011",
    name: "易方达中小盘混合",
    fund_type: "股票型",
    company: "易方达基金",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    code: "000001",
    name: "华夏成长混合",
    fund_type: "混合型",
    company: "华夏基金",
    created_at: new Date().toISOString(),
  },
];

// 获取基金列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");

    // 如果配置了 Supabase，使用数据库
    if (isSupabaseConfigured()) {
      let query = supabase.from("funds").select("*");

      if (search) {
        query = query.or(`code.ilike.%${search}%,name.ilike.%${search}%`);
      }

      query = query.order("code", { ascending: true });

      const { data, error } = await query;

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "获取基金列表失败" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data });
    } else {
      // 使用本地数据
      let funds = readLocalData();
      
      if (funds.length === 0) {
        funds = mockFunds;
        writeLocalData(funds);
      }

      // 搜索筛选
      if (search) {
        funds = funds.filter(
          (f: any) =>
            f.code.includes(search) || f.name.includes(search)
        );
      }

      return NextResponse.json({ success: true, data: funds });
    }
  } catch (error) {
    console.error("Error in GET /api/funds:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 添加基金
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, name, fund_type, company } = body;

    if (!code) {
      return NextResponse.json(
        { error: "缺少必填字段：code" },
        { status: 400 }
      );
    }

    // 如果配置了 Supabase，使用数据库
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("funds")
        .insert([
          {
            code,
            name: name || code,
            fund_type,
            company,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "添加基金失败" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data }, { status: 201 });
    } else {
      // 使用本地数据
      const funds = readLocalData();
      
      // 检查是否已存在
      if (funds.find((f: any) => f.code === code)) {
        return NextResponse.json(
          { error: "基金代码已存在" },
          { status: 409 }
        );
      }

      const newFund = {
        id: Date.now().toString(),
        code,
        name: name || code,
        fund_type: fund_type || "混合型",
        company: company || "",
        created_at: new Date().toISOString(),
      };

      funds.push(newFund);
      writeLocalData(funds);

      return NextResponse.json(
        { success: true, data: newFund },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/funds:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 删除基金
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
        .from("funds")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "删除基金失败" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    } else {
      // 使用本地数据
      const funds = readLocalData();
      const filtered = funds.filter((f: any) => f.id !== id);
      
      if (filtered.length === funds.length) {
        return NextResponse.json(
          { error: "基金不存在" },
          { status: 404 }
        );
      }

      writeLocalData(filtered);

      return NextResponse.json({ success: true });
    }
  } catch (error) {
    console.error("Error in DELETE /api/funds:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
