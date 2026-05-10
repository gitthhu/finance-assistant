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

-- 创建索引
CREATE INDEX idx_funds_code ON funds(code);
CREATE INDEX idx_funds_type ON funds(fund_type);
CREATE INDEX idx_funds_company ON funds(company);

-- 启用行级安全策略
ALTER TABLE funds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for everyone" ON funds FOR ALL USING (true) WITH CHECK (true);

-- 插入示例数据
INSERT INTO funds (code, name, fund_type, manager, company, nav, return_1y) VALUES
('000001', '华夏成长混合', '混合基金', '王明', '华夏基金', 1.2345, 15.2),
('110022', '易方达消费行业', '公募基金', '李强', '易方达基金', 3.4567, 22.5),
('161725', '招商中证白酒', '指数基金', '张伟', '招商基金', 1.0987, -8.3)
ON CONFLICT (code) DO NOTHING;
