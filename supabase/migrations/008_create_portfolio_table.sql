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

-- 创建索引
CREATE INDEX idx_portfolio_symbol ON portfolio(symbol, symbol_type);
CREATE INDEX idx_portfolio_status ON portfolio(status);
CREATE INDEX idx_portfolio_buy_date ON portfolio(buy_date);

-- 启用行级安全策略（单用户模式）
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for everyone" ON portfolio FOR ALL USING (true) WITH CHECK (true);

-- 插入示例数据
INSERT INTO portfolio (symbol, symbol_type, name, buy_date, buy_price, quantity, current_price) VALUES
('000001.SZ', 'stock', '平安银行', '2024-01-15', 10.50, 1000, 12.50),
('AAPL', 'stock', 'Apple Inc.', '2024-02-20', 170.00, 50, 178.50)
ON CONFLICT DO NOTHING;
