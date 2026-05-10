-- 创建财报数据表
CREATE TABLE IF NOT EXISTS financial_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  report_type VARCHAR(10) NOT NULL CHECK (report_type IN ('Q1', 'Q2', 'Q3', 'Q4', 'ANNUAL')),
  report_date DATE NOT NULL,
  revenue DECIMAL(15, 2),
  revenue_growth DECIMAL(5, 2),
  net_profit DECIMAL(15, 2),
  net_profit_growth DECIMAL(5, 2),
  gross_margin DECIMAL(5, 2),
  operating_margin DECIMAL(5, 2),
  net_margin DECIMAL(5, 2),
  roe DECIMAL(5, 2),
  roa DECIMAL(5, 2),
  debt_ratio DECIMAL(5, 2),
  current_ratio DECIMAL(5, 2),
  quick_ratio DECIMAL(5, 2),
  eps DECIMAL(10, 2),
  bps DECIMAL(10, 2),
  operating_cash_flow DECIMAL(15, 2),
  free_cash_flow DECIMAL(15, 2),
  total_assets DECIMAL(15, 2),
  total_liabilities DECIMAL(15, 2),
  total_equity DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(symbol, report_type, report_date)
);

-- 创建索引
CREATE INDEX idx_financial_reports_symbol ON financial_reports(symbol);
CREATE INDEX idx_financial_reports_date ON financial_reports(report_date);

-- 启用行级安全策略
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for everyone" ON financial_reports FOR ALL USING (true) WITH CHECK (true);
