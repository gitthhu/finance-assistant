export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getChinaStockQuote, formatSymbol } from "@/lib/scraper/china-stock";
import { getUSStockQuote } from "@/lib/scraper/yahoo-finance";

/**
 * 获取股票列表（包含实时行情）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeQuote = searchParams.get("includeQuote") === "true";
    
    // 预设的股票列表（可以从数据库读取，这里先用预设列表）
    const stockList = [
      { symbol: "600519", name: "贵州茅台", market: "A" },
      { symbol: "000001", name: "平安银行", market: "A" },
      { symbol: "600036", name: "招商银行", market: "A" },
      { symbol: "000858", name: "五粮液", market: "A" },
      { symbol: "601318", name: "中国平安", market: "A" },
      { symbol: "AAPL", name: "Apple Inc.", market: "US" },
      { symbol: "TSLA", name: "Tesla Inc.", market: "US" },
      { symbol: "MSFT", name: "Microsoft Corp.", market: "US" },
      { symbol: "GOOGL", name: "Alphabet Inc.", market: "US" },
      { symbol: "AMZN", name: "Amazon.com Inc.", market: "US" },
    ];

    if (!includeQuote) {
      // 不获取实时行情，只返回基本信息
      return NextResponse.json({
        success: true,
        data: stockList.map(s => ({
          symbol: s.symbol,
          name: s.name,
          market: s.market,
          price: 0,
          change: 0,
          changePercent: 0,
        })),
      });
    }

    // 获取实时行情
    const stocksWithQuote = await Promise.all(
      stockList.map(async (stock) => {
        let quote = null;
        
        if (stock.market === "US") {
          quote = await getUSStockQuote(stock.symbol);
        } else {
          quote = await getChinaStockQuote(stock.symbol, stock.market as 'A' | 'HK');
        }

        if (quote) {
          return {
            symbol: stock.symbol,
            name: stock.name,
            market: stock.market,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            open: quote.open,
            high: quote.high,
            low: quote.low,
            volume: quote.volume,
          };
        } else {
          // 如果获取失败，返回基本信息
          return {
            symbol: stock.symbol,
            name: stock.name,
            market: stock.market,
            price: 0,
            change: 0,
            changePercent: 0,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: stocksWithQuote,
    });
  } catch (error) {
    console.error("Error in GET /api/stocks:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
