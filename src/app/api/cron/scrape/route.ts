export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getChinaStockQuote, getChinaStockHistory } from "@/lib/scraper/china-stock";
import { getUSStockQuote, getUSStockHistory } from "@/lib/scraper/yahoo-finance";
import { getFundQuote, getFundHistory } from "@/lib/scraper/fund";
import { calculateMACD, calculateRSI, calculateKDJ } from "@/lib/technical-indicators";

/**
 * Vercel Cron Job - 定时抓取数据
 * 
 * 此API由Vercel Cron自动调用
 * 频率：交易日�?:00-15:00每小时执行一�?
 * 
 * 功能�?
 * 1. 获取关注列表中的所有股�?基金
 * 2. 抓取最新行情数�?
 * 3. 计算技术指�?
 * 4. 保存到数据库
 * 5. 检查价格提�?
 */
export async function GET(request: NextRequest) {
  try {
    console.log("开始执行定时数据抓取任�?..");

    // 1. 获取关注列表
    const { data: watchlist, error: watchlistError } = await supabase
      .from("watchlist")
      .select("*");

    if (watchlistError) {
      console.error("获取关注列表失败:", watchlistError);
      return NextResponse.json(
        { error: "获取关注列表失败" },
        { status: 500 }
      );
    }

    if (!watchlist || watchlist.length === 0) {
      console.log("关注列表为空，无需抓取");
      return NextResponse.json({
        success: true,
        message: "关注列表为空，无需抓取",
        stats: { stocks: 0, funds: 0 },
      });
    }

    let stockCount = 0;
    let fundCount = 0;
    const errors: string[] = [];

    // 2. 遍历关注列表，抓取数�?
    for (const item of watchlist) {
      try {
        if (item.symbol_type === "stock") {
          await scrapeStockData(item.symbol);
          stockCount++;
        } else if (item.symbol_type === "fund") {
          await scrapeFundData(item.symbol);
          fundCount++;
        }

        // 3. 检查价格提�?
        await checkPriceAlerts(item.symbol, item.symbol_type);
      } catch (error) {
        const errMsg = `抓取 ${item.symbol} 失败: ${error}`;
        console.error(errMsg);
        errors.push(errMsg);
      }
    }

    console.log(
      `抓取任务完成: ${stockCount} 只股�? ${fundCount} 只基金`
    );

    return NextResponse.json({
      success: true,
      message: "抓取任务完成",
      stats: {
        stocks: stockCount,
        funds: fundCount,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("定时任务执行失败:", error);
    return NextResponse.json(
      { error: "定时任务执行失败" },
      { status: 500 }
    );
  }
}

/**
 * 抓取股票数据
 */
async function scrapeStockData(symbol: string) {
  // 判断市场
  const market = detectMarket(symbol);
  
  let quote = null;
  let history: any[] = [];

  if (market === "US") {
    quote = await getUSStockQuote(symbol);
    history = await getUSStockHistory(symbol, "1y");
  } else if (market === "A" || market === "HK") {
    quote = await getChinaStockQuote(symbol, market as "A" | "HK");
    history = await getChinaStockHistory(symbol, market as "A" | "HK");
  } else {
    // 默认�?A �?
    quote = await getChinaStockQuote(symbol, "A");
    history = await getChinaStockHistory(symbol, "A");
  }

  if (!quote) {
    throw new Error(`获取行情失败`);
  }

  // 保存股票基本信息
  const { error: stockError } = await supabase
    .from("stocks")
    .upsert({
      symbol: quote.symbol,
      name: quote.name,
      market: market,
    });

  if (stockError) {
    console.error("保存股票信息失败:", stockError);
  }

  // 保存历史价格
  if (history.length > 0) {
    const priceData = history.map((h) => ({
      symbol: quote!.symbol,
      date: h.date,
      open: h.open,
      high: h.high,
      low: h.low,
      close: h.close,
      volume: h.volume,
      amount: h.amount || 0,
    }));

    const { error: priceError } = await supabase
      .from("price_history")
      .upsert(priceData, {
        onConflict: "symbol,date",
      });

    if (priceError) {
      console.error("保存价格历史失败:", priceError);
    }

    // 计算并保存技术指�?
    const ohlcvHistory = history.map((h) => ({
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

    // 保存技术指标到数据库（简化版，只保存最新值）
    if (macd.length > 0) {
      const latestMACD = macd[macd.length - 1];
      const latestRSI = rsi[rsi.length - 1];
      const latestKDJ = kdj[kdj.length - 1];

      const { error: indicatorError } = await supabase
        .from("technical_indicators")
        .upsert(
          {
            symbol: quote.symbol,
            date: latestMACD.date,
            macd: latestMACD.macd,
            macd_signal: latestMACD.signal,
            macd_histogram: latestMACD.histogram,
            rsi: latestRSI.rsi,
            kdj_k: latestKDJ.k,
            kdj_d: latestKDJ.d,
            kdj_j: latestKDJ.j,
          },
          {
            onConflict: "symbol,date",
          }
        );

      if (indicatorError) {
        console.error("保存技术指标失�?", indicatorError);
      }
    }
  }
}

/**
 * 抓取基金数据
 */
async function scrapeFundData(code: string) {
  const quote = await getFundQuote(code);
  const history = await getFundHistory(code);

  if (!quote) {
    throw new Error(`获取基金净值失败`);
  }

  // 保存基金基本信息
  const { error: fundError } = await supabase
    .from("funds")
    .upsert({
      code: quote.code,
      name: quote.name,
    });

  if (fundError) {
    console.error("保存基金信息失败:", fundError);
  }

  // 保存历史净�?
  if (history.length > 0) {
    const navData = history.map((h) => ({
      code: quote!.code,
      date: h.date,
      nav: h.nav,
      cumulative_nav: h.cumulativeNav,
      change: h.change,
      change_percent: h.changePercent,
    }));

    const { error: navError } = await supabase
      .from("fund_nav_history")
      .upsert(navData, {
        onConflict: "code,date",
      });

    if (navError) {
      console.error("保存基金历史净值失�?", navError);
    }
  }
}

/**
 * 检查价格提�?
 */
async function checkPriceAlerts(symbol: string, symbolType: string) {
  // 获取活跃的价格提�?
  const { data: alerts, error } = await supabase
    .from("alerts")
    .select("*")
    .eq("symbol", symbol)
    .eq("is_active", true);

  if (error || !alerts || alerts.length === 0) {
    return;
  }

  // 获取最新价�?
  let currentPrice = 0;
  
  if (symbolType === "stock") {
    const market = detectMarket(symbol);
    const quote = await getQuoteForAlert(symbol, market);
    if (quote) currentPrice = quote.price;
  } else {
    const quote = await getFundQuote(symbol);
    if (quote) currentPrice = quote.nav;
  }

  // 检查每个提�?
  for (const alert of alerts) {
    let isTriggered = false;

    if (alert.alert_type === "above" && currentPrice >= alert.target_price) {
      isTriggered = true;
    } else if (alert.alert_type === "below" && currentPrice <= alert.target_price) {
      isTriggered = true;
    }

    if (isTriggered) {
      // 标记提醒为已触发
      await supabase
        .from("alerts")
        .update({
          is_active: false,
          triggered_at: new Date().toISOString(),
        })
        .eq("id", alert.id);

      // 发送通知（可以在这里集成邮件、微信等通知方式�?
      console.log(
        `价格提醒触发: ${symbol} ${alert.alert_type === "above" ? "�? : "�?} ${alert.target_price}, 当前�? ${currentPrice}`
      );
    }
  }
}

/**
 * 获取股票行情（用于提醒检查）
 */
async function getQuoteForAlert(symbol: string, market: "A" | "HK" | "US" | string) {
  if (market === "US") {
    return await getUSStockQuote(symbol);
  } else if (market === "A" || market === "HK") {
    return await getChinaStockQuote(symbol, market as "A" | "HK");
  } else {
    // 默认�?A �?
    return await getChinaStockQuote(symbol, "A");
  }
}

/**
 * 检测股票市场类�?
 */
function detectMarket(symbol: string): string {
  if (symbol.startsWith("6") || symbol.startsWith("5")) {
    return "A";
  } else if (symbol.startsWith("0") || symbol.startsWith("3")) {
    return "A";
  } else if (symbol.length === 5 && /^\d+$/.test(symbol)) {
    return "HK";
  } else {
    return "US";
  }
}
