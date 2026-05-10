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

-- 创建索引
CREATE INDEX idx_stocks_symbol ON stocks(symbol);
CREATE INDEX idx_stocks_market ON stocks(market);
CREATE INDEX idx_stocks_industry ON stocks(industry);

-- 启用行级安全策略（单用户模式，允许所有操作）
ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for everyone" ON stocks FOR ALL USING (true) WITH CHECK (true);

-- 插入示例数据
INSERT INTO stocks (symbol, name, market, industry, current_price, change_percent) VALUES
('000001.SZ', '平安银行', 'A股', '金融', 12.50, 1.2),
('600000.SH', '浦发银行', 'A股', '金融', 8.30, -0.5),
('AAPL', 'Apple Inc.', '美股', '科技', 178.50, 2.1),
('TSLA', 'Tesla Inc.', '美股', '汽车', 245.80, -1.3)
ON CONFLICT (symbol) DO NOTHING;
