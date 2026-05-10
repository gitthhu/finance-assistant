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

-- 创建索引
CREATE INDEX idx_watchlist_symbol ON watchlist(symbol, symbol_type);
CREATE INDEX idx_watchlist_added_at ON watchlist(added_at);

-- 启用行级安全策略（单用户模式）
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for everyone" ON watchlist FOR ALL USING (true) WITH CHECK (true);

-- 插入示例数据
INSERT INTO watchlist (symbol, symbol_type, name, notes) VALUES
('000001.SZ', 'stock', '平安银行', '关注银行板块表现'),
('AAPL', 'stock', 'Apple Inc.', '科技股龙头')
ON CONFLICT (symbol, symbol_type) DO NOTHING;
