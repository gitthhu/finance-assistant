export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getChinaStockQuote, getChinaStockHistory } from "@/lib/scraper/china-stock";
import { getUSStockQuote, getUSStockHistory } from "@/lib/scraper/yahoo-finance";
import { getFundQuote, getFundHistory } from "@/lib/scraper/fund";
import { calculateMACD, calculateRSI, calculateKDJ, generateSignal } from "@/lib/technical-indicators";

/**
 * POST /api/scraper
 * 触发数据抓取，更新股�?基金数据
 * 
 * Body:
 * - type: 'stock' | 'fund'
 * - symbol: 股票代码或基金代�?
 * - market: 'A' | 'HK' | 'US' (股票专用)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, symbol, market } = body;
    
    if (!type || !symbol) {
      return NextResponse.json(
        { error: "缺少必要参数: type, symbol" },
        { status: 400 }
      );
    }
    
    if (type === 'stock') {
      return await scrapeStock(symbol, market || 'A');
    } else if (type === 'fund') {
      return await scrapeFund(symbol);
    } else {
      return NextResponse.json(
        { error: "不支持的类型，请使用 'stock' �?'fund'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("数据抓取失败:", error);
    return NextResponse.json(
      { error: "数据抓取失败" },
      { status: 500 }
    );
  }
}

/**
 * 抓取股票数据
 */
async function scrapeStock(symbol: string, market: string) {
  let quote = null;
  let history: any[] = [];
  
  if (market === 'US') {
    quote = await getUSStockQuote(symbol);
    history = await getUSStockHistory(symbol, '1y');
  } else {
    quote = await getChinaStockQuote(symbol, market as 'A' | 'HK');
    history = await getChinaStockHistory(symbol, market as 'A' | 'HK');
  }
  
  if (!quote) {
    return NextResponse.json(
      { error: "获取行情数据失败" },
      { status: 500 }
    );
  }
  
  // 计算技术指�?
  const ohlcvHistory = history.map(h => ({
    date: h.date,
    open: h.open,
    high: h.high,
    low: h.low,
    close: h.close,
    volume: h.volume,
  }));
  
  const macd = calculateMACD(ohlcvHistory);
  const rsi = calculateRSI(ohlcvHistory);
  const kdj = calculateKDJ(ohlcvHistory);
  const signal = generateSignal(macd, rsi, kdj);
  
  return NextResponse.json({
    success: true,
    data: {
      quote,
      history: history.slice(-100), // 只返回最�?00�?
      technicalIndicators: {
        macd: macd.slice(-50), // 只返回最�?0�?
        rsi: rsi.slice(-50),
        kdj: kdj.slice(-50),
        signal,
      },
    },
  });
}

/**
 * 抓取基金数据
 */
async function scrapeFund(code: string) {
  const quote = await getFundQuote(code);
  const history = await getFundHistory(code);
  
  if (!quote) {
    return NextResponse.json(
      { error: "获取基金数据失败" },
      { status: 500 }
    );
  }
  
  return NextResponse.json({
    success: true,
    data: {
      quote,
      history: history.slice(-100), // 只返回最�?00�?
    },
  });
}

/**
 * GET /api/scraper
 * 批量抓取数据（用于定时任务）
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  if (action === 'batch') {
    // 批量更新关注列表中的数据
    return await batchScrape();
  }
  
  return NextResponse.json(
    { error: "不支持的操作" },
    { status: 400 }
  );
}

/**
 * 批量抓取关注列表中的数据
 */
async function batchScrape() {
  // 这里应该从数据库获取关注列表
  // 然后批量抓取数据并更新数据库
  // 由于数据库尚未配置，这里只返回成�?
  
  return NextResponse.json({
    success: true,
    message: "批量抓取任务已启�?,
    note: "请先配置 Supabase 数据库连�?,
  });
}
