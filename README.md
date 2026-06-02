# 三轮车配件销售 — 瑞盛商贸有限公司

React 19 + TypeScript + Vite + Tailwind CSS 搭建的三轮车配件订购系统。

## 快速启动

```bash
npm install
npm run dev
```

默认使用 localStorage 存储数据（无需后端），浏览器打开 `http://localhost:5173` 即可使用。

- 客户端：`http://localhost:5173`
- 管理后台：`http://localhost:5173/admin.html`（默认密码 `admin / 123456`）

## 使用 Supabase 后端

1. 在 [supabase.com](https://supabase.com) 创建免费项目
2. 进入 **SQL Editor**，粘贴 `supabase/migrations/20260602000000_init.sql`，点击 RUN
3. 进入 **Settings → API**，复制 Project URL 和 anon public key
4. 编辑 `.env` 文件，取消注释并填入真实值：

```
VITE_SUPABASE_URL=https://你的项目.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...你的key
```

5. 部署 Edge Functions（需要 Supabase CLI）：

```bash
supabase secrets set ADMIN_PASSWORD=你的管理密码
supabase secrets set ADMIN_JWT_SECRET=$(openssl rand -hex 32)
supabase functions deploy admin-login
supabase functions deploy admin-products
supabase functions deploy admin-categories
supabase functions deploy admin-orders
```

6. 进入 **Storage** → New bucket → 名称 `product-images`，勾选 Public bucket
7. 重启 `npm run dev`，系统自动切换到 Supabase

## 项目结构

```
src/
  client/          ← 客户前端（4 页：首页、订单、历史、登录）
  admin/           ← 管理后台（登录、商品管理、订单管理、导出）
  shared/
    types/         ← TypeScript 类型定义
    services/      ← 业务逻辑层
      interfaces.ts    ← 服务接口
      localStorage.ts  ← localStorage 实现（默认）
      supabase/        ← Supabase 实现
    i18n/          ← 三语翻译（zh/en/ru）
    components/    ← 通用 UI 组件
supabase/
  migrations/      ← 数据库建表脚本
  functions/       ← Edge Functions（Deno）
docs/superpowers/  ← 设计文档和计划
```
