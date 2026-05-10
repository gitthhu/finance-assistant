export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// 获取单个股票详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;

    const { data: stock, error } = await supabase
      .from("stocks")
      .select("*")
      .eq("symbol", symbol)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "股票不存在" },
          { status: 404 }
        );
      }
      console.error("Error fetching stock:", error);
      return NextResponse.json(
        { error: "获取股票详情失败" },
        { status: 500 }
      );
    }

    // 获取历史价格（最近30天）
    const { data: priceHistory } = await supabase
      .from("price_history")
      .select("*")
      .eq("symbol", symbol)
      .eq("symbol_type", "stock")
      .order("date", { ascending: false })
      .limit(30);

    // 获取技术指标
    const { data: indicators } = await supabase
      .from("technical_indicators")
      .select("*")
      .eq("symbol", symbol)
      .eq("symbol_type", "stock")
      .order("date", { ascending: false })
      .limit(30);

    // 获取最新财报
    const { data: financials } = await supabase
      .from("financial_reports")
      .select("*")
      .eq("symbol", symbol)
      .order("report_date", { ascending: false })
      .limit(4);

    return NextResponse.json({
      data: {
        ...stock,
        price_history: priceHistory || [],
        technical_indicators: indicators || [],
        financial_reports: financials || [],
      },
    });
  } catch (error) {
    console.error("Error in GET /api/stocks/[symbol]:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 更新股票信息
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from("stocks")
      .update(body)
      .eq("symbol", symbol)
      .select()
      .single();

    if (error) {
      console.error("Error updating stock:", error);
      return NextResponse.json(
        { error: "更新股票失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error in PUT /api/stocks/[symbol]:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 删除股票
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    const { symbol } = await params;

    const { error } = await supabase
      .from("stocks")
      .delete()
      .eq("symbol", symbol);

    if (error) {
      console.error("Error deleting stock:", error);
      return NextResponse.json(
        { error: "删除股票失败" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "删除成功" });
  } catch (error) {
    console.error("Error in DELETE /api/stocks/[symbol]:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
