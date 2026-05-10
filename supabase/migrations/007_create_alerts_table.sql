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

-- 创建索引
CREATE INDEX idx_alerts_symbol ON alerts(symbol, symbol_type);
CREATE INDEX idx_alerts_active ON alerts(is_active);
CREATE INDEX idx_alerts_triggered ON alerts(is_triggered);

-- 启用行级安全策略（单用户模式）
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for everyone" ON alerts FOR ALL USING (true) WITH CHECK (true);

-- 插入示例数据
INSERT INTO alerts (symbol, symbol_type, name, alert_type, target_price, current_price) VALUES
('000001.SZ', 'stock', '平安银行', 'above', 15.00, 12.50),
('AAPL', 'stock', 'Apple Inc.', 'below', 170.00, 178.50)
ON CONFLICT DO NOTHING;
