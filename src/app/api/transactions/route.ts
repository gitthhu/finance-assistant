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
const transactionsFile = join(dataDir, "transactions.json");

// 读取本地数据
function readLocalData() {
  try {
    if (existsSync(transactionsFile)) {
      const content = readFileSync(transactionsFile, "utf-8");
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
    writeFileSync(transactionsFile, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("写入本地数据失败:", error);
  }
}

// 模拟数据
const mockTransactions = [
  {
    id: "1",
    portfolio_id: "1",
    symbol: "600519",
    symbol_type: "stock",
    transaction_type: "buy",
    price: 1680,
    quantity: 100,
    amount: 168000,
    transaction_date: "2024-01-15",
    note: "首次买入",
    created_at: new Date().toISOString(),
  },
];

// 获取交易记录
export async function GET(request: NextRequest) {
  try {
    // 如果配置了 Supabase，使用数据库
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("transaction_date", { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "获取交易记录失败" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data });
    } else {
      // 使用本地数据
      let transactions = readLocalData();
      
      if (transactions.length === 0) {
        transactions = mockTransactions;
        writeLocalData(transactions);
      }

      return NextResponse.json({ success: true, data: transactions });
    }
  } catch (error) {
    console.error("Error in GET /api/transactions:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

// 添加交易记录
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { symbol, symbol_type, transaction_type, price, quantity, transaction_date, note } = body;

    if (!symbol || !transaction_type || !price || !quantity) {
      return NextResponse.json(
        { error: "缺少必填字段" },
        { status: 400 }
      );
    }

    // 如果配置了 Supabase，使用数据库
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from("transactions")
        .insert([
          {
            symbol,
            symbol_type,
            transaction_type,
            price: parseFloat(price),
            quantity: parseInt(quantity),
            amount: parseFloat(price) * parseInt(quantity),
            transaction_date: transaction_date || new Date().toISOString().split("T")[0],
            note,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error: "添加交易记录失败" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data }, { status: 201 });
    } else {
      // 使用本地数据
      const transactions = readLocalData();
      
      const newTransaction = {
        id: Date.now().toString(),
        symbol,
        symbol_type: symbol_type || "stock",
        transaction_type,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        amount: parseFloat(price) * parseInt(quantity),
        transaction_date: transaction_date || new Date().toISOString().split("T")[0],
        note: note || "",
        created_at: new Date().toISOString(),
      };

      transactions.push(newTransaction);
      writeLocalData(transactions);

      return NextResponse.json(
        { success: true, data: newTransaction },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/transactions:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
