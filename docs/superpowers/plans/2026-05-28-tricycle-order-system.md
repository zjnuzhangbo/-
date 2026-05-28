# Tricycle Order System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dual-entry (client + admin) tricycle parts wholesale ordering frontend with per-order pricing.

**Architecture:** Two separate SPAs (client on `index.html`, admin on `admin.html`) sharing a `src/shared/` layer for types, services, and UI components. localStorage data layer behind service interfaces for future API swap.

**Tech Stack:** React 19, TypeScript 6, Vite 8 (multi-entry), Tailwind CSS 3.4, Zustand 5, i18next, React Router DOM 7 (HashRouter)

---

### Task 1: Project Config & Entry Points

**Files:**
- Modify: `vite.config.ts`
- Modify: `tailwind.config.js`
- Modify: `index.html`
- Create: `admin.html`
- Modify: `package.json`
- Create: `src/index.css`

- [ ] **Step 1: Update `package.json` — add xlsx and docx deps**

```bash
cd "C:/Users/31777/Desktop/网站" && npm install xlsx docx file-saver
```

- [ ] **Step 2: Update `vite.config.ts` — multi-entry build**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin.html'),
      },
    },
  },
})
```

- [ ] **Step 3: Update `tailwind.config.js` — new design system theme**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './admin.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        cyan: {
          600: '#0891b2',
          700: '#0e7490',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '14px',
        pill: '999px',
      },
      spacing: {
        '0.5': '2px',
        '1.5': '6px',
        '2.5': '10px',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: Update `index.html` — point to client entry**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
    <title>TricycleParts</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/client/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `admin.html` — admin entry point**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
    <title>TricycleParts Admin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/admin/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 6: Create `src/index.css` — Tailwind directives + base styles**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply font-sans text-slate-800 bg-slate-50 antialiased;
  }
  h1, h2, h3, h4, h5, h6 {
    @apply font-display;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white font-semibold rounded-md px-6 py-2.5
           hover:bg-primary-700 active:bg-primary-800
           transition-colors duration-150;
  }
  .btn-outline {
    @apply bg-white text-primary-600 border-1.5 border-primary-600
           font-semibold rounded-md px-6 py-2.5
           hover:bg-primary-50 active:bg-primary-100
           transition-colors duration-150;
  }
  .btn-danger {
    @apply bg-white text-red-600 border-1.5 border-red-600
           font-semibold rounded-md px-6 py-2.5
           hover:bg-red-50 active:bg-red-100
           transition-colors duration-150;
  }
  .input-field {
    @apply w-full px-3 py-2.5 border-1.5 border-slate-200 rounded-md
           text-sm outline-none
           focus:border-primary-600 focus:ring-2 focus:ring-primary-100
           transition-colors duration-150;
  }
}
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: Build succeeds (will fail on missing entry files — that's OK, we create them in Task 2).

---

### Task 2: Shared Types & Service Layer

**Files:**
- Create: `src/shared/types/index.ts`
- Create: `src/shared/services/interfaces.ts`
- Create: `src/shared/services/localStorage.ts`
- Create: `src/shared/services/index.ts`

- [ ] **Step 1: Create `src/shared/types/index.ts`**

```typescript
export interface LocalizedString {
  zh: string;
  en: string;
  ru: string;
}

export interface Variant {
  id: string;
  model: string;
  size: string;
  weight: string;
}

export interface Product {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  categoryId: string;
  images: string[];
  variants: Variant[];
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: LocalizedString;
  icon: string;
  sortOrder: number;
}

export interface OrderItem {
  productId: string;
  variantId: string;
  productName: string;
  model: string;
  spec: string;
  quantity: number;
  unitPrice?: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  status: 'pending' | 'priced';
  createdAt: string;
}

export type OrderStatus = Order['status'];
```

- [ ] **Step 2: Create `src/shared/services/interfaces.ts`**

```typescript
import type { Product, Category, Order } from '../types';

export interface ProductService {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | undefined>;
  create(product: Product): Promise<void>;
  update(id: string, data: Partial<Product>): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface CategoryService {
  getAll(): Promise<Category[]>;
  create(category: Category): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface OrderService {
  getAll(): Promise<Order[]>;
  getById(id: string): Promise<Order | undefined>;
  create(order: Order): Promise<void>;
  update(id: string, data: Partial<Order>): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface AuthService {
  login(username: string, password: string): Promise<boolean>;
  logout(): void;
  isLoggedIn(): boolean;
  getToken(): string | null;
}
```

- [ ] **Step 3: Create `src/shared/services/localStorage.ts`**

```typescript
import type { Product, Category, Order } from '../types';
import type { ProductService, CategoryService, OrderService, AuthService } from './interfaces';

const PRODUCTS_KEY = 'tricycle_products';
const CATEGORIES_KEY = 'tricycle_categories';
const ORDERS_KEY = 'tricycle_orders';
const AUTH_KEY = 'tricycle_auth';
const SHIPPING_KEY = 'tricycle_shipping';

function read<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export class LocalStorageProductService implements ProductService {
  async getAll(): Promise<Product[]> { return read<Product>(PRODUCTS_KEY); }
  async getById(id: string): Promise<Product | undefined> {
    return read<Product>(PRODUCTS_KEY).find(p => p.id === id);
  }
  async create(product: Product): Promise<void> {
    const list = read<Product>(PRODUCTS_KEY);
    list.push(product);
    write(PRODUCTS_KEY, list);
  }
  async update(id: string, data: Partial<Product>): Promise<void> {
    const list = read<Product>(PRODUCTS_KEY);
    const idx = list.findIndex(p => p.id === id);
    if (idx !== -1) { list[idx] = { ...list[idx], ...data }; write(PRODUCTS_KEY, list); }
  }
  async remove(id: string): Promise<void> {
    write(PRODUCTS_KEY, read<Product>(PRODUCTS_KEY).filter(p => p.id !== id));
  }
}

export class LocalStorageCategoryService implements CategoryService {
  async getAll(): Promise<Category[]> { return read<Category>(CATEGORIES_KEY); }
  async create(category: Category): Promise<void> {
    const list = read<Category>(CATEGORIES_KEY);
    list.push(category);
    write(CATEGORIES_KEY, list);
  }
  async remove(id: string): Promise<void> {
    write(CATEGORIES_KEY, read<Category>(CATEGORIES_KEY).filter(c => c.id !== id));
  }
}

export class LocalStorageOrderService implements OrderService {
  async getAll(): Promise<Order[]> { return read<Order>(ORDERS_KEY); }
  async getById(id: string): Promise<Order | undefined> {
    return read<Order>(ORDERS_KEY).find(o => o.id === id);
  }
  async create(order: Order): Promise<void> {
    const list = read<Order>(ORDERS_KEY);
    list.push(order);
    write(ORDERS_KEY, list);
  }
  async update(id: string, data: Partial<Order>): Promise<void> {
    const list = read<Order>(ORDERS_KEY);
    const idx = list.findIndex(o => o.id === id);
    if (idx !== -1) { list[idx] = { ...list[idx], ...data }; write(ORDERS_KEY, list); }
  }
  async remove(id: string): Promise<void> {
    write(ORDERS_KEY, read<Order>(ORDERS_KEY).filter(o => o.id !== id));
  }
}

export class LocalStorageAuthService implements AuthService {
  async login(username: string, password: string): Promise<boolean> {
    if (username === 'admin' && password === '123456') {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ token: 'admin_token', loggedAt: Date.now() }));
      return true;
    }
    return false;
  }
  logout(): void { localStorage.removeItem(AUTH_KEY); }
  isLoggedIn(): boolean { return localStorage.getItem(AUTH_KEY) !== null; }
  getToken(): string | null {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw).token : null;
  }
}

