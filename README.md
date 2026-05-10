# 理财助手 Web 应用

一个基于 Web 的理财辅助工具，支持股票（A股、港股、美股）和基金（公募基金、私募基金）的实时行情监控、技术分析、基本面分析、量化策略建议和价格提醒功能。

## 技术栈

- **前端框架**: Next.js 14 (App Router) + React 18 + TypeScript
- **UI 组件库**: Tailwind CSS + shadcn/ui
- **状态管理**: React Query (TanStack Query)
- **图表库**: Recharts
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL + Realtime)
- **部署**: Vercel + Supabase

## 功能特性

- 📊 实时行情监控（A股、港股、美股）
- 📈 技术指标分析（MACD、KDJ、RSI 等）
- 📄 基本面分析（财报、估值指标）
- 🤖 智能买卖建议
- 🔔 价格提醒功能
- 💼 持仓追踪和收益计算
- 📱 响应式设计，支持多设备访问

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.local.example` 到 `.env.local` 并填写配置：

```bash
cp .env.local.example .env.local
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API Routes
│   ├── dashboard/      # 仪表盘页面
│   ├── stocks/         # 股票页面
│   ├── funds/          # 基金页面
│   └── portfolio/      # 持仓页面
├── components/         # React 组件
├── lib/                # 工具函数和配置
├── hooks/              # 自定义 React Hooks
└── types/              # TypeScript 类型定义
```

## 数据库设置

1. 创建 Supabase 项目
2. 执行 `supabase/migrations/` 目录下的 SQL 文件
3. 配置环境变量

## 部署

### 部署到 Vercel

```bash
npm run build
vercel deploy
```

## 许可证

MIT
