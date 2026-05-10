-- ====================================
-- 理财助手数据库完整脚本
-- 在 Supabase SQL Editor 中一次性执行此文件
-- ====================================

-- 创建股票基本信息表
CREATE TABLE IF NOT EXISTS stocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  market VARCHAR(20) NOT NULL CHECK (market IN ('A股', '港股', '美股')),
  industry VARCHAR(100),
  sector VARCHAR(100),
  listing_date DATE,
  current_price DECIMAL(10, 2),
  change_percent DECIMAL(5, 2),
  volume BIGINT,
  market_cap DECIMAL(15, 2),
  pe_ratio DECIMAL(10, 2),
  pb_ratio DECIMAL(10, 2),
  roe DECIMAL(5, 2),
  dividend_yield DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_stocks_symbol ON stocks(symbol);
CREATE INDEX idx_stocks_market ON stocks(market);
CREATE INDEX idx_stocks_industry ON stocks(industry);

ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for everyone" ON stocks FOR ALL USING (true) WITH CHECK (true);

-- 创建基金基本信息表
CREATE TABLE IF NOT EXISTS funds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  fund_type VARCHAR(50) NOT NULL CHECK (fund_type IN ('公募基金', '私募基金', '指数基金', '债券基金', '混合基金')),
  manager VARCHAR(100),
  company VARCHAR(100),
  inception_date DATE,
  nav DECIMAL(10, 4),
  nav_date DATE,
  return_1d DECIMAL(5, 2),
  return_7d DECIMAL(5, 2),
  return_30d DECIMAL(5, 2),
  return_90d DECIMAL(5, 2),
  return_1y DECIMAL(5, 2),
  volatility DECIMAL(5, 2),
  sharpe_ratio DECIMAL(5, 2),
  max_drawdown DECIMAL(5, 2),
  expense_ratio DECIMAL(5, 2),
  aum DECIMAL(15, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_funds_code ON funds(code);
CREATE INDEX idx_funds_type ON funds(fund_type);

ALTER TABLE funds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for everyone" ON funds FOR ALL USING (true) WITH CHECK (true);

-- 创建历史价格表
CREATE TABLE IF NOT EXISTS price_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  symbol_type VARCHAR(10) NOT NULL CHECK (symbol_type IN ('stock', 'fund')),
  date DATE NOT NULL,
  open DECIMAL(10, 2),
  high DECIMAL(10, 2),
  low DECIMAL(10, 2),
  close DECIMAL(10, 2) NOT NULL,
  volume BIGINT,
  amount DECIMAL(15, 2),
  change DECIMAL(10, 2),
  change_percent DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(symbol, symbol_type, date)
);

CREATE INDEX idx_price_history_symbol ON price_history(symbol, symbol_type);
CREATE INDEX idx_price_history_date ON price_history(date);

ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for everyone" ON price_history FOR ALL USING (true) WITH CHECK (true);

-- 创建技术指标表
CREATE TABLE IF NOT EXISTS technical_indicators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  symbol_type VARCHAR(10) NOT NULL CHECK (symbol_type IN ('stock', 'fund')),
  date DATE NOT NULL,
  indicator_type VARCHAR(20) NOT NULL CHECK (indicator_type IN ('MACD', 'KDJ', 'RSI', 'BOLL', 'MA', 'EMA', 'WR', 'CCI', 'ATR', 'OBV', 'ADX')),
  value DECIMAL(10, 4) NOT NULL,
  signal_value DECIMAL(10, 4),
  signal_type VARCHAR(10) CHECK (signal_type IN ('BUY', 'SELL', 'HOLD')),
  params JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(symbol, symbol_type, date, indicator_type)
);

CREATE INDEX idx_technical_indicators_symbol ON technical_indicators(symbol, symbol_type);
CREATE INDEX idx_technical_indicators_date ON technical_indicators(date);

ALTER TABLE technical_indicators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for everyone" ON technical_indicators FOR ALL USING (true) WITH CHECK (true);

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

CREATE INDEX idx_financial_reports_symbol ON financial_reports(symbol);
CREATE INDEX idx_financial_reports_date ON financial_reports(report_date);

ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for everyone" ON financial_reports FOR ALL USING (true) WITH CHECK (true);

-- 创建关注列表表
CREATE TABLE IF NOT EXISTS watchlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  symbol_type VARCHAR(10) NOT NULL CHECK (symbol_type IN ('stock', 'fund')),
  name VARCHAR(200),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,
  UNIQUE(symbol, symbol_type)
);

CREATE INDEX idx_watchlist_symbol ON watchlist(symbol, symbol_type);
CREATE INDEX idx_watchlist_added_at ON watchlist(added_at);

ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for everyone" ON watchlist FOR ALL USING (true) WITH CHECK (true);

-- 创建价格提醒表
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  symbol_type VARCHAR(10) NOT NULL CHECK (symbol_type IN ('stock', 'fund')),
  name VARCHAR(200),
  alert_type VARCHAR(10) NOT NULL CHECK (alert_type IN ('above', 'below')),
  target_price DECIMAL(10, 2) NOT NULL,
  current_price DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT true,
  is_triggered BOOLEAN DEFAULT false,
  triggered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_alerts_symbol ON alerts(symbol, symbol_type);
