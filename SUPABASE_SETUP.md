# Supabase 配置指南

## 步骤1：注册并创建项目

1. 访问 https://supabase.com/ 并点击 "Start your project"
2. 使用 GitHub 或邮箱注册登录
3. 点击 "New Project"
4. 填写信息：
   - Project name: `finance-assistant` (可自定义)
   - Database Password: 记住这个密码！
   - Region: 选择 `Northeast Asia (Tokyo)` 或 `Singapore`（离中国最近）
5. 点击 "Create new project"
6. 等待项目创建完成（约2分钟）

## 步骤2：获取 API 密钥

1. 进入项目后，点击左侧菜单 "Project Settings"（齿轮图标）
2. 点击 "API"
3. 复制以下信息：
   - **URL**: `https://xxx.supabase.co`
   - **anon public** key: `eyJhbG...` (长字符串)
   - **service_role** key: `eyJhbG...` (长字符串，保密！)

## 步骤3：创建数据表

1. 在 Supabase 控制台，点击左侧 "SQL Editor"
2. 点击 "New query"
3. 依次复制以下SQL文件的内容，粘贴到SQL编辑器中执行：
   - `supabase/migrations/001_create_stocks_table.sql`
   - `supabase/migrations/002_create_funds_table.sql`
   - `supabase/migrations/003_create_price_history_table.sql`
   - `supabase/migrations/004_create_technical_indicators_table.sql`
   - `supabase/migrations/005_create_financial_reports_table.sql`
   - `supabase/migrations/006_create_watchlist_table.sql`
   - `supabase/migrations/007_create_alerts_table.sql`
   - `supabase/migrations/008_create_portfolio_table.sql`
   - `supabase/migrations/009_create_transactions_table.sql`

4. 每个文件执行后，点击 "RUN" 按钮

## 步骤4：配置环境变量

1. 复制 `.env.local.example` 为 `.env.local`：
   ```bash
   cp .env.local.example .env.local
   ```

2. 编辑 `.env.local`，填入步骤2中获取的密钥：
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
   ```

## 步骤5：启用认证（可选）

如果需要多用户登录功能：

1. 在 Supabase 控制台，点击左侧 "Authentication"
2. 点击 "Settings"
3. 在 "Site URL" 填入：`http://localhost:3000`
4. 点击 "Save"

## 步骤6：测试

1. 重启开发服务器：
   ```bash
   npm run dev
   ```

2. 访问 http://localhost:3000/dashboard

3. 测试功能：
   - 添加股票到关注列表
   - 添加持仓记录
   - 设置价格提醒

## 常见问题

### Q: 执行SQL时报错怎么办？
A: 请检查SQL文件是否按顺序执行，先执行001，再执行002...

### Q: 忘记数据库密码怎么办？
A: 在 Project Settings > Database 中点击 "Reset password"

### Q: 如何查看数据？
A: 在 Supabase 控制台点击左侧 "Table Editor" 可以查看和编辑数据

## 完成标志

✅ 环境变量已配置  
✅ 9个数据表已创建  
✅ 应用可以正常连接数据库  
✅ 可以保存关注列表、持仓记录等数据
