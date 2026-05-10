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

-- 创建索引
CREATE INDEX idx_price_history_symbol ON price_history(symbol, symbol_type);
CREATE INDEX idx_price_history_date ON price_history(date);
CREATE INDEX idx_price_history_symbol_date ON price_history(symbol, symbol_type, date);

-- 启用行级安全策略
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for everyone" ON price_history FOR ALL USING (true) WITH CHECK (true);
