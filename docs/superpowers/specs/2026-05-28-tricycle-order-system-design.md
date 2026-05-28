# 三轮车配件订货系统 — 设计规范

Date: 2026-05-28
Status: Approved

## Overview

A dual-entry frontend application for tricycle parts wholesale ordering. Clients browse products and submit orders without seeing prices. Admins manage products and set per-order pricing in a separate backend panel. Backend integration is planned but not yet implemented — the data layer is designed for easy API swap.

## Architecture

```
项目/
├── index.html              # Client entry
├── admin.html              # Admin entry
├── src/
│   ├── client/             # Client SPA
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── HomePage         # Page 1: Product listing
│   │   │   ├── OrderPage        # Page 2: Order submission
│   │   │   └── OrderHistory     # Page 3: Order history
│   │   └── components/
│   ├── admin/              # Admin SPA
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── LoginPage        # Page 4: Admin login
│   │   │   ├── OrderManager     # Page 5B: Order management
│   │   │   └── ProductManager   # Page 5A: Product management
│   │   └── components/
│   └── shared/             # Shared modules
│       ├── types/          # Type definitions
│       ├── services/       # Data layer (localStorage → API later)
│       ├── components/ui/  # Common UI components
│       └── i18n/           # Internationalization (zh/en/ru)
```

- **Client entry (`index.html`)**: Routes: `/` (Home), `/order` (Order), `/history` (History)
- **Admin entry (`admin.html`)**: Routes: `/login` (Login), `/orders` (OrderManager), `/products` (ProductManager)
- Both share `src/shared/` for types, services, and UI components
- Data layer uses service interfaces — current implementation is localStorage, future swap to REST API

## Core Business Logic

- **Client flow**: Browse products → Select variant → Enter shipping info → Submit order
- **No prices visible** on client side
- **No payment flow** — offline settlement
- **Admin sets per-order pricing**: Same product can have different prices in different orders
- **Admin flow**: Login → Manage products (CRUD, listing control) → Review orders → Set per-item prices → Export

## Design System

