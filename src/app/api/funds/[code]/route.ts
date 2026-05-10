import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 检查是否配置了 Supabase
const isSupabaseConfigured = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
};

// 获取基金详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json(
        { error: "缺少参数：code" },
        { status: 400 }
      );
    }

    // 如果配置了 Supabase，使用数据库
    if (isSupabaseConfigured()) {
      // 获取基金基本信息
      const { data: fund, error } = await supabase
        .from("funds")
        .select("*")
        .eq("code", code)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "基金不存在" },
          { status: 404 }
        );
      }

      // 获取净值历史
      const { data: history, error: historyError } = await supabase
        .from("price_history")
        .select("*")
        .eq("symbol", code)
        .eq("symbol_type", "fund")
        .order("date", { ascending: true })
        .limit(90);

      if (historyError) {
        console.error("Supabase error:", historyError);
      }

      return NextResponse.json({
        success: true,
        data: {
          fund,
          history: history || [],
        },
      });
    } else {
      // 使用模拟数据
      const mockFund = {
        code,
        name: "模拟基金",
        fund_type: "混合型",
        company: "模拟基金公司",
      };

      // 生成模拟净值历史
      const history = [];
      for (let i = 90; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const nav = 1 + Math.random() * 2;
        
        history.push({
          date: date.toISOString().split("T")[0],
          close: nav,
          open: nav - 0.01,
          high: nav + 0.02,
          low: nav - 0.02,
          volume: 0,
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          fund: mockFund,
          history,
        },
      });
    }
  } catch (error) {
    console.error("Error in GET /api/funds/[code]:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
