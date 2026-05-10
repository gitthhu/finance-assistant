export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getFundQuote } from "@/lib/scraper/fund";

/**
 * 获取基金列表（包含实时净值）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeNav = searchParams.get("includeNav") === "true";
    
    // 预设的基金列表（可以从数据库读取，这里先用预设列表）
    const fundList = [
      { code: "000001", name: "华夏成长混合", type: "混合型" },
      { code: "110022", name: "易方达消费行业", type: "股票型" },
      { code: "161725", name: "招商中证白酒", type: "指数型" },
      { code: "510300", name: "华泰柏瑞沪深300ETF", type: "ETF" },
      { code: "000961", name: "天弘沪深300指数", type: "指数型" },
    ];

    if (!includeNav) {
      // 不获取实时净值，只返回基本信息
      return NextResponse.json({
        success: true,
        data: fundList.map(f => ({
          code: f.code,
          name: f.name,
          type: f.type,
          nav: 0,
          change: 0,
          changePercent: 0,
          return1y: 0,
          return3y: 0,
        })),
      });
    }

    // 获取实时净值
    const fundsWithNav = await Promise.all(
      fundList.map(async (fund) => {
        const quote = await getFundQuote(fund.code);

        if (quote) {
          return {
            code: fund.code,
            name: fund.name,
            type: fund.type,
            nav: quote.nav,
            change: quote.navChange,
            changePercent: quote.navChangePercent,
            return1y: quote.yearGrowth || 0,
            return3y: 0, // 需要额外计算
          };
        } else {
          // 如果获取失败，返回基本信息
          return {
            code: fund.code,
            name: fund.name,
            type: fund.type,
            nav: 0,
            change: 0,
            changePercent: 0,
            return1y: 0,
            return3y: 0,
          };
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: fundsWithNav,
    });
  } catch (error) {
    console.error("Error in GET /api/funds:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
