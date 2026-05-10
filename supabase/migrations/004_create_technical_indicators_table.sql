-- 创建技术指标表
CREATE TABLE IF NOT EXISTS technical_indicators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol VARCHAR(20) NOT NULL,
  symbol_type VARCHAR(10) NOT NULL CHECK (symbol_type IN ('stock', 'fund')),
  date DATE NOT NULL,
  indicator_type VARCHAR(20) NOT NULL CHECK (indicator_type IN ('MACD', 'KDJ', 'RSI', 'BOLL', 'MA', 'EMA')),
  value DECIMAL(10, 4) NOT NULL,
  signal_value DECIMAL(10, 4),
  signal_type VARCHAR(10) CHECK (signal_type IN ('BUY', 'SELL', 'HOLD')),
  params JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(symbol, symbol_type, date, indicator_type)
);

-- 创建索引
CREATE INDEX idx_technical_indicators_symbol ON technical_indicators(symbol, symbol_type);
CREATE INDEX idx_technical_indicators_date ON technical_indicators(date);
CREATE INDEX idx_technical_indicators_type ON technical_indicators(indicator_type);

-- 启用行级安全策略
ALTER TABLE technical_indicators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for everyone" ON technical_indicators FOR ALL USING (true) WITH CHECK (true);
