# 三轮车配件销售系统 — 安装指南

## 你需要什么

- 一个 [Supabase](https://supabase.com) 免费账号（2 分钟注册）
- 一个 [Vercel](https://vercel.com) 免费账号（用 GitHub 登录即可）
- Node.js（已安装跳过）

---

## 第一步：建后端（Supabase 数据库）

1. 打开 [supabase.com](https://supabase.com) 创建新项目，记好数据库密码
2. 进入 **SQL Editor**，打开本项目 `supabase/migrations/001_init.sql`，全选粘贴，点 **RUN**
3. 进入 **Storage** → New bucket → 名称填 `product-images`，勾选 Public bucket → 创建
4. 进入 **Authentication** → Users → Add User，填你的邮箱和密码（这是管理员账号）
5. 进入 **Database** → **Replication** → 打开 `invoices` 表的开关
6. 进入 **Settings** → **API**，复制 Project URL 和 anon public key

---

## 第二步：连上前端

1. 把 `supabase.com` 上复制的 URL 和 key 填入项目根目录的 `.env` 文件：

```
VITE_SUPABASE_URL=https://你的项目.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...你的key
```

2. 命令行运行：

```bash
npm install
npm run dev
```

3. 浏览器打开 `http://localhost:5174`，搞定。

---

## 第三步：部署上线（可选）

1. 把项目上传到 GitHub
2. 打开 [vercel.com](https://vercel.com)，导入 GitHub 仓库
3. 在 Environment Variables 设置同样的两个变量
4. 点 Deploy，线上就能访问了

---

## 项目结构

| 目录/文件 | 说明 |
|-----------|------|
| `src/` | 前端代码（React 页面、组件、状态管理） |
| `supabase/migrations/` | 后端数据库建表脚本 |
| `.env` | Supabase 连接配置（不提交 git） |
| `.env.example` | 配置模板 |