export const SHIPPING_MEMORY_KEY = SHIPPING_KEY;
export function getShippingMemory(): { name: string; phone: string; address: string } | null {
  try {
    const raw = localStorage.getItem(SHIPPING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}
export function setShippingMemory(data: { name: string; phone: string; address: string }): void {
  localStorage.setItem(SHIPPING_KEY, JSON.stringify(data));
}
```

- [ ] **Step 4: Create `src/shared/services/index.ts`**

```typescript
import {
  LocalStorageProductService,
  LocalStorageCategoryService,
  LocalStorageOrderService,
  LocalStorageAuthService,
} from './localStorage';
import type { ProductService, CategoryService, OrderService, AuthService } from './interfaces';

export const productService: ProductService = new LocalStorageProductService();
export const categoryService: CategoryService = new LocalStorageCategoryService();
export const orderService: OrderService = new LocalStorageOrderService();
export const authService: AuthService = new LocalStorageAuthService();

export type { ProductService, CategoryService, OrderService, AuthService };
```

- [ ] **Step 5: Create client entry `src/client/main.tsx` (minimal)**

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>
);
```

- [ ] **Step 6: Create admin entry `src/admin/main.tsx` (minimal)**

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>
);
```

- [ ] **Step 7: Create `src/client/App.tsx` (placeholder)**

```typescript
export default function App() {
  return <div className="p-8 font-display text-2xl">Client App</div>;
}
```

- [ ] **Step 8: Create `src/admin/App.tsx` (placeholder)**

```typescript
export default function App() {
  return <div className="p-8 font-display text-2xl">Admin App</div>;
}
```

- [ ] **Step 9: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 10: Commit**

```bash
git add -A && git commit -m "feat: add shared types, service layer, dual-entry setup"
```

---

### Task 3: i18n Setup

**Files:**
- Create: `src/shared/i18n/index.ts`
- Create: `src/shared/i18n/locales/zh.json`
- Create: `src/shared/i18n/locales/en.json`
- Create: `src/shared/i18n/locales/ru.json`

- [ ] **Step 1: Create `src/shared/i18n/locales/zh.json`**

```json
{
  "nav": { "home": "首页", "history": "历史订单", "cart": "购物车" },
  "home": {
    "title": "三轮车配件批发",
    "subtitle": "优质配件，一站式采购",
    "search": "搜索配件名称...",
    "allCategories": "全部分类",
    "orderBtn": "订购",
    "noProducts": "暂无商品"
  },
  "order": {
    "title": "提交订单",
    "back": "← 返回首页",
    "shippingInfo": "收货信息",
    "name": "收货人姓名",
    "namePlaceholder": "请输入收货人姓名",
    "phone": "联系电话",
    "phonePlaceholder": "请输入联系电话",
    "address": "详细收货地址",
    "addressPlaceholder": "省份/城市/区县/街道",
    "productList": "已选商品",
    "addProduct": "+ 添加商品",
    "submit": "提交订单",
    "submitSuccess": "订单提交成功，请等待后台核算价格",
    "validation": { "name": "请输入收货人姓名", "phone": "请输入联系电话", "address": "请输入收货地址", "empty": "请至少选择一件商品" }
  },
  "history": {
    "title": "历史订单",
    "count": "共 {{count}} 条订单记录",
    "editHint": "修改数量或删除后数据实时更新，后台会同步看到最新内容",
    "save": "保存修改",
    "delete": "删除订单",
    "deleteConfirm": "确定要删除此订单吗？此操作不可撤销。",
    "locked": "已核算订单不可修改",
    "pending": "待核算",
    "priced": "已核算",
    "empty": "暂无订单记录",
    "emptyHint": "去首页浏览商品并提交您的第一个订单吧",
    "all": "全部",
    "filterAll": "全部状态",
    "filterPending": "待核算",
    "filterPriced": "已核算"
  },
  "admin": {
    "login": {
      "title": "后台管理系统",
      "account": "管理员账号",
      "accountPlaceholder": "请输入账号",
      "password": "密码",
      "passwordPlaceholder": "请输入密码",
      "submit": "登 录",
      "footer": "仅限授权管理员使用",
      "error": "账号或密码错误"
    },
    "products": {
      "title": "商品管理",
      "search": "搜索商品...",
      "allCategories": "全部分类",
      "allStatus": "全部状态",
      "active": "上架中",
      "inactive": "已下架",
      "addProduct": "+ 新增商品",
      "image": "图片",
      "name": "商品名称",
      "category": "分类",
      "specs": "规格",
      "status": "状态",
      "actions": "操作",
      "edit": "编辑",
      "activate": "上架",
      "deactivate": "下架",
      "categoryMgmt": "分类管理",
      "addCategory": "+ 新增分类",
      "activeBadge": "上架",
      "inactiveBadge": "下架"
    },
    "orders": {
      "title": "订单管理",
      "search": "搜索订单号/客户...",
      "exportAll": "📥 导出Excel",
      "pending": "待核算",
      "priced": "已核算",
      "pricingHint": "为此订单的每项商品单独设置单价，保存后自动计算总价。同一商品在不同订单可以有不同的价格。",
      "product": "商品",
      "specs": "规格",
      "quantity": "数量",
      "unitPrice": "单价 (元)",
      "subtotal": "小计 (元)",
      "savePricing": "保存定价",
      "exportSingle": "📥 导出此单",
      "total": "订单总价",
      "unpriced": "待定价",
      "notPriced": "--",
      "statsPending": "待核算",
      "statsToday": "今日订单",
      "statsMonth": "本月订单"
    },
    "navbar": { "orders": "订单管理", "products": "商品管理", "logout": "退出登录" }
  },
  "footer": { "copyright": "© 2026 TricycleParts. All rights reserved." },
  "common": { "confirm": "确定", "cancel": "取消", "close": "关闭" }
}
```

- [ ] **Step 2: Create `src/shared/i18n/locales/en.json`**

```json
{
  "nav": { "home": "Home", "history": "History", "cart": "Cart" },
  "home": {
    "title": "Tricycle Parts Wholesale",
    "subtitle": "Quality parts, one-stop procurement",
    "search": "Search parts...",
    "allCategories": "All Categories",
    "orderBtn": "Order",
    "noProducts": "No products available"
  },
  "order": {
    "title": "Submit Order",
    "back": "← Back to Home",
    "shippingInfo": "Shipping Information",
    "name": "Recipient Name",
    "namePlaceholder": "Enter recipient name",
    "phone": "Phone Number",
    "phonePlaceholder": "Enter phone number",
    "address": "Shipping Address",
    "addressPlaceholder": "Province / City / District / Street",
    "productList": "Selected Products",
    "addProduct": "+ Add Product",
    "submit": "Submit Order",
    "submitSuccess": "Order submitted! Please wait for pricing.",
    "validation": { "name": "Please enter recipient name", "phone": "Please enter phone number", "address": "Please enter shipping address", "empty": "Please select at least one product" }
  },
  "history": {
    "title": "Order History",
    "count": "{{count}} order(s)",
    "editHint": "Changes are saved in real-time and synced to the backend.",
    "save": "Save Changes",
    "delete": "Delete Order",
    "deleteConfirm": "Are you sure you want to delete this order? This cannot be undone.",
    "locked": "Priced orders cannot be modified",
    "pending": "Pending",
    "priced": "Priced",
    "empty": "No orders yet",
    "emptyHint": "Browse products on the homepage and submit your first order",
    "all": "All",
    "filterAll": "All Status",
    "filterPending": "Pending",
    "filterPriced": "Priced"
  },
  "admin": {
    "login": {
      "title": "Admin Panel",
      "account": "Admin Account",
      "accountPlaceholder": "Enter account",
      "password": "Password",
      "passwordPlaceholder": "Enter password",
      "submit": "Login",
      "footer": "Authorized administrators only",
      "error": "Invalid account or password"
    },
    "products": {
      "title": "Product Management",
      "search": "Search products...",
      "allCategories": "All Categories",
      "allStatus": "All Status",
      "active": "Active",
      "inactive": "Inactive",
      "addProduct": "+ Add Product",
      "image": "Image",
      "name": "Product Name",
      "category": "Category",
      "specs": "Specs",
      "status": "Status",
      "actions": "Actions",
      "edit": "Edit",
      "activate": "Activate",
      "deactivate": "Deactivate",
      "categoryMgmt": "Category Management",
      "addCategory": "+ Add Category",
      "activeBadge": "Active",
      "inactiveBadge": "Inactive"
    },
    "orders": {
      "title": "Order Management",
      "search": "Search order/customer...",
      "exportAll": "📥 Export Excel",
      "pending": "Pending",
      "priced": "Priced",
      "pricingHint": "Set unit price for each item. Same product can have different prices in different orders.",
      "product": "Product",
      "specs": "Specs",
      "quantity": "Qty",
      "unitPrice": "Unit Price (¥)",
      "subtotal": "Subtotal (¥)",
      "savePricing": "Save Pricing",
      "exportSingle": "📥 Export",
      "total": "Order Total",
      "unpriced": "Not priced",
      "notPriced": "--",
      "statsPending": "Pending",
      "statsToday": "Today",
      "statsMonth": "This Month"
    },
    "navbar": { "orders": "Orders", "products": "Products", "logout": "Logout" }
  },
  "footer": { "copyright": "© 2026 TricycleParts. All rights reserved." },
  "common": { "confirm": "Confirm", "cancel": "Cancel", "close": "Close" }
}
```

- [ ] **Step 3: Create `src/shared/i18n/locales/ru.json`**

```json
{
  "nav": { "home": "Главная", "history": "История", "cart": "Корзина" },
  "home": {
    "title": "Запчасти для трициклов",
    "subtitle": "Качественные запчасти, комплексные закупки",
    "search": "Поиск запчастей...",
    "allCategories": "Все категории",
    "orderBtn": "Заказать",
    "noProducts": "Нет товаров"
  },
  "order": {
    "title": "Оформление заказа",
    "back": "← На главную",
    "shippingInfo": "Информация о доставке",
    "name": "Получатель",
    "namePlaceholder": "Введите имя получателя",
    "phone": "Телефон",
    "phonePlaceholder": "Введите номер телефона",
    "address": "Адрес доставки",
    "addressPlaceholder": "Область / Город / Район / Улица",
    "productList": "Выбранные товары",
    "addProduct": "+ Добавить товар",
    "submit": "Отправить заказ",
    "submitSuccess": "Заказ отправлен! Ожидайте расчета цены.",
    "validation": { "name": "Введите имя получателя", "phone": "Введите номер телефона", "address": "Введите адрес доставки", "empty": "Выберите хотя бы один товар" }
  },
  "history": {
    "title": "История заказов",
    "count": "{{count}} заказ(ов)",
    "editHint": "Изменения сохраняются и синхронизируются с сервером.",
    "save": "Сохранить",
    "delete": "Удалить заказ",
    "deleteConfirm": "Удалить этот заказ? Действие необратимо.",
    "locked": "Рассчитанные заказы не редактируются",
    "pending": "В ожидании",
    "priced": "Рассчитан",
    "empty": "Заказов пока нет",
    "emptyHint": "Просмотрите товары на главной и оформите первый заказ",
    "all": "Все",
    "filterAll": "Все статусы",
    "filterPending": "В ожидании",
    "filterPriced": "Рассчитан"
  },
  "admin": {
    "login": {
      "title": "Панель управления",
      "account": "Учетная запись",
      "accountPlaceholder": "Введите логин",
      "password": "Пароль",
      "passwordPlaceholder": "Введите пароль",
      "submit": "Войти",
      "footer": "Только для авторизованных администраторов",
      "error": "Неверный логин или пароль"
    },
    "products": {
      "title": "Управление товарами",
      "search": "Поиск товаров...",
      "allCategories": "Все категории",
      "allStatus": "Все статусы",
      "active": "Активные",
      "inactive": "Неактивные",
      "addProduct": "+ Добавить товар",
      "image": "Фото",
      "name": "Название",
      "category": "Категория",
      "specs": "Характеристики",
      "status": "Статус",
      "actions": "Действия",
      "edit": "Ред.",
      "activate": "Актив.",
      "deactivate": "Деактив.",
      "categoryMgmt": "Управление категориями",
      "addCategory": "+ Добавить категорию",
      "activeBadge": "Активен",
      "inactiveBadge": "Неактивен"
    },
    "orders": {
      "title": "Управление заказами",
      "search": "Поиск заказа/клиента...",
      "exportAll": "📥 Экспорт Excel",
      "pending": "В ожидании",
      "priced": "Рассчитан",
      "pricingHint": "Установите цену за единицу для каждого товара. Один товар может иметь разную цену в разных заказах.",
      "product": "Товар",
      "specs": "Хар-ки",
      "quantity": "Кол-во",
      "unitPrice": "Цена (¥)",
      "subtotal": "Сумма (¥)",
      "savePricing": "Сохранить цены",
      "exportSingle": "📥 Экспорт",
      "total": "Итого",
      "unpriced": "Без цены",
      "notPriced": "--",
      "statsPending": "В ожидании",
      "statsToday": "Сегодня",
      "statsMonth": "В этом месяце"
    },
    "navbar": { "orders": "Заказы", "products": "Товары", "logout": "Выход" }
  },
  "footer": { "copyright": "© 2026 TricycleParts. Все права защищены." },
  "common": { "confirm": "Подтвердить", "cancel": "Отмена", "close": "Закрыть" }
}
```

- [ ] **Step 4: Create `src/shared/i18n/index.ts`**

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import zh from './locales/zh.json';
import en from './locales/en.json';
import ru from './locales/ru.json';

i18n.use(initReactI18next).init({
  resources: { zh: { translation: zh }, en: { translation: en }, ru: { translation: ru } },
  lng: 'zh',
  fallbackLng: 'zh',
  interpolation: { escapeValue: false },
});

export default i18n;
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add i18n with zh/en/ru locales"
```

---

### Task 4: Shared UI Components

**Files:**
- Create: `src/shared/components/ui/Button.tsx`
- Create: `src/shared/components/ui/Input.tsx`
- Create: `src/shared/components/ui/Modal.tsx`
- Create: `src/shared/components/ui/Toast.tsx`
- Create: `src/shared/components/ui/Badge.tsx`
- Create: `src/shared/components/ui/EmptyState.tsx`
- Create: `src/shared/components/ui/ConfirmDialog.tsx`

- [ ] **Step 1: Create `src/shared/components/ui/Button.tsx`**

```typescript
import { type ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'outline' | 'danger' | 'ghost';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
  outline: 'bg-white text-primary-600 border-1.5 border-primary-600 hover:bg-primary-50',
  danger: 'bg-white text-red-600 border-1.5 border-red-600 hover:bg-red-50',
  ghost: 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100',
};

export default function Button({ variant = 'primary', className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-semibold rounded-md px-4 py-2 text-sm
        transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
```

- [ ] **Step 2: Create `src/shared/components/ui/Input.tsx`**

```typescript
import { type InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold text-slate-500">{label}</label>}
      <input
        ref={ref}
        className={`w-full px-3 py-2.5 border-1.5 rounded-md text-sm outline-none
          transition-colors duration-150
          ${error ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100 bg-red-50' : 'border-slate-200 focus:border-primary-600 focus:ring-2 focus:ring-primary-100'}
          ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
```

- [ ] **Step 3: Create `src/shared/components/ui/Modal.tsx`**

```typescript
import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[85vh] overflow-auto animate-fade-in">
        {title && (
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-display text-lg text-slate-800">{title}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">&times;</button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `src/shared/components/ui/Toast.tsx`**

```typescript
import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';

interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = nextId++;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map(t => (
          <ToastItem key={t.id} data={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ data, onDismiss }: { data: ToastData; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const colors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  return (
    <div className={`px-4 py-3 rounded-md border text-sm font-medium shadow-lg animate-slide-in ${colors[data.type]}`}>
      {data.message}
    </div>
  );
}
```

- [ ] **Step 5: Create `src/shared/components/ui/Badge.tsx`**

```typescript
interface BadgeProps {
  variant: 'pending' | 'priced' | 'active' | 'inactive';
}

const styles: Record<BadgeProps['variant'], string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  priced: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-red-50 text-red-600 border-red-200',
};

export default function Badge({ variant }: BadgeProps) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-pill text-xs font-semibold border ${styles[variant]}`}>
      {variant === 'pending' && '待核算'}
      {variant === 'priced' && '已核算'}
      {variant === 'active' && '上架'}
      {variant === 'inactive' && '下架'}
    </span>
  );
}
```

- [ ] **Step 6: Create `src/shared/components/ui/EmptyState.tsx`**

```typescript
interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export default function EmptyState({ icon = '📦', title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <p className="text-slate-500 font-medium">{title}</p>
      {description && <p className="text-slate-400 text-sm mt-1">{description}</p>}
    </div>
  );
}
```

- [ ] **Step 7: Create `src/shared/components/ui/ConfirmDialog.tsx`**

```typescript
import Modal from './Modal';
import Button from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmDialog({ open, onClose, onConfirm, title, message }: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-slate-600 text-sm mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onClose}>取消</Button>
        <Button variant="danger" onClick={onConfirm}>确定</Button>
      </div>
    </Modal>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: add shared UI components (Button, Input, Modal, Toast, Badge, EmptyState, ConfirmDialog)"
```

---

### Task 5: Client Layout — Header & Footer

**Files:**
- Create: `src/client/components/Header.tsx`
- Create: `src/client/components/Footer.tsx`

- [ ] **Step 1: Create `src/client/components/Header.tsx`**

```typescript
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  cartCount?: number;
}

