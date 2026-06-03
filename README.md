# 三轮车配件销售系统 — 瑞盛商贸有限公司

React 19 + TypeScript + Vite 8 + Tailwind CSS 3 + Supabase 搭建的三轮车配件订购平台，支持中/英/俄三语。

## 功能概览

**客户端** (`/`)
- 浏览配件（按分类筛选、关键词搜索、网格/表格视图切换）
- 选择规格型号，加入购物车
- 提交订单（填写收货信息，无需支付）
- 查看历史订单及核算状态

**管理后台** (`/admin.html`)
- 商品管理：新增/编辑/上下架，管理分类，上传图片
- 订单管理：查看订单、逐项定价、核算统计
- 导出 Excel：单订单导出 / 全部订单批量导出
- 管理员登录鉴权

## 快速启动（无需后端）

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173`，数据存储在 localStorage，开箱即用。

- 客户前端：`http://localhost:5173`
- 管理后台：`http://localhost:5173/admin.html`（默认账号 `admin` / 密码 `123456`）

## 接入 Supabase 后端

### 1. 创建 Supabase 项目

在 [supabase.com](https://supabase.com) 创建免费项目。

### 2. 初始化数据库

进入 **SQL Editor**，粘贴 `supabase/migrations/20260602000000_init.sql` 全部内容，点击 **RUN**。

该脚本会创建以下表结构并自动填充种子数据：

| 表 | 说明 |
|---|---|
| `categories` | 商品分类（车架、车轮、刹车、传动、电气） |
| `products` | 商品信息（多语言名称、图片、上下架） |
| `variants` | 商品规格型号（关联 products） |
| `profiles` | 用户扩展信息（自动创建） |
| `orders` | 订单（关联用户、含核算状态） |
| `order_items` | 订单明细（含单价、数量） |

所有表均已启用 RLS（Row Level Security），客户只能查看/操作自己的数据，管理员通过 Edge Functions 使用 service_role key 操作全部数据。

### 3. 配置存储桶

进入 **Storage** → New bucket → 名称 `product-images`，勾选 **Public bucket**。

### 4. 配置环境变量

复制 `.env.example` 为 `.env`，填入 Supabase 项目信息：

```env
VITE_SUPABASE_URL=https://你的项目.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...你的anon-key
```

### 5. 部署 Edge Functions

需要 [Supabase CLI](https://supabase.com/docs/guides/cli)：

```bash
supabase secrets set ADMIN_PASSWORD=你的管理密码
supabase functions deploy admin-login
supabase functions deploy admin-products
supabase functions deploy admin-categories
supabase functions deploy admin-orders
```

Edge Functions 说明：

| Function | 功能 |
|---|---|
| `admin-login` | 管理员密码验证，返回临时 token |
| `admin-products` | 商品 CRUD + 图片上传 |
| `admin-categories` | 分类管理 |
| `admin-orders` | 订单列表、定价更新、删除 |

### 6. 启动

```bash
npm run dev
```

检测到 `VITE_SUPABASE_URL` 环境变量后，系统自动切换为 Supabase 后端模式。

## 部署到 Vercel

项目已配置 `vercel.json`，可直接导入 Vercel：

1. 将代码推送到 GitHub
2. 在 [vercel.com](https://vercel.com) 导入仓库
3. 设置 Environment Variables：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`
4. Deploy

## 项目结构

```
├── index.html                    # 客户端入口
├── admin.html                    # 管理后台入口
├── src/
│   ├── client/                   # 客户前端
│   │   ├── App.tsx               # 路由配置（首页/订单/历史/登录）
│   │   ├── components/           # Header, Footer, AuthGuard, ProductPicker
│   │   └── pages/                # HomePage, OrderPage, OrderHistory, LoginPage
│   ├── admin/                    # 管理后台
│   │   ├── App.tsx               # 路由配置（登录/商品/订单）
│   │   ├── components/           # AdminLayout
│   │   └── pages/                # LoginPage, ProductManager, OrderManager
│   └── shared/                   # 共享模块
│       ├── types/                # TypeScript 类型定义
│       ├── services/             # 业务逻辑层
│       │   ├── interfaces.ts     # 服务接口抽象
│       │   ├── localStorage.ts   # localStorage 实现
│       │   ├── supabase/         # Supabase 实现（client/admin/product/order/category service）
│       │   └── seed.ts           # 种子数据
│       ├── i18n/                 # 国际化（zh/en/ru）
│       ├── components/ui/        # 通用 UI 组件（Button, Input, Modal, Toast 等）
│       └── utils.ts              # 工具函数
├── supabase/
│   ├── migrations/               # 数据库迁移脚本（含 RLS 策略）
│   └── functions/                # Edge Functions（Deno）
├── vercel.json                   # Vercel 部署配置
└── vite.config.ts                # Vite 多页面配置
```

## 技术栈

| 类别 | 技术 |
|---|---|
| 前端框架 | React 19 |
| 语言 | TypeScript 6.0 |
| 构建工具 | Vite 8 |
| CSS | Tailwind CSS 3.4 |
| 状态管理 | Zustand 5 |
| 国际化 | i18next + react-i18next |
| 路由 | react-router-dom v7 |
| 后端 | Supabase (PostgreSQL + RLS + Edge Functions) |
| 导出 | xlsx (Excel) / docx (Word) |
| 部署 | Vercel |

## 设计架构

系统采用**服务接口抽象**设计：`interfaces.ts` 定义了 `ProductService`、`CategoryService`、`OrderService`、`AuthService` 四个接口，`localStorage.ts` 和 `supabase/` 各自实现。入口 `services/index.ts` 根据是否配置 `VITE_SUPABASE_URL` 自动选择实现，上层代码无需感知数据来源。

```typescript
// 自动切换后端
const useSupabase = !!import.meta.env.VITE_SUPABASE_URL;
export const productService: ProductService = useSupabase
  ? new SupabaseProductService()
  : new LocalStorageProductService();
```

安全模型：
- **客户端**：通过 Supabase Auth 登录，所有操作受 RLS 约束
- **管理后台**：通过 Edge Functions + service_role key 操作数据，密码鉴权
