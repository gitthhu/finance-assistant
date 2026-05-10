export interface FundQuote {
  code: string;
  name: string;
  type: string;
  nav: number; // 最新净值
  change: number; // 涨跌额
  changePercent: number; // 涨跌幅
  return1y: number; // 近1年收益
  return3y: number; // 近3年收益
  manager: string; // 基金经理
  company: string; // 基金公司
  scale: string; // 基金规模
  established: string; // 成立日期
}

export interface FundHistory {
  date: string;
  nav: number; // 净值
  change: number; // 涨跌额
  changePercent: number; // 涨跌幅
}