export default function Header({ cartCount = 0 }: HeaderProps) {
  const { t } = useTranslation();
  const location = useLocation();

  const linkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      location.pathname === path ? 'text-primary-600' : 'text-slate-500 hover:text-slate-800'
    }`;

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-display text-xl text-slate-800 no-underline">
          TricycleParts
        </Link>
        <nav className="flex items-center gap-6">
          <Link to="/" className={linkClass('/')}>{t('nav.home')}</Link>
          <Link to="/history" className={linkClass('/history')}>{t('nav.history')}</Link>
          <Link to="/order" className="relative">
            <span className="text-lg">🛒</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create `src/client/components/Footer.tsx`**

```typescript
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-800 text-slate-400 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm">
        <p className="font-display text-white text-base mb-1">TricycleParts</p>
        <p>{t('footer.copyright')}</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add client Header and Footer components"
```

---

### Task 6: Client Page 1 — HomePage

**Files:**
- Create: `src/client/pages/HomePage.tsx`
- Modify: `src/client/App.tsx`

- [ ] **Step 1: Create `src/client/pages/HomePage.tsx`**

```typescript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productService } from '../../shared/services';
import type { Product, Category } from '../../shared/types';
import { categoryService } from '../../shared/services';

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    productService.getAll().then(setProducts);
    categoryService.getAll().then(setCategories);
  }, []);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = products.filter(p => {
    if (!p.active) return false;
    const name = p.name.zh;
    if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategories.size > 0 && !selectedCategories.has(p.categoryId)) return false;
    return true;
  });

  const addToOrder = (product: Product) => {
    const existing = JSON.parse(localStorage.getItem('tricycle_cart') || '[]');
    const variant = product.variants[0];
    existing.push({
      productId: product.id,
      variantId: variant?.id || '',
      productName: product.name.zh,
      model: variant?.model || '',
      spec: variant ? `${variant.size} · ${variant.weight}` : '',
      quantity: 1,
    });
    localStorage.setItem('tricycle_cart', JSON.stringify(existing));
    navigate('/order');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-gradient-to-b from-slate-800 to-slate-700 text-white py-16 px-4 text-center">
        <h1 className="font-display text-3xl md:text-4xl mb-2">{t('home.title')}</h1>
        <p className="text-slate-300 text-sm">{t('home.subtitle')}</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 flex-1">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            className="input-field flex-1"
            placeholder={t('home.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`shrink-0 px-4 py-1.5 rounded-pill text-xs font-semibold border transition-colors
                  ${selectedCategories.has(cat.id)
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'}`}
              >
                {cat.icon} {cat.name.zh}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <span className="text-4xl block mb-3">🔧</span>
            <p>{t('home.noProducts')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {filtered.map(product => (
              <div key={product.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-36 bg-slate-100 flex items-center justify-center text-3xl">
                  {product.images[0] ? <img src={product.images[0]} alt={product.name.zh} className="w-full h-full object-cover" /> : '🔧'}
                </div>
                <div className="p-3">
                  <span className="text-xs text-primary-600 font-semibold bg-primary-50 px-2 py-0.5 rounded-pill">
                    {categories.find(c => c.id === product.categoryId)?.name.zh || ''}
                  </span>
                  <h3 className="font-semibold text-slate-800 mt-2 text-sm">{product.name.zh}</h3>
                  {product.variants[0] && (
                    <p className="text-xs text-slate-400 mt-1">
                      {product.variants[0].size} · {product.variants[0].weight}
                    </p>
                  )}
                  <button
                    onClick={() => addToOrder(product)}
                    className="mt-3 w-full py-2 bg-primary-600 text-white text-xs font-semibold rounded-md hover:bg-primary-700 transition-colors"
                  >
                    {t('home.orderBtn')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update `src/client/App.tsx` — add routing to HomePage**

```typescript
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../shared/components/ui/Toast';
import '../shared/i18n';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<HomePage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </ToastProvider>
  );
}
```

- [ ] **Step 3: Verify build and dev server**

Run: `npm run build`
Expected: Build succeeds. Then run `npm run dev` and open `http://localhost:5173` to see homepage.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add client HomePage with product grid, search, and category filter"
```

---

### Task 7: Client Page 2 — OrderPage

**Files:**
- Create: `src/client/pages/OrderPage.tsx`
- Create: `src/client/components/ProductPickerModal.tsx`
- Modify: `src/client/App.tsx`

- [ ] **Step 1: Create `src/client/components/ProductPickerModal.tsx`**

```typescript
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../shared/components/ui/Modal';
import { productService, categoryService } from '../../shared/services';
import type { Product, Category } from '../../shared/types';

interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  model: string;
  spec: string;
  quantity: number;
}

interface ProductPickerModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (item: CartItem) => void;
}

export default function ProductPickerModal({ open, onClose, onAdd }: ProductPickerModalProps) {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    productService.getAll().then(p => setProducts(p.filter(x => x.active)));
    categoryService.getAll().then(setCategories);
  }, []);

  const filtered = products.filter(p => {
    if (!search) return true;
    return p.name.zh.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <Modal open={open} onClose={onClose} title="添加商品">
      <input
        className="input-field mb-4"
        placeholder={t('home.search')}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-3 max-h-80 overflow-auto">
        {filtered.map(product => (
          <div key={product.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-md">
            <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center text-lg shrink-0">
              {product.images[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-cover rounded-md" /> : '🔧'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{product.name.zh}</p>
              <p className="text-xs text-slate-400 truncate">
                {categories.find(c => c.id === product.categoryId)?.name.zh || ''}
              </p>
            </div>
            <button
              onClick={() => {
                const v = product.variants[0];
                onAdd({
                  productId: product.id,
                  variantId: v?.id || '',
                  productName: product.name.zh,
                  model: v?.model || '',
                  spec: v ? `${v.size} · ${v.weight}` : '',
                  quantity: 1,
                });
              }}
              className="shrink-0 w-7 h-7 rounded-full bg-primary-600 text-white text-lg flex items-center justify-center hover:bg-primary-700 transition-colors leading-none"
            >
              +
            </button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
```

- [ ] **Step 2: Create `src/client/pages/OrderPage.tsx`**

```typescript
import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../shared/components/ui/Toast';
import { orderService } from '../../shared/services';
import { getShippingMemory, setShippingMemory } from '../../shared/services/localStorage';
import type { OrderItem } from '../../shared/types';
import ProductPickerModal from '../components/ProductPickerModal';

interface CartItem extends OrderItem {}

export default function OrderPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const savedShipping = getShippingMemory();

  const [name, setName] = useState(savedShipping?.name || '');
  const [phone, setPhone] = useState(savedShipping?.phone || '');
  const [address, setAddress] = useState(savedShipping?.address || '');
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('tricycle_cart') || '[]'); }
    catch { return []; }
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateQuantity = (idx: number, delta: number) => {
    setItems(prev => prev.map((item, i) =>
      i === idx ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    ));
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const addItem = (item: CartItem) => {
    setItems(prev => [...prev, item]);
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = t('order.validation.name');
    if (!phone.trim()) newErrors.phone = t('order.validation.phone');
    if (!address.trim()) newErrors.address = t('order.validation.address');
    if (items.length === 0) newErrors.empty = t('order.validation.empty');
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setShippingMemory({ name, phone, address });

    const now = new Date();
    const orderNumber = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

    await orderService.create({
      id: crypto.randomUUID(),
      orderNumber,
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      items: items.map(i => ({ ...i, unitPrice: undefined })),
      status: 'pending',
      createdAt: new Date().toISOString(),
    });

    localStorage.removeItem('tricycle_cart');
    toast(t('order.submitSuccess'));
    navigate('/history');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 flex-1">
      <Link to="/" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">{t('order.back')}</Link>
      <h1 className="font-display text-2xl text-slate-800 mt-2 mb-6">{t('order.title')}</h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Shipping info */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h2 className="font-display text-lg text-slate-800 mb-4">{t('order.shippingInfo')}</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500">{t('order.name')}</label>
              <input className="input-field mt-1" placeholder={t('order.namePlaceholder')} value={name} onChange={e => setName(e.target.value)} />
              {errors.name && <span className="text-xs text-red-500">{errors.name}</span>}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">{t('order.phone')}</label>
              <input className="input-field mt-1" placeholder={t('order.phonePlaceholder')} value={phone} onChange={e => setPhone(e.target.value)} />
              {errors.phone && <span className="text-xs text-red-500">{errors.phone}</span>}
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">{t('order.address')}</label>
              <textarea className="input-field mt-1" rows={3} placeholder={t('order.addressPlaceholder')} value={address} onChange={e => setAddress(e.target.value)} />
              {errors.address && <span className="text-xs text-red-500">{errors.address}</span>}
            </div>
          </div>
        </div>

        {/* Product list */}
        <div className="bg-white rounded-lg border border-slate-200 p-5">
          <h2 className="font-display text-lg text-slate-800 mb-4">{t('order.productList')}</h2>
          {errors.empty && <span className="text-xs text-red-500">{errors.empty}</span>}
          {items.length === 0 ? (
            <p className="text-slate-400 text-sm py-6 text-center">暂无已选商品</p>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.productName}</p>
                    <p className="text-xs text-slate-400">{item.spec}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(idx, -1)} className="w-7 h-7 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm">−</button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(idx, 1)} className="w-7 h-7 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm">+</button>
                    <button onClick={() => removeItem(idx)} className="ml-2 text-red-400 hover:text-red-600 text-sm">🗑</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setPickerOpen(true)} className="mt-4 text-sm text-primary-600 font-semibold hover:text-primary-700">
            {t('order.addProduct')}
          </button>
        </div>
      </div>

      <button onClick={handleSubmit} className="w-full mt-6 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors text-sm">
        {t('order.submit')}
      </button>

      <ProductPickerModal open={pickerOpen} onClose={() => setPickerOpen(false)} onAdd={addItem} />
    </div>
  );
}
```

- [ ] **Step 3: Update `src/client/App.tsx` — add OrderPage route**

Add import and route:
```typescript
import OrderPage from './pages/OrderPage';
// Inside Routes, add:
<Route path="/order" element={<OrderPage />} />
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add client OrderPage with shipping form and product picker modal"
```

---

### Task 8: Client Page 3 — OrderHistory

**Files:**
- Create: `src/client/pages/OrderHistory.tsx`
- Modify: `src/client/App.tsx`

- [ ] **Step 1: Create `src/client/pages/OrderHistory.tsx`**

```typescript
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { orderService } from '../../shared/services';
import type { Order, OrderStatus } from '../../shared/types';
import ConfirmDialog from '../../shared/components/ui/ConfirmDialog';
import { useToast } from '../../shared/components/ui/Toast';

export default function OrderHistory() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = () => { orderService.getAll().then(setOrders); };
  useEffect(load, []);

  const HOURS_24 = 24 * 60 * 60 * 1000;

  const isLocked = (order: Order) => {
    if (order.status === 'priced') return true;
    return Date.now() - new Date(order.createdAt).getTime() > HOURS_24;
  };

  const filtered = orders
    .filter(o => filter === 'all' || o.status === filter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const saveQuantity = async (order: Order, idx: number, qty: number) => {
    const items = [...order.items];
    items[idx] = { ...items[idx], quantity: Math.max(1, qty) };
    await orderService.update(order.id, { items });
    toast('数量已更新');
    load();
  };

  const deleteOrder = async () => {
    if (!deleteId) return;
    await orderService.remove(deleteId);
    setDeleteId(null);
    toast('订单已删除');
    load();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex-1">
      <h1 className="font-display text-2xl text-slate-800 mb-1">{t('history.title')}</h1>
      <p className="text-xs text-slate-400 mb-4">{t('history.count', { count: orders.length })}</p>

      <div className="flex gap-2 mb-5">
        {(['all', 'pending', 'priced'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-pill text-xs font-semibold transition-colors
              ${filter === s ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'}`}
          >
            {s === 'all' ? t('history.filterAll') : s === 'pending' ? t('history.filterPending') : t('history.filterPriced')}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <span className="text-4xl block mb-3">📋</span>
          <p className="text-slate-500 font-medium">{t('history.empty')}</p>
          <p className="text-slate-400 text-sm mt-1">{t('history.emptyHint')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(order => {
            const locked = isLocked(order);
            return (
              <div key={order.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="flex justify-between items-center px-5 py-3 border-b border-slate-100">
                  <div>
                    <span className="font-bold text-slate-800">订单 #{order.orderNumber}</span>
                    <span className="text-xs text-slate-400 ml-3">{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
                  </div>
                  <span className={`inline-block px-2.5 py-0.5 rounded-pill text-xs font-semibold border
                    ${order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    {order.status === 'pending' ? t('history.pending') : t('history.priced')}
                  </span>
                </div>

                <div className="px-5 py-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2">
                      <div>
                        <span className="font-semibold text-slate-800 text-sm">{item.productName}</span>
                        <span className="text-xs text-slate-400 ml-2">{item.spec}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400">×</span>
                        {locked ? (
                          <span className="font-semibold text-sm w-8 text-center">{item.quantity}</span>
                        ) : (
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={e => saveQuantity(order, idx, parseInt(e.target.value) || 1)}
                            className="w-12 px-1 py-1 text-center border border-slate-200 rounded-md text-sm font-semibold outline-none focus:border-primary-400"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="bg-slate-50 rounded-md px-3 py-2 mt-2 text-xs text-slate-500 flex gap-4">
                    <span>📦 {order.customerName}</span>
                    <span>📞 {order.customerPhone}</span>
                    <span className="truncate">📍 {order.customerAddress}</span>
                  </div>
                </div>

                <div className="px-5 py-3 border-t border-slate-100 flex justify-end gap-2">
                  {locked ? (
                    <div className="bg-yellow-50 rounded-md px-3 py-1.5 text-xs text-yellow-700">🔒 {t('history.locked')}</div>
                  ) : (
                    <>
                      <button onClick={() => deleteId ? null : setDeleteId(order.id)}
                        className="text-xs font-semibold text-red-500 hover:text-red-700 px-3 py-1.5 border border-red-200 rounded-md hover:bg-red-50 transition-colors">
                        {t('history.delete')}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={deleteOrder}
        title={t('history.delete')}
        message={t('history.deleteConfirm')}
      />
    </div>
  );
}
```

- [ ] **Step 2: Update `src/client/App.tsx` — add OrderHistory route**

Add import and route:
```typescript
import OrderHistory from './pages/OrderHistory';
// Inside Routes, add:
<Route path="/history" element={<OrderHistory />} />
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add client OrderHistory with filter, edit, and delete"
```

---

### Task 9: Admin Layout & LoginPage

**Files:**
- Create: `src/admin/components/AdminLayout.tsx`
- Create: `src/admin/pages/LoginPage.tsx`
- Modify: `src/admin/App.tsx`

- [ ] **Step 1: Create `src/admin/components/AdminLayout.tsx`**

```typescript
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../shared/services';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const linkClass = (path: string) =>
    `text-sm font-medium transition-colors ${
      location.hash.includes(path) ? 'text-white' : 'text-slate-400 hover:text-white'
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-800 px-6 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <span className="font-display text-lg text-white font-bold">后台管理</span>
          <span className="text-slate-600 text-xs">|</span>
          <NavLink to="/orders" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
            {t('admin.navbar.orders')}
          </NavLink>
          <NavLink to="/products" className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
            {t('admin.navbar.products')}
          </NavLink>
        </div>
        <button onClick={handleLogout} className="text-xs text-slate-400 hover:text-white border border-slate-600 rounded-md px-3 py-1.5 transition-colors">
          {t('admin.navbar.logout')}
        </button>
      </header>
      <main className="flex-1 bg-slate-50">{children}</main>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/admin/pages/LoginPage.tsx`**

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authService } from '../../shared/services';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const ok = await authService.login(account, password);
    if (ok) {
      navigate('/orders');
    } else {
      setError(t('admin.login.error'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg border border-slate-200 p-10 w-full max-w-sm shadow-sm">
        <div className="text-center mb-8">
          <div className="font-display text-2xl text-slate-800 font-bold mb-1">TricycleParts</div>
          <div className="text-xs text-slate-400">{t('admin.login.title')}</div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">{t('admin.login.account')}</label>
            <input
              className="input-field mt-1"
              placeholder={t('admin.login.accountPlaceholder')}
              value={account}
              onChange={e => setAccount(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">{t('admin.login.password')}</label>
            <input
              type="password"
              className="input-field mt-1"
              placeholder={t('admin.login.passwordPlaceholder')}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button onClick={handleLogin} className="w-full py-3 bg-primary-600 text-white font-bold rounded-md hover:bg-primary-700 transition-colors text-sm">
            {t('admin.login.submit')}
          </button>
        </div>

        <p className="text-center text-xs text-slate-300 mt-6 pt-4 border-t border-slate-50">
          {t('admin.login.footer')}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update `src/admin/App.tsx` — full admin routing**

```typescript
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from '../shared/components/ui/Toast';
import '../shared/i18n';
import { authService } from '../shared/services';
import AdminLayout from './components/AdminLayout';
import LoginPage from './pages/LoginPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!authService.isLoggedIn()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <ToastProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <AdminLayout>
                <div className="p-6 text-center text-slate-400">选择上方标签进入管理页面</div>
              </AdminLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add admin login page and protected layout"
```

---

### Task 10: Admin Page 5A — ProductManager

**Files:**
- Create: `src/admin/pages/ProductManager.tsx`
- Modify: `src/admin/App.tsx`

- [ ] **Step 1: Create `src/admin/pages/ProductManager.tsx`**

```typescript
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { productService, categoryService } from '../../shared/services';
import type { Product, Category, LocalizedString } from '../../shared/types';
import Modal from '../../shared/components/ui/Modal';
import { useToast } from '../../shared/components/ui/Toast';

const emptyName: LocalizedString = { zh: '', en: '', ru: '' };

export default function ProductManager() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const [form, setForm] = useState({
    nameZh: '', nameEn: '', nameRu: '',
    descZh: '', descEn: '', descRu: '',
    categoryId: '', imageUrl: '', model: '', size: '', weight: '',
  });

  useEffect(() => {
    productService.getAll().then(setProducts);
    categoryService.getAll().then(setCategories);
  }, []);

  const resetForm = () => {
    setForm({ nameZh: '', nameEn: '', nameRu: '', descZh: '', descEn: '', descRu: '', categoryId: '', imageUrl: '', model: '', size: '', weight: '' });
    setEditing(null);
  };

  const openNew = () => { resetForm(); setShowForm(true); };
  const openEdit = (p: Product) => {
    setForm({
      nameZh: p.name.zh, nameEn: p.name.en, nameRu: p.name.ru,
      descZh: p.description.zh, descEn: p.description.en, descRu: p.description.ru,
      categoryId: p.categoryId, imageUrl: p.images[0] || '', model: p.variants[0]?.model || '', size: p.variants[0]?.size || '', weight: p.variants[0]?.weight || '',
    });
    setEditing(p);
    setShowForm(true);
  };

  const save = async () => {
    const variantId = editing?.variants[0]?.id || crypto.randomUUID();
    const data: Product = {
      id: editing?.id || crypto.randomUUID(),
      name: { zh: form.nameZh, en: form.nameEn, ru: form.nameRu },
      description: { zh: form.descZh, en: form.descEn, ru: form.descRu },
      categoryId: form.categoryId,
      images: form.imageUrl ? [form.imageUrl] : [],
      variants: [{ id: variantId, model: form.model, size: form.size, weight: form.weight }],
      active: editing?.active ?? true,
      createdAt: editing?.createdAt || new Date().toISOString(),
    };
    if (editing) {
      await productService.update(editing.id, data);
    } else {
      await productService.create(data);
    }
    setShowForm(false);
    resetForm();
    productService.getAll().then(setProducts);
    toast(editing ? '商品已更新' : '商品已添加');
  };

  const toggleActive = async (p: Product) => {
    await productService.update(p.id, { active: !p.active });
    productService.getAll().then(setProducts);
  };

  const addCategory = async () => {
    if (!newCatName.trim()) return;
    await categoryService.create({
      id: crypto.randomUUID(),
      name: { zh: newCatName, en: newCatName, ru: newCatName },
      icon: '📦',
      sortOrder: categories.length,
    });
    setNewCatName('');
    categoryService.getAll().then(setCategories);
  };

  const removeCategory = async (id: string) => {
    await categoryService.remove(id);
    categoryService.getAll().then(setCategories);
  };

  const filtered = products.filter(p => {
    if (search && !p.name.zh.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCat !== 'all' && p.categoryId !== filterCat) return false;
    if (filterStatus === 'active' && !p.active) return false;
    if (filterStatus === 'inactive' && p.active) return false;
    return true;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          <input className="input-field w-48" placeholder={t('admin.products.search')} value={search} onChange={e => setSearch(e.target.value)} />
          <select className="input-field w-32" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="all">{t('admin.products.allCategories')}</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name.zh}</option>)}
          </select>
          <select className="input-field w-28" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">{t('admin.products.allStatus')}</option>
            <option value="active">{t('admin.products.active')}</option>
            <option value="inactive">{t('admin.products.inactive')}</option>
          </select>
        </div>
        <button onClick={openNew} className="px-4 py-2.5 bg-primary-600 text-white text-xs font-bold rounded-md hover:bg-primary-700 transition-colors">
          {t('admin.products.addProduct')}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">{t('admin.products.image')}</th>
              <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">{t('admin.products.name')}</th>
              <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">{t('admin.products.category')}</th>
              <th className="text-left px-4 py-3 text-xs text-slate-400 font-semibold">{t('admin.products.specs')}</th>
              <th className="text-center px-4 py-3 text-xs text-slate-400 font-semibold">{t('admin.products.status')}</th>
              <th className="text-center px-4 py-3 text-xs text-slate-400 font-semibold">{t('admin.products.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center text-lg">
                    {p.images[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover rounded-md" /> : '🔧'}
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800">{p.name.zh}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{categories.find(c => c.id === p.categoryId)?.name.zh || ''}</td>
                <td className="px-4 py-3 text-xs text-slate-500">{p.variants[0] ? `${p.variants[0].size} · ${p.variants[0].weight}` : ''}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-pill text-xs font-semibold border ${p.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {p.active ? t('admin.products.activeBadge') : t('admin.products.inactiveBadge')}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex gap-1.5 justify-center">
                    <button onClick={() => openEdit(p)} className="px-2.5 py-1 text-xs text-primary-600 border border-slate-200 rounded-md hover:bg-slate-50">{t('admin.products.edit')}</button>
                    <button onClick={() => toggleActive(p)} className={`px-2.5 py-1 text-xs border rounded-md hover:bg-slate-50 ${p.active ? 'text-red-500 border-slate-200' : 'text-emerald-600 border-slate-200'}`}>
                      {p.active ? t('admin.products.deactivate') : t('admin.products.activate')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Category management */}
      <div className="mt-6 bg-white rounded-lg border border-slate-200 p-4">
        <h3 className="font-display text-base text-slate-800 mb-3">{t('admin.products.categoryMgmt')}</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {categories.map(c => (
            <span key={c.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-pill text-xs font-medium text-slate-600">
              {c.icon} {c.name.zh}
              <button onClick={() => removeCategory(c.id)} className="text-slate-400 hover:text-red-500 ml-0.5">&times;</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input className="input-field w-48" placeholder={t('admin.products.addCategory')} value={newCatName} onChange={e => setNewCatName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()} />
          <button onClick={addCategory} className="px-3 py-2 text-xs font-semibold text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50">{t('admin.products.addCategory')}</button>
        </div>
      </div>

      {/* Product form modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? t('admin.products.edit') : t('admin.products.addProduct')}>
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-3 gap-2">
            <div><label className="text-xs text-slate-500">名称 (中文)</label><input className="input-field mt-0.5" value={form.nameZh} onChange={e => setForm({...form, nameZh: e.target.value})} /></div>
            <div><label className="text-xs text-slate-500">名称 (英文)</label><input className="input-field mt-0.5" value={form.nameEn} onChange={e => setForm({...form, nameEn: e.target.value})} /></div>
            <div><label className="text-xs text-slate-500">名称 (俄文)</label><input className="input-field mt-0.5" value={form.nameRu} onChange={e => setForm({...form, nameRu: e.target.value})} /></div>
          </div>
          <div>
            <label className="text-xs text-slate-500">分类</label>
            <select className="input-field mt-0.5" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
              <option value="">请选择</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name.zh}</option>)}
            </select>
          </div>
          <div><label className="text-xs text-slate-500">图片URL</label><input className="input-field mt-0.5" placeholder="https://..." value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} /></div>
          <div className="grid grid-cols-3 gap-2">
            <div><label className="text-xs text-slate-500">型号</label><input className="input-field mt-0.5" value={form.model} onChange={e => setForm({...form, model: e.target.value})} /></div>
            <div><label className="text-xs text-slate-500">尺寸</label><input className="input-field mt-0.5" value={form.size} onChange={e => setForm({...form, size: e.target.value})} /></div>
            <div><label className="text-xs text-slate-500">重量</label><input className="input-field mt-0.5" value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} /></div>
          </div>
          <div className="flex justify-end gap-2 mt-3">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 text-xs font-semibold text-slate-500 border border-slate-200 rounded-md hover:bg-slate-50">取消</button>
            <button onClick={save} className="px-4 py-2 text-xs font-semibold text-white bg-primary-600 rounded-md hover:bg-primary-700">保存</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
```

- [ ] **Step 2: Update `src/admin/App.tsx` — add ProductManager route**

Add import:
```typescript
import ProductManager from './pages/ProductManager';
```
Replace the catch-all route placeholder with:
```typescript
<Route path="/products" element={<AdminLayout><ProductManager /></AdminLayout>} />
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add admin ProductManager with CRUD and category management"
```

---

### Task 11: Admin Page 5B — OrderManager

**Files:**
- Create: `src/admin/pages/OrderManager.tsx`
- Modify: `src/admin/App.tsx`

- [ ] **Step 1: Create `src/admin/pages/OrderManager.tsx`**

```typescript
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { orderService } from '../../shared/services';
import type { Order, OrderItem } from '../../shared/types';
import { useToast } from '../../shared/components/ui/Toast';
import * as XLSX from 'xlsx';

export default function OrderManager() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pricingInputs, setPricingInputs] = useState<Record<string, string>>({});

  const load = () => { orderService.getAll().then(setOrders); };
  useEffect(load, []);

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const thisMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    return {
      pending: orders.filter(o => o.status === 'pending').length,
      today: orders.filter(o => new Date(o.createdAt).toDateString() === today).length,
      month: orders.filter(o => o.createdAt.startsWith(thisMonth)).length,
    };
  }, [orders]);

  const filtered = orders
    .filter(o => {
      if (filter === 'pending' && o.status !== 'pending') return false;
      if (filter === 'priced' && o.status !== 'priced') return false;
      if (search) {
        const q = search.toLowerCase();
        return o.orderNumber.includes(q) || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q);
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const expanded = expandedId ? orders.find(o => o.id === expandedId) : null;

  const expandOrder = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setPricingInputs({});
  };

  const setPriceInput = (itemIdx: number, value: string) => {
    setPricingInputs(prev => ({ ...prev, [itemIdx]: value }));
  };

  const getPriceInputValue = (item: OrderItem, idx: number): string => {
    if (pricingInputs[idx] !== undefined) return pricingInputs[idx];
    return item.unitPrice !== undefined ? String(item.unitPrice) : '';
  };

  const savePricing = async () => {
    if (!expanded) return;
    const items = expanded.items.map((item, idx) => {
      const inputVal = getPriceInputValue(item, idx);
      return { ...item, unitPrice: inputVal ? parseFloat(inputVal) : undefined };
    });
    const allPriced = items.every(i => i.unitPrice !== undefined && !isNaN(i.unitPrice));
    await orderService.update(expanded.id, { items, status: allPriced ? 'priced' : 'pending' });
    toast('定价已保存');
    load();
    setExpandedId(null);
  };

  const exportSingle = (order: Order) => {
    const data = order.items.map(item => ({
      '商品': item.productName,
      '规格': item.spec,
      '数量': item.quantity,
      '单价': item.unitPrice ?? '-',
      '小计': item.unitPrice ? item.unitPrice * item.quantity : '-',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, order.orderNumber);
    XLSX.writeFile(wb, `${order.orderNumber}.xlsx`);
  };

  const exportAll = () => {
    const data = orders.map(o => ({
      '订单号': o.orderNumber,
      '客户': o.customerName,
      '电话': o.customerPhone,
      '地址': o.customerAddress,
      '商品': o.items.map(i => `${i.productName} ×${i.quantity}`).join('; '),
      '总价': o.items.reduce((sum, i) => sum + (i.unitPrice || 0) * i.quantity, 0) || '-',
      '状态': o.status === 'pending' ? '待核算' : '已核算',
      '日期': new Date(o.createdAt).toLocaleDateString('zh-CN'),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '订单');
    XLSX.writeFile(wb, `订单导出_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const orderTotal = (items: OrderItem[]) => {
    return items.reduce((sum, item, idx) => {
      const inputVal = getPriceInputValue(item, idx);
      const price = inputVal ? parseFloat(inputVal) : item.unitPrice;
      return sum + (price && !isNaN(price) ? price * item.quantity : 0);
    }, 0);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: t('admin.orders.statsPending'), value: stats.pending, color: 'bg-yellow-50 border-yellow-200' },
          { label: t('admin.orders.statsToday'), value: stats.today, color: 'bg-blue-50 border-blue-200' },
          { label: t('admin.orders.statsMonth'), value: stats.month, color: 'bg-emerald-50 border-emerald-200' },
        ].map((s, i) => (
          <div key={i} className={`rounded-lg border ${s.color} p-4`}>
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
        <div className="flex gap-2 flex-wrap">
          <input className="input-field w-48" placeholder={t('admin.orders.search')} value={search} onChange={e => setSearch(e.target.value)} />
          <select className="input-field w-28" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">{t('admin.products.allStatus')}</option>
            <option value="pending">{t('admin.orders.pending')}</option>
            <option value="priced">{t('admin.orders.priced')}</option>
          </select>
        </div>
        <button onClick={exportAll} className="px-4 py-2.5 bg-cyan-600 text-white text-xs font-bold rounded-md hover:bg-cyan-700 transition-colors">
          {t('admin.orders.exportAll')}
        </button>
      </div>

      {/* Order list */}
      <div className="flex flex-col gap-3">
        {filtered.map(order => (
          <div key={order.id} className={`bg-white rounded-lg border-2 overflow-hidden transition-colors ${expandedId === order.id ? 'border-primary-600' : 'border-slate-200'}`}>
            {/* Collapsed row */}
            <div className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-slate-50" onClick={() => expandOrder(order.id)}>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-bold text-slate-800">{order.orderNumber}</span>
                <span className="text-xs text-slate-500">📦 {order.customerName}</span>
                <span className="text-xs text-slate-500 hidden sm:inline">📞 {order.customerPhone}</span>
                <span className="text-xs text-slate-400 hidden md:inline truncate max-w-[200px]">📍 {order.customerAddress}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-800 text-sm">
                  {order.items.some(i => i.unitPrice !== undefined)
                    ? `¥ ${order.items.reduce((s, i) => s + (i.unitPrice || 0) * i.quantity, 0).toFixed(2)}`
                    : '¥ --'}
                </span>
                <span className={`inline-block px-2.5 py-0.5 rounded-pill text-xs font-semibold border ${order.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {order.status === 'pending' ? t('admin.orders.pending') : t('admin.orders.priced')}
                </span>
                <span className="text-slate-400 text-sm">{expandedId === order.id ? '▼' : '▶'}</span>
              </div>
            </div>

            {/* Expanded detail */}
            {expandedId === order.id && (
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
                <div className="bg-yellow-50 rounded-md px-4 py-2.5 text-xs text-yellow-700 mb-4 flex items-center gap-2">
                  💡 {t('admin.orders.pricingHint')}
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left px-2 py-2 text-xs text-slate-400 font-semibold">{t('admin.orders.product')}</th>
                      <th className="text-left px-2 py-2 text-xs text-slate-400 font-semibold">{t('admin.orders.specs')}</th>
                      <th className="text-center px-2 py-2 text-xs text-slate-400 font-semibold">{t('admin.orders.quantity')}</th>
                      <th className="text-right px-2 py-2 text-xs text-slate-400 font-semibold">{t('admin.orders.unitPrice')}</th>
                      <th className="text-right px-2 py-2 text-xs text-slate-400 font-semibold">{t('admin.orders.subtotal')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, idx) => {
                      const inputVal = getPriceInputValue(item, idx);
                      const price = inputVal ? parseFloat(inputVal) : item.unitPrice;
                      const subtotal = price && !isNaN(price) ? price * item.quantity : null;
                      const isUnpriced = !inputVal && item.unitPrice === undefined;
                      return (
                        <tr key={idx} className="border-b border-slate-100 last:border-0">
                          <td className="px-2 py-2.5 font-semibold text-slate-800">{item.productName}</td>
                          <td className="px-2 py-2.5 text-xs text-slate-500">{item.spec}</td>
                          <td className="px-2 py-2.5 text-center font-semibold">{item.quantity}</td>
                          <td className="px-2 py-2.5 text-right">
                            <input
                              value={inputVal}
                              placeholder={t('admin.orders.unpriced')}
                              onChange={e => setPriceInput(idx, e.target.value)}
                              className={`w-20 px-2 py-1.5 text-right border-1.5 rounded-md text-sm font-semibold outline-none
                                ${isUnpriced ? 'border-red-300 bg-red-50 focus:border-red-400' : 'border-slate-200 focus:border-primary-400'}`}
                            />
                          </td>
                          <td className="px-2 py-2.5 text-right font-bold text-slate-800">{subtotal !== null ? subtotal.toFixed(2) : '--'}</td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan={3}></td>
                      <td className="px-2 py-3 text-right font-bold text-sm">{t('admin.orders.total')}</td>
                      <td className="px-2 py-3 text-right font-extrabold text-base text-primary-600">¥ {orderTotal(order.items).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={savePricing} className="px-4 py-2 text-xs font-semibold text-primary-600 border-1.5 border-primary-600 rounded-md hover:bg-primary-50 transition-colors">
                    {t('admin.orders.savePricing')}
                  </button>
                  <button onClick={() => exportSingle(order)} className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 transition-colors">
                    {t('admin.orders.exportSingle')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update `src/admin/App.tsx` — add OrderManager route**

Add import:
```typescript
import OrderManager from './pages/OrderManager';
```
Add route (inside ProtectedRoute, alongside products):
```typescript
<Route path="/orders" element={<AdminLayout><OrderManager /></AdminLayout>} />
```

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat: add admin OrderManager with per-order pricing and Excel export"
```

---

### Task 12: Seed Data & Final Verification

**Files:**
- Create: `src/shared/services/seed.ts`
- Modify: `src/client/App.tsx`
- Modify: `src/admin/App.tsx`

- [ ] **Step 1: Create `src/shared/services/seed.ts`**

```typescript
import { productService, categoryService } from './index';
import type { Category, Product } from '../types';

const categories: Category[] = [
  { id: 'cat-1', name: { zh: '车架/车斗', en: 'Frame/Body', ru: 'Рама/Кузов' }, icon: '🔩', sortOrder: 1 },
  { id: 'cat-2', name: { zh: '车轮/轮胎', en: 'Wheels/Tires', ru: 'Колеса/Шины' }, icon: '🛞', sortOrder: 2 },
  { id: 'cat-3', name: { zh: '刹车系统', en: 'Brake System', ru: 'Тормозная система' }, icon: '🛑', sortOrder: 3 },
  { id: 'cat-4', name: { zh: '传动系统', en: 'Drivetrain', ru: 'Трансмиссия' }, icon: '⚙️', sortOrder: 4 },
  { id: 'cat-5', name: { zh: '电气系统', en: 'Electrical', ru: 'Электрика' }, icon: '🔌', sortOrder: 5 },
];

const products: Product[] = [
  {
    id: 'prod-1', name: { zh: '前叉总成', en: 'Front Fork Assembly', ru: 'Вилка в сборе' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-1', images: [], variants: [{ id: 'v1', model: '标准型', size: '32mm', weight: '2.4kg' }],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-2', name: { zh: '后轮毂总成', en: 'Rear Hub Assembly', ru: 'Задняя ступица' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-2', images: [], variants: [{ id: 'v2', model: '标准型', size: '16寸', weight: '3.1kg' }],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-3', name: { zh: '刹车蹄总成', en: 'Brake Shoe Assembly', ru: 'Тормозные колодки' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-3', images: [], variants: [{ id: 'v3', model: '标准型', size: '130mm', weight: '0.8kg' }],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-4', name: { zh: '差速器总成', en: 'Differential Assembly', ru: 'Дифференциал' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-4', images: [], variants: [{ id: 'v4', model: '18齿', size: '标准', weight: '4.2kg' }],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-5', name: { zh: 'LED大灯总成', en: 'LED Headlight', ru: 'Светодиодная фара' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-5', images: [], variants: [{ id: 'v5', model: '12V', size: '7寸', weight: '0.6kg' }],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-6', name: { zh: '车架主梁', en: 'Main Frame Beam', ru: 'Главная балка рамы' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-1', images: [], variants: [{ id: 'v6', model: '加厚型', size: '2.5m', weight: '15.0kg' }],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-7', name: { zh: '轮胎内胎', en: 'Inner Tube', ru: 'Камера' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-2', images: [], variants: [{ id: 'v7', model: '标准型', size: '3.00-12', weight: '0.5kg' }],
    active: true, createdAt: new Date().toISOString(),
  },
  {
    id: 'prod-8', name: { zh: '离合器片', en: 'Clutch Plate', ru: 'Диск сцепления' },
    description: { zh: '', en: '', ru: '' },
    categoryId: 'cat-4', images: [], variants: [{ id: 'v8', model: '标准型', size: '150mm', weight: '1.2kg' }],
    active: true, createdAt: new Date().toISOString(),
  },
];

export async function seedIfEmpty() {
  const cats = await categoryService.getAll();
  if (cats.length === 0) {
    for (const c of categories) { await categoryService.create(c); }
  }
  const prods = await productService.getAll();
  if (prods.length === 0) {
    for (const p of products) { await productService.create(p); }
  }
}
```

- [ ] **Step 2: Call `seedIfEmpty()` in both App.tsx files**

In `src/client/App.tsx`, add inside the component:
```typescript
import { useEffect } from 'react';
import { seedIfEmpty } from '../shared/services/seed';

// Inside App():
useEffect(() => { seedIfEmpty(); }, []);
```

Same for `src/admin/App.tsx`.

- [ ] **Step 3: Final build and dev check**

Run: `npm run build`
Expected: Clean build, no errors.

Run: `npm run dev`
Expected: 
- `http://localhost:5173` → Client app with product listing
- `http://localhost:5173/admin.html` → Admin login page
- Login with admin/123456 → OrderManager/ProductManager

- [ ] **Step 4: Final commit**

```bash
git add -A && git commit -m "feat: add seed data and wire up both SPAs"
```

---