CREATE INDEX idx_alerts_active ON alerts(is_active);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for everyone" ON alerts FOR ALL USING (true) WITH CHECK (true);

-- 创建持仓记录表
CREATE TABLE IF NOT EXISTS portfolio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  symbol_type VARCHAR(10) NOT NULL CHECK (symbol_type IN ('stock', 'fund')),
  name VARCHAR(200),
  buy_date DATE NOT NULL,
  buy_price DECIMAL(10, 2) NOT NULL,
  quantity DECIMAL(15, 4) NOT NULL,
  buy_amount DECIMAL(15, 2) GENERATED ALWAYS AS (buy_price * quantity) STORED,
  current_price DECIMAL(10, 2),
  current_value DECIMAL(15, 2),
  profit_loss DECIMAL(15, 2),
  profit_loss_percent DECIMAL(5, 2),
  status VARCHAR(10) DEFAULT 'holding' CHECK (status IN ('holding', 'sold')),
  sell_date DATE,
  sell_price DECIMAL(10, 2),
  sell_amount DECIMAL(15, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_portfolio_symbol ON portfolio(symbol, symbol_type);
CREATE INDEX idx_portfolio_status ON portfolio(status);

ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for everyone" ON portfolio FOR ALL USING (true) WITH CHECK (true);

-- 创建交易记录表
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID REFERENCES portfolio(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  symbol_type VARCHAR(10) NOT NULL CHECK (symbol_type IN ('stock', 'fund')),
  transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('buy', 'sell', 'dividend', 'bonus')),
  date DATE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity DECIMAL(15, 4) NOT NULL,
  amount DECIMAL(15, 2) GENERATED ALWAYS AS (price * quantity) STORED,
  fee DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(15, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_portfolio ON transactions(portfolio_id);
CREATE INDEX idx_transactions_symbol ON transactions(symbol, symbol_type);
CREATE INDEX idx_transactions_date ON transactions(date);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for everyone" ON transactions FOR ALL USING (true) WITH CHECK (true);

-- ====================================
-- 插入示例数据
-- ====================================

-- 股票示例数据
INSERT INTO stocks (symbol, name, market, industry, current_price, change_percent) VALUES
('000001.SZ', '平安银行', 'A股', '金融', 12.50, 1.2),
('600000.SH', '浦发银行', 'A股', '金融', 8.30, -0.5),
('AAPL', 'Apple Inc.', '美股', '科技', 178.50, 2.1),
('TSLA', 'Tesla Inc.', '美股', '汽车', 245.80, -1.3)
ON CONFLICT (symbol) DO NOTHING;

-- 基金示例数据
INSERT INTO funds (code, name, fund_type, manager, company, nav, return_1y) VALUES
('000001', '华夏成长混合', '混合基金', '王明', '华夏基金', 1.2345, 15.2),
('110022', '易方达消费行业', '公募基金', '李强', '易方达基金', 3.4567, 22.5),
('161725', '招商中证白酒', '指数基金', '张伟', '招商基金', 1.0987, -8.3)
ON CONFLICT (code) DO NOTHING;

-- 关注列表示例数据
INSERT INTO watchlist (symbol, symbol_type, name, notes) VALUES
('000001.SZ', 'stock', '平安银行', '关注银行板块表现'),
('AAPL', 'stock', 'Apple Inc.', '科技股龙头')
ON CONFLICT (symbol, symbol_type) DO NOTHING;

-- 价格提醒示例数据
INSERT INTO alerts (symbol, symbol_type, name, alert_type, target_price, current_price) VALUES
('000001.SZ', 'stock', '平安银行', 'above', 15.00, 12.50),
('AAPL', 'stock', 'Apple Inc.', 'below', 170.00, 178.50)
ON CONFLICT DO NOTHING;

-- 持仓记录示例数据
INSERT INTO portfolio (symbol, symbol_type, name, buy_date, buy_price, quantity, current_price) VALUES
('000001.SZ', 'stock', '平安银行', '2024-01-15', 10.50, 1000, 12.50),
('AAPL', 'stock', 'Apple Inc.', '2024-02-20', 170.00, 50, 178.50)
ON CONFLICT DO NOTHING;

-- 交易记录示例数据
DO $$
DECLARE
  portfolio_id_1 UUID;
  portfolio_id_2 UUID;
BEGIN
  SELECT id INTO portfolio_id_1 FROM portfolio WHERE symbol = '000001.SZ' LIMIT 1;
  SELECT id INTO portfolio_id_2 FROM portfolio WHERE symbol = 'AAPL' LIMIT 1;
  
  IF portfolio_id_1 IS NOT NULL THEN
    INSERT INTO transactions (portfolio_id, symbol, symbol_type, transaction_type, date, price, quantity, fee)
    VALUES (portfolio_id_1, '000001.SZ', 'stock', 'buy', '2024-01-15', 10.50, 1000, 5.00)
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF portfolio_id_2 IS NOT NULL THEN
    INSERT INTO transactions (portfolio_id, symbol, symbol_type, transaction_type, date, price, quantity, fee)
    VALUES (portfolio_id_2, 'AAPL', 'stock', 'buy', '2024-02-20', 170.00, 50, 1.00)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ====================================
-- 完成！
-- ====================================
SELECT '数据库创建成功！' as message;