- **Style direction**: Clean modern
- **Primary color**: Blue 600 (#2563eb) — buttons, links, emphasis
- **Secondary color**: Cyan 600 (#0891b2) — export actions, auxiliary highlights
- **Text**: Slate 900 (#1e293b) for headings, Slate 500/600 for body
- **Background**: Slate 50 (#f8fafc)
- **Danger**: Red 600 (#dc2626) — delete, remove
- **Display font**: DM Serif Display — brand name, page titles
- **Body font**: DM Sans — all other text, forms, tables
- **Border radius**: 6px (small), 10px (medium), 14px (large), 999px (pills)
- **Spacing**: 4px base unit (2, 3, 4, 6, 8, 12)
- **Tailwind CSS** for styling with custom theme config

## Page Specifications

### Page 1: HomePage (Client)

**Route**: `/`
**Purpose**: Product browsing and discovery

- **Header**: Brand logo (DM Serif Display), nav links (Home, Order History), cart icon with badge count
- **Hero**: Dark gradient background (#1e293b → #334155), page title, subtitle
- **Search bar**: Text input with placeholder "搜索配件名称..."
- **Category filter**: Horizontal scrollable pill tags, multi-select behavior
- **Product grid**: Responsive cards (auto-fill, min 200px)
  - Card content: image placeholder, category badge, product name, specs (size/weight), "订购" button
  - NO price display
- **Interaction**: Click "订购" → add product to selection → navigate to `/order`
- **Footer**: Copyright, company name

### Page 2: OrderPage (Client)

**Route**: `/order`
**Purpose**: Core order submission page

- **Back link**: "← 返回首页"
- **Shipping info section**:
  - 收货人姓名 (required text input)
  - 联系电话 (required text input)
  - 详细收货地址 (required textarea: province/city/district/street)
  - Client-side validation on submit
- **Product selection section**:
  - List of selected products, each row: product name, specs, quantity (+/− buttons), remove button
  - "+ 添加商品" button → product picker modal or navigate back to home
- **Submit button**: Full width, validates form → saves order → toast "订单提交成功，请等待后台核算价格" → navigate to history
- **No prices** displayed anywhere
- **Layout**: Mobile: stacked; Desktop: two-column (shipping left, products right)

### Page 3: OrderHistory (Client)

**Route**: `/history`
**Purpose**: View and manage submitted orders

- **Header**: "历史订单" title, total order count
- **Order cards**: Each showing:
  - Order number (e.g., #20260528001), timestamp
  - Status badge: "待核算" (yellow) or "已核算" (green)
  - Product list with editable quantity inputs
  - Shipping info summary (name, phone, address)
- **Actions per order**:
  - **Pending orders**: "保存修改" button, "删除订单" button (with confirmation dialog)
  - **Finalized orders**: Locked, show "已核算订单不可修改" notice
- **24-hour auto-lock**: Orders older than 24h automatically become read-only
- **Empty state**: Friendly illustration + message when no orders
- **Sort & filter**: Sort by time (newest first), filter by status (all / pending / priced)
- **Shipping address memory**: Auto-fill last used shipping info on next visit, stored in localStorage

### Page 2B: ProductPicker Modal (Client)

**Purpose**: Quick product addition without leaving the order page

- Triggered by "+ 添加商品" button on OrderPage
- **Modal**: Search input + category filter + product grid (compact cards)
- Each product card has a "+" button to add directly
- Added products appear in the order's product list immediately
- Close modal to return to OrderPage — no page navigation needed

### Page 4: LoginPage (Admin)

**Route**: `/login`
**Purpose**: Admin authentication

- **Centered card**: Brand name + "后台管理系统" subtitle
- **Form**: Account input, Password input, "登录" button
- **Initial auth**: Hardcoded credentials (admin/123456), checked in service layer
- **Session**: On success, store auth token in localStorage, redirect to `/orders`
- **Future**: Replace with JWT-based API authentication
- **Logout**: Button in admin header clears token, redirects to `/login`

### Page 5A: ProductManager (Admin)

**Route**: `/products`
**Purpose**: Manage product catalog

- **Top bar**: Dark navbar with tab switching (订单管理 | 商品管理), logout button
- **Toolbar**: Search input, category filter dropdown, status filter dropdown, "+ 新增商品" button
- **Product table**:
  - Columns: Image, Name, Category, Specs, Status, Actions
  - NO price column (pricing is per-order, not per-product)
  - Status: "上架" (green) or "下架" (red) pill badge
  - Actions: "编辑" (edit button), "上架"/"下架" (toggle button)
- **Add/Edit product modal**: Form with name (i18n), category select, specs, image URL
- **Category management section** (below table):
  - Existing categories as removable pills
  - "+ 新增分类" button → inline input
- **Persistence**: Products and categories saved to localStorage via service layer

### Page 5B: OrderManager (Admin)

**Route**: `/orders`
**Purpose**: Review orders, set per-order pricing, export

- **Top bar**: Same dark navbar as ProductManager
- **Toolbar**: Search input (order number/customer), status filter dropdown, "📥 导出Excel" button
- **Order list**: Collapsed rows showing:
  - Order number, customer name, phone, address (truncated), status badge
  - Total price (or "¥ --" if not yet priced)
  - Expand arrow ▼
- **Expanded order detail**:
  - Info tip: "为此订单的每项商品单独设置单价"
  - Table: Product name, specs, quantity, unit price input, subtotal (auto-calculated)
  - Unpriced items: highlighted input border (red), subtotal shows "--"
  - Order total: sum of all priced items
  - Actions: "保存定价" button, "📥 导出此单" button
- **Export**: Single order export + batch export to Excel (.xlsx) and Word (.docx)
- **Pricing rule**: Each order has independent pricing — same product can have different prices in different orders
- **Dashboard stats**: Top of the order list shows summary cards: pending count, today's orders, this month's orders

## Data Types

```typescript
interface Product {
  id: string;
  name: LocalizedString;       // { zh, en, ru }
  description: LocalizedString;
  categoryId: string;
  images: string[];
  variants: Variant[];          // model + size + weight combos
  active: boolean;              // 上架/下架
  createdAt: string;
}

interface Category {
  id: string;
  name: LocalizedString;
  icon: string;
  sortOrder: number;
}

interface Order {
  id: string;
  orderNumber: string;          // e.g., "20260528001"
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  status: 'pending' | 'priced'; // 待核算 | 已核算
  createdAt: string;
}

interface OrderItem {
  productId: string;
  variantId: string;
  productName: string;
  model: string;
  spec: string;                 // e.g., "32mm · 2.4kg"
  quantity: number;
  unitPrice?: number;           // Set by admin per-order (optional until priced)
}
```

## Service Layer

All data operations go through service interfaces in `src/shared/services/`:

```typescript
interface ProductService {
  getAll(): Promise<Product[]>;
  getById(id: string): Promise<Product | undefined>;
  create(product: Product): Promise<void>;
  update(id: string, data: Partial<Product>): Promise<void>;
  remove(id: string): Promise<void>;
}

interface OrderService {
  getAll(): Promise<Order[]>;
  getById(id: string): Promise<Order | undefined>;
  create(order: Order): Promise<void>;
  update(id: string, data: Partial<Order>): Promise<void>;
  remove(id: string): Promise<void>;
}

// Initial implementation: LocalStorageService
// Future: ApiService (fetch/axios)
```

## Route Guards

- Admin routes (`/orders`, `/products`): Check auth token in localStorage, redirect to `/login` if missing
- Client routes: No authentication required

## Future Backend Migration Path

1. Implement `ApiService` class that implements the same interfaces using `fetch`/`axios`
2. Swap `LocalStorageService` → `ApiService` in the service initialization
3. Replace hardcoded admin auth with JWT login API call
4. UI layer requires zero changes — service interface contract remains identical
