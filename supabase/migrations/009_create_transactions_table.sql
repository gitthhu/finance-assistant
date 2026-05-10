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

-- 创建索引
CREATE INDEX idx_transactions_portfolio ON transactions(portfolio_id);
CREATE INDEX idx_transactions_symbol ON transactions(symbol, symbol_type);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);

-- 启用行级安全策略（单用户模式）
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for everyone" ON transactions FOR ALL USING (true) WITH CHECK (true);

-- 插入示例交易记录
-- 先获取 portfolio id
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
