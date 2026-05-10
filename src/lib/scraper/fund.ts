// 基金数据抓取 - 使用天天基金网免费API
// 支持公募基金数据获取

export interface FundQuote {
  code: string;
  name: string;
  nav: number; // 单位净值
  navChange: number; // 净值变动
  navChangePercent: number; // 净值变动百分比
  navDate: string; // 净值日期
  cumulativeNav: number; // 累计净值
  dayGrowth: number; // 日增长率
  weekGrowth: number; // 周增长率
  monthGrowth: number; // 月增长率
  yearGrowth: number; // 年增长率
}

export interface FundHistory {
  date: string;
  nav: number; // 单位净值
  cumulativeNav: number; // 累计净值
  change: number;
  changePercent: number;
}

export interface FundHolding {
  stockCode: string;
  stockName: string;
  proportion: number; // 持仓比例
}

/**
 * 获取基金实时净值（天天基金网API）
 */
export async function getFundQuote(code: string): Promise<FundQuote | null> {
  try {
    // 天天基金网API
    const url = `https://fundgz.1234567.com.cn/js/${code}.js`;
    const response = await fetch(url);
    const text = await response.text();
    
    // 解析JSONP返回的数据
    // 格式: jsonpgz({"fundcode":"000001",...});
    const match = text.match(/jsonpgz\((.*)\)/);
    if (!match) return null;
    
    const data = JSON.parse(match[1]);
    
    return {
      code: data.fundcode,
      name: data.name,
      nav: parseFloat(data.dwjz) || 0,
      navChange: parseFloat(data.dwjz) - parseFloat(data.nav) || 0,
      navChangePercent: parseFloat(data.gszzl) || 0,
      navDate: data.gztime,
      cumulativeNav: parseFloat(data.ljjz) || 0,
      dayGrowth: parseFloat(data.gszzl) || 0,
      weekGrowth: 0, // 需要额外API
      monthGrowth: 0,
      yearGrowth: 0,
    };
  } catch (error) {
    console.error(`获取基金 ${code} 净值失败:`, error);
    return null;
  }
}

/**
 * 获取基金历史净值（天天基金网API）
 */
export async function getFundHistory(
  code: string,
  startDate?: string,
  endDate?: string
): Promise<FundHistory[]> {
  try {
    const start = startDate || '2024-01-01';
    const end = endDate || new Date().toISOString().split('T')[0];
    
    // 天天基金网历史净值API
    const url = `https://api.fund.eastmoney.com/f10/lsjz?fundCode=${code}&pageIndex=1&pageSize=1000&startDate=${start}&endDate=${end}`;
    
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://fund.eastmoney.com/',
      },
    });
    
    const data = await response.json();
    const list = data?.Data?.LSJZList || [];
    
    return list.map((item: any) => ({
      date: item.FSRQ,
      nav: parseFloat(item.DWJZ) || 0,
      cumulativeNav: parseFloat(item.LJJZ) || 0,
      change: parseFloat(item.JZZZL) || 0,
      changePercent: parseFloat(item.JZZZL) || 0,
    })).reverse(); // 按日期升序排列
  } catch (error) {
    console.error(`获取基金 ${code} 历史净值失败:`, error);
    return [];
  }
}

/**
 * 获取基金持仓明细（天天基金网API）
 */
export async function getFundHoldings(code: string): Promise<FundHolding[]> {
  try {
    const url = `https://fundf10.eastmoney.com/FundArchivesDat.nsp/allrank?fundcode=${code}&pageIndex=1&pageSize=100`;
    
    const response = await fetch(url, {
      headers: {
        'Referer': 'https://fundf10.eastmoney.com/',
      },
    });
    
    const text = await response.text();
    
    // 解析JSONP
    const match = text.match(/allrank\((.*)\)/);
    if (!match) return [];
    
    const data = JSON.parse(match[1]);
    const holdings = data?.data || [];
    
    return holdings.map((item: any) => ({
      stockCode: item.stockcode,
      stockName: item.stockname,
      proportion: parseFloat(item.proportion) || 0,
    }));
  } catch (error) {
    console.error(`获取基金 ${code} 持仓明细失败:`, error);
    return [];
  }
}

/**
 * 搜索基金（天天基金网API）
 */
export async function searchFunds(query: string): Promise<Array<{code: string, name: string}>> {
  try {
    const url = `https://fundsuggest.eastmoney.com/FundSearch/api/FundSearchAPI.ashx?callback=&m=1&key=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const text = await response.text();
    
    // 解析JSONP
    const match = text.match(/\[(.*)\]/);
    if (!match) return [];
    
    const data = JSON.parse(match[0]);
    
    return data.map((item: any) => ({
      code: item.CODE,
      name: item.NAME,
    }));
  } catch (error) {
    console.error('搜索基金失败:', error);
    return [];
  }
}
