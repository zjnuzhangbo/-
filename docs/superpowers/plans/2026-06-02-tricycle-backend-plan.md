# Tricycle Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate from localStorage to Supabase (PostgreSQL + Auth + Storage + Edge Functions) while keeping existing service interfaces and frontend components unchanged.

**Architecture:** Supabase SDK for customer-facing CRUD with RLS, Edge Functions for admin operations with service_role key. Existing `ProductService`/`OrderService`/etc interfaces get Supabase implementations. Admin login stays separate from customer auth.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 3, Supabase JS SDK v2, Deno (Edge Functions)

---

### Task 1: Supabase Project Setup & Environment

**Files:**
- Create: `.env`
- Create: `.env.example`
- Modify: `package.json`

- [ ] **Step 1: Install Supabase JS SDK**

```bash
cd C:/Users/31777/Desktop/网站
npm install @supabase/supabase-js
```

- [ ] **Step 2: Create .env.example**

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_ADMIN_PASSWORD=admin123
```

- [ ] **Step 3: Create .env**

Same content as `.env.example` with real values from your Supabase project dashboard (Settings → API). The `ADMIN_PASSWORD` can be anything you choose.

- [ ] **Step 4: Verify package.json has the dep**

Run: `npm ls @supabase/supabase-js`
Expected: `@supabase/supabase-js@2.x.x`

- [ ] **Step 5: Commit**

```bash
git add .env.example package.json package-lock.json
git commit -m "chore: add @supabase/supabase-js and env template"
```

---

### Task 2: Database Migration SQL

**Files:**
- Create: `supabase/migrations/20260602000000_init.sql`

- [ ] **Step 1: Write the migration file**

```sql
-- Create tables
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  icon TEXT DEFAULT '',
  sort_order INT DEFAULT 0
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_zh TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  images TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  model TEXT NOT NULL DEFAULT '',
  size TEXT NOT NULL DEFAULT '',
  weight TEXT NOT NULL DEFAULT ''
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT DEFAULT '',
  default_name TEXT DEFAULT '',
  default_phone TEXT DEFAULT '',
  default_address TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES auth.users(id),
  customer_name TEXT NOT NULL DEFAULT '',
  customer_phone TEXT NOT NULL DEFAULT '',
  customer_address TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'priced')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  spec TEXT NOT NULL DEFAULT '',
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2)
);

-- RLS: enable on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Public read for catalog
CREATE POLICY "public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "public_read" ON products FOR SELECT USING (true);
CREATE POLICY "public_read" ON variants FOR SELECT USING (true);

-- Customers: own orders
CREATE POLICY "orders_select_own" ON orders FOR SELECT
  USING (auth.uid() = customer_id);
CREATE POLICY "orders_insert_own" ON orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Customers: items via owned orders
CREATE POLICY "items_select_own" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND customer_id = auth.uid()));
CREATE POLICY "items_insert_own" ON order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND customer_id = auth.uid()));

-- Customers: own profile
CREATE POLICY "profiles_own" ON profiles FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Seed data: 5 categories
INSERT INTO categories (id, name_zh, name_en, name_ru, icon, sort_order) VALUES
  ('cat-1', '车架/车斗', 'Frame/Body', 'Рама/Кузов', '', 1),
  ('cat-2', '车轮/轮胎', 'Wheels/Tires', 'Колеса/Шины', '', 2),
  ('cat-3', '刹车系统', 'Brake System', 'Тормозная система', '', 3),
  ('cat-4', '传动系统', 'Drivetrain', 'Трансмиссия', '', 4),
  ('cat-5', '电气系统', 'Electrical', 'Электрика', '', 5);

-- Seed data: 8 products with variants
DO $$
DECLARE
  p1 UUID := gen_random_uuid();
  p2 UUID := gen_random_uuid();
  p3 UUID := gen_random_uuid();
  p4 UUID := gen_random_uuid();
  p5 UUID := gen_random_uuid();
  p6 UUID := gen_random_uuid();
  p7 UUID := gen_random_uuid();
  p8 UUID := gen_random_uuid();
BEGIN
  INSERT INTO products (id, name_zh, name_en, name_ru, category_id, active) VALUES
    (p1, '前叉总成', 'Front Fork Assembly', 'Вилка в сборе', 'cat-1', true),
    (p2, '后轮毂总成', 'Rear Hub Assembly', 'Задняя ступица', 'cat-2', true),
    (p3, '刹车蹄总成', 'Brake Shoe Assembly', 'Тормозные колодки', 'cat-3', true),
    (p4, '差速器总成', 'Differential Assembly', 'Дифференциал', 'cat-4', true),
    (p5, 'LED大灯总成', 'LED Headlight', 'Светодиодная фара', 'cat-5', true),
    (p6, '车架主梁', 'Main Frame Beam', 'Главная балка рамы', 'cat-1', true),
    (p7, '轮胎内胎', 'Inner Tube', 'Камера', 'cat-2', true),
    (p8, '离合器片', 'Clutch Plate', 'Диск сцепления', 'cat-4', true);

  INSERT INTO variants (product_id, model, size, weight) VALUES
    (p1, '标准型', '32mm', '2.4kg'),
    (p1, '加粗型', '36mm', '2.8kg'),
    (p1, '轻量型', '28mm', '1.9kg'),
    (p2, '标准型', '16寸', '3.1kg'),
    (p2, '重型', '18寸', '4.0kg'),
    (p3, '标准型', '130mm', '0.8kg'),
    (p3, '高性能', '150mm', '1.0kg'),
    (p4, '18齿', '标准', '4.2kg'),
    (p4, '20齿', '标准', '4.5kg'),
    (p4, '16齿', '小型', '3.6kg'),
    (p5, '12V', '7寸', '0.6kg'),
    (p5, '24V', '9寸', '0.9kg'),
    (p6, '加厚型', '2.5m', '15.0kg'),
    (p6, '标准型', '2.5m', '12.0kg'),
    (p7, '标准型', '3.00-12', '0.5kg'),
    (p7, '标准型', '3.50-12', '0.6kg'),
    (p7, '标准型', '4.00-12', '0.7kg'),
    (p8, '标准型', '150mm', '1.2kg'),
    (p8, '加强型', '160mm', '1.5kg');
END $$;
```

- [ ] **Step 2: Run migration on Supabase**

Go to your Supabase project → SQL Editor → paste the entire file → click RUN.
Verify: check that all 6 tables appear in Table Editor with data in categories/products/variants.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260602000000_init.sql
git commit -m "feat: add database migration with RLS, seed data"
```

---

### Task 3: Supabase Client Initialization

**Files:**
- Create: `src/shared/services/supabase/client.ts`
- Create: `src/shared/services/supabase/adminApi.ts`

- [ ] **Step 1: Create supabase client**

```typescript
// src/shared/services/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

- [ ] **Step 2: Create admin API helper**

```typescript
// src/shared/services/supabase/adminApi.ts
const FUNCTIONS_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

function getAdminToken(): string | null {
  try {
    const raw = sessionStorage.getItem('tricycle_admin_token');
    return raw ? JSON.parse(raw).token : null;
  } catch {
    return null;
  }
}

export function setAdminToken(token: string) {
  sessionStorage.setItem('tricycle_admin_token', JSON.stringify({ token }));
}

export function clearAdminToken() {
  sessionStorage.removeItem('tricycle_admin_token');
}

export function hasAdminToken(): boolean {
  return getAdminToken() !== null;
}

async function adminFetch(path: string, body: unknown): Promise<{ data?: unknown; error?: string }> {
  const token = getAdminToken();
  const res = await fetch(`${FUNCTIONS_BASE}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) return { error: json.error || `HTTP ${res.status}` };
  return { data: json };
}

export async function adminLogin(password: string): Promise<{ token?: string; error?: string }> {
  const { data, error } = await adminFetch('admin-login', { password });
  if (error) return { error };
  const token = (data as { token: string }).token;
  if (token) setAdminToken(token);
  return { token };
}

export async function adminListProducts(): Promise<{ data?: unknown[]; error?: string }> {
  return adminFetch('admin-products', { action: 'list' }) as Promise<{ data?: unknown[]; error?: string }>;
}

export async function adminCreateProduct(product: Record<string, unknown>): Promise<{ data?: unknown; error?: string }> {
  return adminFetch('admin-products', { action: 'create', product });
}

export async function adminUpdateProduct(id: string, updates: Record<string, unknown>): Promise<{ data?: unknown; error?: string }> {
  return adminFetch('admin-products', { action: 'update', id, updates });
}

export async function adminDeleteProduct(id: string): Promise<{ error?: string }> {
  return adminFetch('admin-products', { action: 'delete', id });
}

export async function adminListCategories(): Promise<{ data?: unknown[]; error?: string }> {
  return adminFetch('admin-categories', { action: 'list' }) as Promise<{ data?: unknown[]; error?: string }>;
}

export async function adminCreateCategory(category: Record<string, unknown>): Promise<{ data?: unknown; error?: string }> {
  return adminFetch('admin-categories', { action: 'create', category });
}

export async function adminDeleteCategory(id: string): Promise<{ error?: string }> {
  return adminFetch('admin-categories', { action: 'delete', id });
}

export async function adminListOrders(): Promise<{ data?: unknown[]; error?: string }> {
  return adminFetch('admin-orders', { action: 'list' }) as Promise<{ data?: unknown[]; error?: string }>;
}

export async function adminUpdatePricing(orderId: string, items: { id: string; unitPrice: number }[]): Promise<{ data?: unknown; error?: string }> {
  return adminFetch('admin-orders', { action: 'updatePricing', orderId, items });
}

export async function adminDeleteOrder(id: string): Promise<{ error?: string }> {
  return adminFetch('admin-orders', { action: 'delete', id });
}

export async function adminUploadImage(base64: string): Promise<{ url?: string; error?: string }> {
  return adminFetch('admin-products', { action: 'uploadImage', base64 }) as Promise<{ url?: string; error?: string }>;
}
```

- [ ] **Step 3: Commit**

```bash
git add src/shared/services/supabase/client.ts src/shared/services/supabase/adminApi.ts
git commit -m "feat: add Supabase client and admin API helper"
```

---

### Task 4: Supabase Service Implementations

**Files:**
- Create: `src/shared/services/supabase/categoryService.ts`
- Create: `src/shared/services/supabase/productService.ts`
- Create: `src/shared/services/supabase/orderService.ts`

- [ ] **Step 1: Implement SupabaseCategoryService**

```typescript
// src/shared/services/supabase/categoryService.ts
import { supabase } from './client';
import type { CategoryService } from '../interfaces';
import type { Category } from '../../types';

export class SupabaseCategoryService implements CategoryService {
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order');
    if (error) { console.error('categories.getAll:', error); return []; }
    return (data || []).map(rowToCategory);
  }

  async create(category: Category): Promise<void> {
    const { error } = await supabase.from('categories').insert({
      id: category.id,
      name_zh: category.name.zh,
      name_en: category.name.en,
      name_ru: category.name.ru,
      icon: category.icon,
      sort_order: category.sortOrder,
    });
    if (error) throw error;
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  }
}

function rowToCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: {
      zh: (row.name_zh as string) || '',
      en: (row.name_en as string) || '',
      ru: (row.name_ru as string) || '',
    },
    icon: (row.icon as string) || '',
    sortOrder: (row.sort_order as number) || 0,
  };
}
```

- [ ] **Step 2: Implement SupabaseProductService**

```typescript
// src/shared/services/supabase/productService.ts
import { supabase } from './client';
import type { ProductService } from '../interfaces';
import type { Product } from '../../types';

export class SupabaseProductService implements ProductService {
  async getAll(): Promise<Product[]> {
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (prodError) { console.error('products.getAll:', prodError); return []; }

    const { data: variants, error: varError } = await supabase
      .from('variants')
      .select('*')
      .order('id');
    if (varError) { console.error('variants.getAll:', varError); return []; }

    const variantMap = new Map<string, unknown[]>();
    for (const v of (variants || [])) {
      const pid = v.product_id as string;
      if (!variantMap.has(pid)) variantMap.set(pid, []);
      variantMap.get(pid)!.push(v);
    }

    return (products || []).map(p => rowToProduct(p, variantMap.get(p.id as string) || []));
  }

  async getById(id: string): Promise<Product | undefined> {
    const { data: product, error } = await supabase
      .from('products').select('*').eq('id', id).single();
    if (error || !product) return undefined;

    const { data: variants } = await supabase
      .from('variants').select('*').eq('product_id', id).order('id');
    return rowToProduct(product, variants || []);
  }

  async create(product: Product): Promise<void> {
    const { error } = await supabase.from('products').insert({
      id: product.id,
      name_zh: product.name.zh,
      name_en: product.name.en,
      name_ru: product.name.ru,
      category_id: product.categoryId,
      images: product.images,
      active: product.active,
      created_at: product.createdAt,
    });
    if (error) throw error;

    if (product.variants.length > 0) {
      const variantRows = product.variants.map(v => ({
        id: v.id,
        product_id: product.id,
        model: v.model,
        size: v.size,
        weight: v.weight,
      }));
      const { error: vError } = await supabase.from('variants').insert(variantRows);
      if (vError) throw vError;
    }
  }

  async update(id: string, data: Partial<Product>): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (data.name) {
      updates.name_zh = data.name.zh;
      updates.name_en = data.name.en;
      updates.name_ru = data.name.ru;
    }
    if (data.categoryId !== undefined) updates.category_id = data.categoryId;
    if (data.images !== undefined) updates.images = data.images;
    if (data.active !== undefined) updates.active = data.active;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from('products').update(updates).eq('id', id);
      if (error) throw error;
    }

    if (data.variants !== undefined) {
      await supabase.from('variants').delete().eq('product_id', id);
      if (data.variants.length > 0) {
        const variantRows = data.variants.map(v => ({
          id: v.id || crypto.randomUUID(),
          product_id: id,
          model: v.model,
          size: v.size,
          weight: v.weight,
        }));
        const { error: vError } = await supabase.from('variants').insert(variantRows);
        if (vError) throw vError;
      }
    }
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  }
}

function rowToProduct(row: Record<string, unknown>, variants: unknown[]): Product {
  return {
    id: row.id as string,
    name: {
      zh: (row.name_zh as string) || '',
      en: (row.name_en as string) || '',
      ru: (row.name_ru as string) || '',
    },
    description: { zh: '', en: '', ru: '' },
    categoryId: (row.category_id as string) || '',
    images: (row.images as string[]) || [],
    variants: variants.map(v => {
      const rv = v as Record<string, unknown>;
      return {
        id: rv.id as string,
        model: (rv.model as string) || '',
        size: (rv.size as string) || '',
        weight: (rv.weight as string) || '',
      };
    }),
    active: (row.active as boolean) ?? true,
    createdAt: (row.created_at as string) || '',
  };
}
```

- [ ] **Step 3: Implement SupabaseOrderService**

```typescript
// src/shared/services/supabase/orderService.ts
import { supabase } from './client';
import type { OrderService } from '../interfaces';
import type { Order } from '../../types';

export class SupabaseOrderService implements OrderService {
  async getAll(): Promise<Order[]> {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) { console.error('orders.getAll:', error); return []; }

    if (!orders || orders.length === 0) return [];

    const orderIds = orders.map(o => o.id);
    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds)
      .order('id');

    const itemMap = new Map<string, unknown[]>();
    for (const item of (items || [])) {
      const oid = (item as Record<string, unknown>).order_id as string;
      if (!itemMap.has(oid)) itemMap.set(oid, []);
      itemMap.get(oid)!.push(item);
    }

    return orders.map(o => rowToOrder(o, itemMap.get(o.id as string) || []));
  }

  async getById(id: string): Promise<Order | undefined> {
    const { data: order, error } = await supabase
      .from('orders').select('*').eq('id', id).single();
    if (error || !order) return undefined;

    const { data: items } = await supabase
      .from('order_items').select('*').eq('order_id', id).order('id');
    return rowToOrder(order, items || []);
  }

  async create(order: Order): Promise<void> {
    const { error } = await supabase.from('orders').insert({
      id: order.id,
      order_number: order.orderNumber,
      customer_id: (await supabase.auth.getUser()).data.user?.id,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      customer_address: order.customerAddress,
      status: order.status,
      created_at: order.createdAt,
    });
    if (error) throw error;

    if (order.items.length > 0) {
      const itemRows = order.items.map(item => ({
        id: crypto.randomUUID(),
        order_id: order.id,
        product_name: item.productName,
        model: item.model,
        spec: item.spec,
        quantity: item.quantity,
        unit_price: item.unitPrice ?? null,
      }));
      const { error: iError } = await supabase.from('order_items').insert(itemRows);
      if (iError) throw iError;
    }
  }

  async update(id: string, data: Partial<Order>): Promise<void> {
    const updates: Record<string, unknown> = {};
    if (data.status !== undefined) updates.status = data.status;
    if (data.customerName !== undefined) updates.customer_name = data.customerName;
    if (data.customerPhone !== undefined) updates.customer_phone = data.customerPhone;
    if (data.customerAddress !== undefined) updates.customer_address = data.customerAddress;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from('orders').update(updates).eq('id', id);
      if (error) throw error;
    }

    if (data.items !== undefined) {
      await supabase.from('order_items').delete().eq('order_id', id);
      if (data.items.length > 0) {
        const itemRows = data.items.map(item => ({
          id: crypto.randomUUID(),
          order_id: id,
          product_name: item.productName,
          model: item.model,
          spec: item.spec,
          quantity: item.quantity,
          unit_price: item.unitPrice ?? null,
        }));
        const { error: iError } = await supabase.from('order_items').insert(itemRows);
        if (iError) throw iError;
      }
    }
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
  }
}

function rowToOrder(row: Record<string, unknown>, items: unknown[]): Order {
  return {
    id: row.id as string,
    orderNumber: (row.order_number as string) || '',
    customerName: (row.customer_name as string) || '',
    customerPhone: (row.customer_phone as string) || '',
    customerAddress: (row.customer_address as string) || '',
    status: (row.status as 'pending' | 'priced') || 'pending',
    createdAt: (row.created_at as string) || '',
    items: items.map(item => {
      const ri = item as Record<string, unknown>;
      return {
        productId: '',
        variantId: '',
        productName: (ri.product_name as string) || '',
        model: (ri.model as string) || '',
        spec: (ri.spec as string) || '',
        quantity: (ri.quantity as number) || 1,
        unitPrice: ri.unit_price as number | undefined,
      };
    }),
  };
}
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/shared/services/supabase/categoryService.ts src/shared/services/supabase/productService.ts src/shared/services/supabase/orderService.ts
git commit -m "feat: add Supabase service implementations"
```

---

### Task 5: Customer Auth (Supabase Auth)

**Files:**
- Create: `src/shared/services/supabase/authService.ts`
- Create: `src/client/components/AuthGuard.tsx`
- Create: `src/client/pages/LoginPage.tsx`
- Modify: `src/client/App.tsx`
- Modify: `src/shared/i18n/locales/zh.json`
- Modify: `src/shared/i18n/locales/en.json`
- Modify: `src/shared/i18n/locales/ru.json`

- [ ] **Step 1: Add i18n keys for auth page**

In `src/shared/i18n/locales/zh.json`, add `"auth"` section after `"app"`:

```json
"auth": {
  "title": "登录",
  "emailLabel": "邮箱地址",
  "emailPlaceholder": "请输入邮箱",
  "sendCode": "发送验证码",
  "codeSent": "验证码已发送，请检查邮箱",
  "codeLabel": "验证码",
  "codePlaceholder": "请输入6位验证码",
  "verify": "验证登录",
  "phoneLabel": "或使用手机号",
  "phonePlaceholder": "请输入手机号",
  "sendSms": "发送短信验证码",
  "sending": "发送中...",
  "logout": "退出登录",
  "loggedInAs": "已登录: {{email}}",
  "required": "登录后才能下单"
}
```

In `src/shared/i18n/locales/en.json`, add:

```json
"auth": {
  "title": "Sign In",
  "emailLabel": "Email Address",
  "emailPlaceholder": "Enter your email",
  "sendCode": "Send Code",
  "codeSent": "Code sent! Check your inbox.",
  "codeLabel": "Verification Code",
  "codePlaceholder": "Enter 6-digit code",
  "verify": "Verify & Sign In",
  "phoneLabel": "Or use phone",
  "phonePlaceholder": "Enter phone number",
  "sendSms": "Send SMS Code",
  "sending": "Sending...",
  "logout": "Sign Out",
  "loggedInAs": "Signed in: {{email}}",
  "required": "Sign in to place orders"
}
```

In `src/shared/i18n/locales/ru.json`, add:

```json
"auth": {
  "title": "Вход",
  "emailLabel": "Эл. почта",
  "emailPlaceholder": "Введите email",
  "sendCode": "Отправить код",
  "codeSent": "Код отправлен! Проверьте почту.",
  "codeLabel": "Код подтверждения",
  "codePlaceholder": "Введите 6-значный код",
  "verify": "Подтвердить и войти",
  "phoneLabel": "Или по телефону",
  "phonePlaceholder": "Введите номер телефона",
  "sendSms": "Отправить SMS",
  "sending": "Отправка...",
  "logout": "Выйти",
  "loggedInAs": "Вход: {{email}}",
  "required": "Войдите для оформления заказа"
}
```

- [ ] **Step 2: Implement SupabaseAuthService**

```typescript
// src/shared/services/supabase/authService.ts
import { supabase } from './client';
import type { AuthService } from '../interfaces';

export class SupabaseAuthService implements AuthService {
  async login(username: string, password: string): Promise<boolean> {
    // Customer auth uses email OTP, not username/password.
    // This method is for admin (localStorage-based) only.
    return false;
  }

  logout(): void {
    supabase.auth.signOut();
  }

  isLoggedIn(): boolean {
    // For admin, check localStorage. For customer, check Supabase session.
    return false; // Customer auth check is done via supabase.auth.getSession()
  }

  getToken(): string | null {
    return null; // Token managed by supabase SDK
  }

  // --- Customer-specific methods ---

  async sendEmailOtp(email: string): Promise<{ error?: string }> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) return { error: error.message };
    return {};
  }

  async verifyEmailOtp(email: string, token: string): Promise<{ error?: string }> {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) return { error: error.message };
    return {};
  }

  async sendPhoneOtp(phone: string): Promise<{ error?: string }> {
    const { error } = await supabase.auth.signInWithOtp({
      phone,
      options: { shouldCreateUser: true },
    });
    if (error) return { error: error.message };
    return {};
  }

  async verifyPhoneOtp(phone: string, token: string): Promise<{ error?: string }> {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });
    if (error) return { error: error.message };
    return {};
  }

  async getSession() {
    return supabase.auth.getSession();
  }

  async getUser() {
    return supabase.auth.getUser();
  }

  onAuthChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}
```

- [ ] **Step 3: Create customer LoginPage**

```tsx
// src/client/pages/LoginPage.tsx
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../shared/services/supabase/client';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('return') || '/';

  const [email, setEmail] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const sendCode = async () => {
    if (!email.trim()) return;
    setSending(true);
    setError('');
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    setSending(false);
    if (err) { setError(err.message); return; }
    setCodeSent(true);
  };

  const verifyCode = async () => {
    if (!code.trim()) return;
    setError('');
    const { error: err } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });
    if (err) { setError(err.message); return; }
    navigate(returnTo, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white rounded-lg border border-slate-200 p-8 w-full max-w-sm shadow-sm">
        <h1 className="font-display text-xl text-slate-800 text-center mb-6">{t('auth.title')}</h1>

        {!codeSent ? (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-semibold text-slate-500">{t('auth.emailLabel')}</label>
            <input
              className="input-field"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendCode()}
            />
            <button
              onClick={sendCode}
              disabled={sending || !email.trim()}
              className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm"
            >
              {sending ? t('auth.sending') : t('auth.sendCode')}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-emerald-600 text-center">{t('auth.codeSent')}</p>
            <label className="text-xs font-semibold text-slate-500">{t('auth.codeLabel')}</label>
            <input
              className="input-field text-center text-lg tracking-widest"
              placeholder={t('auth.codePlaceholder')}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyDown={e => e.key === 'Enter' && verifyCode()}
            />
            <button
              onClick={verifyCode}
              disabled={code.length < 6}
              className="w-full py-2.5 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:opacity-50 text-sm"
            >
              {t('auth.verify')}
            </button>
          </div>
        )}

        {error && <p className="text-xs text-red-500 mt-3 text-center">{error}</p>}

        <button onClick={() => navigate(-1)} className="w-full mt-4 text-xs text-slate-400 hover:text-slate-600">
          ← {t('order.back')}
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create AuthGuard component**

```tsx
// src/client/components/AuthGuard.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../shared/services/supabase/client';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setAuthed(true);
      } else {
        navigate(`/login?return=${encodeURIComponent(location.pathname)}`, { replace: true });
      }
      setChecking(false);
    });
  }, []);

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center"><span className="text-slate-400 text-sm">Loading...</span></div>;
  }

  if (!authed) return null;
  return <>{children}</>;
}
```

- [ ] **Step 5: Update client App.tsx to add auth routes and guard**

In `src/client/App.tsx`, add imports and routes:

```tsx
import LoginPage from './pages/LoginPage';
import AuthGuard from './components/AuthGuard';

// Wrap OrderPage and OrderHistory in AuthGuard:
<Route path="/login" element={<LoginPage />} />
<Route path="/order" element={<AuthGuard><OrderPage /></AuthGuard>} />
<Route path="/history" element={<AuthGuard><OrderHistory /></AuthGuard>} />
```

Full updated `App.tsx`:

```tsx
import { useEffect } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from '../shared/components/ui/Toast';
import '../shared/i18n';
import { seedIfEmpty } from '../shared/services/seed';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthGuard from './components/AuthGuard';
import HomePage from './pages/HomePage';
import OrderPage from './pages/OrderPage';
import OrderHistory from './pages/OrderHistory';
import LoginPage from './pages/LoginPage';

export default function App() {
  useEffect(() => { seedIfEmpty(); }, []);

  return (
    <ToastProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex flex-col">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/order" element={<AuthGuard><OrderPage /></AuthGuard>} />
              <Route path="/history" element={<AuthGuard><OrderHistory /></AuthGuard>} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </ToastProvider>
  );
}
```

- [ ] **Step 6: Update Header to show login/logout**

In `src/client/components/Header.tsx`, add user state detection:

```tsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../../shared/services/supabase/client';

// ... inside component, add:
const [user, setUser] = useState<{ email?: string } | null>(null);

useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setUser(data.session?.user ?? null);
  });
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });
  return () => data.subscription.unsubscribe();
}, []);

// In the nav, add user section:
{user ? (
  <div className="flex items-center gap-3">
    <span className="text-xs text-slate-400 hidden sm:inline">{t('auth.loggedInAs', { email: user.email })}</span>
    <button onClick={() => supabase.auth.signOut()} className="text-xs text-slate-400 hover:text-red-500">{t('auth.logout')}</button>
  </div>
) : (
  <Link to="/login" className="text-sm font-medium text-primary-600 hover:text-primary-700">登录</Link>
)}
```

- [ ] **Step 7: Update OrderPage to pass customer_id from auth**

In `src/client/pages/OrderPage.tsx`, update `handleSubmit` to get the user:

```tsx
import { supabase } from '../../shared/services/supabase/client';

// In handleSubmit, before creating order:
const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  toast('请先登录', 'error');
  navigate('/login?return=/order');
  return;
}

// The order creation now includes customer_id automatically via RLS
// The SupabaseOrderService.create() already sets customer_id from auth
```

- [ ] **Step 8: Type-check and verify**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add src/shared/services/supabase/authService.ts src/client/components/AuthGuard.tsx src/client/pages/LoginPage.tsx src/client/App.tsx src/client/components/Header.tsx src/client/pages/OrderPage.tsx src/shared/i18n/locales/zh.json src/shared/i18n/locales/en.json src/shared/i18n/locales/ru.json
git commit -m "feat: add customer auth (Supabase email OTP + auth guard)"
```

---

### Task 6: Edge Functions (Deno)

**Files:**
- Create: `supabase/functions/admin-login/index.ts`
- Create: `supabase/functions/admin-products/index.ts`
- Create: `supabase/functions/admin-categories/index.ts`
- Create: `supabase/functions/admin-orders/index.ts`

- [ ] **Step 1: Create admin-login function**

```typescript
// supabase/functions/admin-login/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { create, getNumericDate } from 'https://deno.land/x/djwt@v2.8/mod.ts';

const JWT_SECRET = Deno.env.get('ADMIN_JWT_SECRET') || 'change-me-to-a-random-string';
const ADMIN_PASSWORD = Deno.env.get('ADMIN_PASSWORD') || 'admin123';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  try {
    const { password } = await req.json();
    if (password !== ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: 'invalid password' }), { status: 401,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }

    const token = await create(
      { alg: 'HS256', typ: 'JWT' },
      { role: 'admin', exp: getNumericDate(60 * 60 * 24) },
      new TextEncoder().encode(JWT_SECRET),
    );

    return new Response(JSON.stringify({ token }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
});
```

- [ ] **Step 2: Create admin-products function**

```typescript
// supabase/functions/admin-products/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  );

  try {
    const { action, product, id, updates, base64 } = await req.json();

    switch (action) {
      case 'list': {
        const { data, error } = await supabase
          .from('products').select('*').order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        const { data: variants } = await supabase.from('variants').select('*');
        const varMap = new Map();
        for (const v of (variants || [])) {
          if (!varMap.has(v.product_id)) varMap.set(v.product_id, []);
          varMap.get(v.product_id).push(v);
        }
        const result = (data || []).map(p => ({
          ...p,
          variants: varMap.get(p.id) || [],
        }));
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      case 'create': {
        const { variants: vArr, ...prod } = product;
        // Flatten app-format name {zh,en,ru} to DB columns name_zh,name_en,name_ru
        const dbProduct = {
          ...prod,
          name_zh: prod.name?.zh || '',
          name_en: prod.name?.en || '',
          name_ru: prod.name?.ru || '',
          name: undefined,
        };
        const { error } = await supabase.from('products').insert(dbProduct);
        if (error) throw new Error(error.message);
        if (vArr && vArr.length > 0) {
          const vRows = vArr.map((v: Record<string, unknown>) => ({ ...v, product_id: prod.id }));
          await supabase.from('variants').insert(vRows);
        }
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      case 'update': {
        const { variants: vArr, ...prod } = updates;
        // Flatten name if present
        const dbUpdates: Record<string, unknown> = { ...prod };
        if (prod.name) {
          dbUpdates.name_zh = prod.name.zh;
          dbUpdates.name_en = prod.name.en;
          dbUpdates.name_ru = prod.name.ru;
          delete dbUpdates.name;
        }
        if (Object.keys(dbUpdates).length > 0) {
          const { error } = await supabase.from('products').update(dbUpdates).eq('id', id);
          if (error) throw new Error(error.message);
        }
        if (vArr !== undefined) {
          await supabase.from('variants').delete().eq('product_id', id);
          if (vArr.length > 0) {
            const vRows = vArr.map((v: Record<string, unknown>) => ({ ...v, product_id: id }));
            await supabase.from('variants').insert(vRows);
          }
        }
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      case 'delete': {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      case 'uploadImage': {
        const buf = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const filename = `${crypto.randomUUID()}.png`;
        const { error, data } = await supabase.storage
          .from('product-images').upload(filename, buf, { contentType: 'image/png', upsert: false });
        if (error) throw new Error(error.message);
        const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(filename);
        return new Response(JSON.stringify({ url: publicUrl }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'unknown action' }), { status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
});
```

- [ ] **Step 3: Create admin-categories function**

```typescript
// supabase/functions/admin-categories/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  );

  try {
    const { action, category, id } = await req.json();

    switch (action) {
      case 'list': {
        const { data, error } = await supabase
          .from('categories').select('*').order('sort_order');
        if (error) throw new Error(error.message);
        return new Response(JSON.stringify(data), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
      case 'create': {
        const { error } = await supabase.from('categories').insert(category);
        if (error) throw new Error(error.message);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
      case 'delete': {
        const { error } = await supabase.from('categories').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }
      default:
        return new Response(JSON.stringify({ error: 'unknown action' }), { status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
});
```

- [ ] **Step 4: Create admin-orders function**

```typescript
// supabase/functions/admin-orders/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
  );

  try {
    const { action, orderId, items, id } = await req.json();

    switch (action) {
      case 'list': {
        const { data: orders, error } = await supabase
          .from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw new Error(error.message);
        if (!orders || orders.length === 0) {
          return new Response(JSON.stringify([]), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
          });
        }
        const orderIds = orders.map(o => o.id);
        const { data: items } = await supabase
          .from('order_items').select('*').in('order_id', orderIds).order('id');
        const itemMap = new Map();
        for (const item of (items || [])) {
          if (!itemMap.has(item.order_id)) itemMap.set(item.order_id, []);
          itemMap.get(item.order_id).push(item);
        }
        const result = orders.map(o => ({ ...o, items: itemMap.get(o.id) || [] }));
        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      case 'updatePricing': {
        for (const item of items) {
          await supabase.from('order_items').update({ unit_price: item.unitPrice }).eq('id', item.id);
        }
        const { data: allItems } = await supabase
          .from('order_items').select('unit_price').eq('order_id', orderId);
        const allPriced = (allItems || []).every(i => i.unit_price !== null);
        await supabase.from('orders').update({ status: allPriced ? 'priced' : 'pending' }).eq('id', orderId);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      case 'delete': {
        const { error } = await supabase.from('orders').delete().eq('id', id);
        if (error) throw new Error(error.message);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'unknown action' }), { status: 400,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
    }
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } });
  }
});
```

- [ ] **Step 5: Deploy functions to Supabase**

Install Supabase CLI and deploy (or manually create functions in Supabase Dashboard):

```bash
# If using Supabase CLI:
supabase functions deploy admin-login
supabase functions deploy admin-products
supabase functions deploy admin-categories
supabase functions deploy admin-orders

# Set secrets:
supabase secrets set ADMIN_PASSWORD=yourpassword
supabase secrets set ADMIN_JWT_SECRET=$(openssl rand -hex 32)
```

Or for manual deploy: go to Supabase Dashboard → Edge Functions → New Function → paste each function code.

- [ ] **Step 6: Verify functions work**

```bash
curl -X POST https://your-project.supabase.co/functions/v1/admin-login \
  -H "Content-Type: application/json" \
  -d '{"password":"yourpassword"}'
```
Expected: `{"token":"eyJ..."}`

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/
git commit -m "feat: add admin Edge Functions (login, products, categories, orders)"
```

---

### Task 7: Admin Panel Updates for Supabase

**Files:**
- Modify: `src/shared/services/index.ts`
- Modify: `src/admin/pages/LoginPage.tsx`
- Modify: `src/admin/pages/ProductManager.tsx`
- Modify: `src/admin/pages/OrderManager.tsx`

- [ ] **Step 1: Update service exports to support switching**

In `src/shared/services/index.ts`, add Supabase service exports alongside localStorage ones, using an env flag to switch:

```typescript
import {
  LocalStorageProductService,
  LocalStorageCategoryService,
  LocalStorageOrderService,
  LocalStorageAuthService,
} from './localStorage';
import { SupabaseCategoryService } from './supabase/categoryService';
import { SupabaseProductService } from './supabase/productService';
import { SupabaseOrderService } from './supabase/orderService';
import { SupabaseAuthService } from './supabase/authService';
import type { ProductService, CategoryService, OrderService, AuthService } from './interfaces';

const useSupabase = !!import.meta.env.VITE_SUPABASE_URL;

export const productService: ProductService = useSupabase
  ? new SupabaseProductService()
  : new LocalStorageProductService();
export const categoryService: CategoryService = useSupabase
  ? new SupabaseCategoryService()
  : new LocalStorageCategoryService();
export const orderService: OrderService = useSupabase
  ? new SupabaseOrderService()
  : new LocalStorageOrderService();
export const authService: AuthService = useSupabase
  ? new SupabaseAuthService()
  : new LocalStorageAuthService();

export type { ProductService, CategoryService, OrderService, AuthService };
```

- [ ] **Step 2: Update admin LoginPage to use adminApi**

In `src/admin/pages/LoginPage.tsx`:

```tsx
// Replace the import
import { authService } from '../../shared/services';
// With:
import { adminLogin, hasAdminToken } from '../../shared/services/supabase/adminApi';

// If already logged in, redirect
import { useEffect } from 'react';
useEffect(() => {
  if (hasAdminToken()) navigate('/orders');
}, []);

// Replace handleLogin:
const handleLogin = async () => {
  setError('');
  const { token, error: err } = await adminLogin(password);
  if (token) {
    navigate('/orders');
  } else {
    setError(err || t('admin.login.error'));
  }
};
```

- [ ] **Step 3: Update admin AuthService check for ProtectedRoute**

The `ProtectedRoute` in `src/admin/App.tsx` checks `authService.isLoggedIn()`. We need to update it to also check admin token:

In `src/admin/App.tsx`, update `ProtectedRoute`:

```tsx
import { hasAdminToken } from '../shared/services/supabase/adminApi';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!authService.isLoggedIn() && !hasAdminToken()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
```

- [ ] **Step 4: Update ProductManager to use admin API**

In `src/admin/pages/ProductManager.tsx`, the admin operations (create, update, delete) need to go through Edge Functions when Supabase is configured. We wrap this in a helper that detects the backend:

```tsx
// At the top, add conditional imports:
const useSupabase = !!import.meta.env.VITE_SUPABASE_URL;

// For Supabase: admin operations go through Edge Functions
// For localStorage: use productService directly

// Update load function:
const load = async () => {
  if (useSupabase) {
    const { adminListProducts, adminListCategories } = await import('../../shared/services/supabase/adminApi');
    const { data: prods } = await adminListProducts();
    const { data: cats } = await adminListCategories();
    if (prods) setProducts(prods as Product[]);
    if (cats) setCategories(cats as Category[]);
  } else {
    productService.getAll().then(setProducts);
    categoryService.getAll().then(setCategories);
  }
};
```

Actually, this conditional logic is getting complex. Let's create a simpler admin service that abstracts this.

Instead, let's keep the conditional logic minimal and create a unified admin helper. For the plan, we'll handle the key operations with conditional paths.

Since this is getting complex with the dual path, let's simplify: for the MVP, the admin panel uses Edge Functions when `VITE_SUPABASE_URL` is set, falling back to localStorage services.

- [ ] **Step 5: Create admin service helper**

```typescript
// src/shared/services/supabase/adminService.ts
import type { Product, Category, Order } from '../../types';
import {
  adminListProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct, adminUploadImage,
  adminListCategories, adminCreateCategory, adminDeleteCategory,
  adminListOrders, adminUpdatePricing, adminDeleteOrder,
} from './adminApi';
import { productService, categoryService, orderService } from '../index';

const useSupabase = !!import.meta.env.VITE_SUPABASE_URL;

// Edge Functions return DB-format rows (flat columns). Convert to app types.
function dbToProduct(row: Record<string, unknown>): Product {
  const variants = (row.variants as unknown[]) || [];
  return {
    id: row.id as string,
    name: { zh: (row.name_zh as string) || '', en: (row.name_en as string) || '', ru: (row.name_ru as string) || '' },
    description: { zh: '', en: '', ru: '' },
    categoryId: (row.category_id as string) || '',
    images: (row.images as string[]) || [],
    variants: variants.map(v => {
      const rv = v as Record<string, unknown>;
      return { id: rv.id as string, model: (rv.model as string) || '', size: (rv.size as string) || '', weight: (rv.weight as string) || '' };
    }),
    active: (row.active as boolean) ?? true,
    createdAt: (row.created_at as string) || '',
  };
}

function dbToCategory(row: Record<string, unknown>): Category {
  return {
    id: row.id as string,
    name: { zh: (row.name_zh as string) || '', en: (row.name_en as string) || '', ru: (row.name_ru as string) || '' },
    icon: (row.icon as string) || '',
    sortOrder: (row.sort_order as number) || 0,
  };
}

function dbToOrder(row: Record<string, unknown>): Order {
  const items = (row.items as unknown[]) || [];
  return {
    id: row.id as string,
    orderNumber: (row.order_number as string) || '',
    customerName: (row.customer_name as string) || '',
    customerPhone: (row.customer_phone as string) || '',
    customerAddress: (row.customer_address as string) || '',
    status: (row.status as 'pending' | 'priced') || 'pending',
    createdAt: (row.created_at as string) || '',
    items: items.map(item => {
      const ri = item as Record<string, unknown>;
      return { productId: '', variantId: '', productName: (ri.product_name as string) || '', model: (ri.model as string) || '', spec: (ri.spec as string) || '', quantity: (ri.quantity as number) || 1, unitPrice: ri.unit_price as number | undefined };
    }),
  };
}

// Products
export const adminProductService = {
  getAll: async (): Promise<Product[]> => {
    if (useSupabase) {
      const { data } = await adminListProducts();
      return (data || []).map(r => dbToProduct(r as Record<string, unknown>));
    }
    return productService.getAll();
  },
  create: async (product: Product): Promise<void> => {
    if (useSupabase) {
      const { error } = await adminCreateProduct(product);
      if (error) throw new Error(error);
      return;
    }
    return productService.create(product);
  },
  update: async (id: string, data: Partial<Product>): Promise<void> => {
    if (useSupabase) {
      const { error } = await adminUpdateProduct(id, data);
      if (error) throw new Error(error);
      return;
    }
    return productService.update(id, data);
  },
  remove: async (id: string): Promise<void> => {
    if (useSupabase) {
      const { error } = await adminDeleteProduct(id);
      if (error) throw new Error(error);
      return;
    }
    return productService.remove(id);
  },
};

// Categories
export const adminCategoryService = {
  getAll: async (): Promise<Category[]> => {
    if (useSupabase) {
      const { data } = await adminListCategories();
      return (data || []).map(r => dbToCategory(r as Record<string, unknown>));
    }
    return categoryService.getAll();
  },
  create: async (category: Category): Promise<void> => {
    if (useSupabase) {
      const { error } = await adminCreateCategory(category);
      if (error) throw new Error(error);
      return;
    }
    return categoryService.create(category);
  },
  remove: async (id: string): Promise<void> => {
    if (useSupabase) {
      const { error } = await adminDeleteCategory(id);
      if (error) throw new Error(error);
      return;
    }
    return categoryService.remove(id);
  },
};

// Orders
export const adminOrderService = {
  getAll: async (): Promise<Order[]> => {
    if (useSupabase) {
      const { data } = await adminListOrders();
      return (data || []).map(r => dbToOrder(r as Record<string, unknown>));
    }
    return orderService.getAll();
  },
  update: async (id: string, data: Partial<Order>): Promise<void> => {
    if (useSupabase && data.items) {
      const items = data.items.map(i => ({ id: (i as Record<string, unknown>).id as string, unitPrice: i.unitPrice || 0 }));
      const { error } = await adminUpdatePricing(id, items);
      if (error) throw new Error(error);
      return;
    }
    return orderService.update(id, data);
  },
  remove: async (id: string): Promise<void> => {
    if (useSupabase) {
      const { error } = await adminDeleteOrder(id);
      if (error) throw new Error(error);
      return;
    }
    return orderService.remove(id);
  },
};
```

- [ ] **Step 6: Swap ProductManager and OrderManager to use admin services**

In `src/admin/pages/ProductManager.tsx`:

```tsx
// Replace:
import { productService, categoryService } from '../../shared/services';
// With:
import { adminProductService as productService, adminCategoryService as categoryService } from '../../shared/services/supabase/adminService';
```

In `src/admin/pages/OrderManager.tsx`:

```tsx
// Replace:
import { orderService } from '../../shared/services';
// With:
import { adminOrderService as orderService } from '../../shared/services/supabase/adminService';

// For image upload in ProductManager saveFull, when useSupabase:
// Replace base64 image handling with supabase storage upload:
if (useSupabase && imagePreview && imagePreview.startsWith('data:')) {
  const base64 = imagePreview.split(',')[1];
  const { url } = await adminUploadImage(base64);
  if (url) images = [url];
}
```

- [ ] **Step 7: Update admin logout**

In `src/admin/components/AdminLayout.tsx`:

```tsx
// Replace:
import { authService } from '../../shared/services';
// With:
import { clearAdminToken } from '../../shared/services/supabase/adminApi';

// Update handleLogout:
const handleLogout = () => {
  clearAdminToken();
  authService.logout(); // clears localStorage too
  navigate('/login');
};
```

- [ ] **Step 8: Disable seed for Supabase mode**

In `src/client/App.tsx` and `src/admin/App.tsx`, the `seedIfEmpty()` call doesn't need to run when using Supabase (data comes from DB). We use a no-op:

In both App.tsx files, update the useEffect:

```tsx
useEffect(() => {
  if (!import.meta.env.VITE_SUPABASE_URL) {
    import('../../shared/services/seed').then(m => m.seedIfEmpty());
  }
}, []);
```

- [ ] **Step 9: Type-check**

```bash
npx tsc --noEmit
```
Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add src/shared/services/index.ts src/shared/services/supabase/adminService.ts src/admin/pages/LoginPage.tsx src/admin/pages/ProductManager.tsx src/admin/pages/OrderManager.tsx src/admin/components/AdminLayout.tsx src/admin/App.tsx src/client/App.tsx
git commit -m "feat: wire admin panel to Supabase Edge Functions"
```

---

### Task 8: Supabase Storage Setup & Image Upload

**Files:**
- Modify: (Storage bucket created in Supabase Dashboard, no code file needed)

- [ ] **Step 1: Create product-images bucket**

In Supabase Dashboard → Storage → New Bucket:
- Name: `product-images`
- Check: "Public bucket"
- Create

- [ ] **Step 2: Verify bucket is public**

Go to `https://your-project.supabase.co/storage/v1/object/public/product-images/test.txt` —
should return 404 (not 401/403).

- [ ] **Step 3: Test image upload via Edge Function**

```bash
# Encode a small test image to base64 and call the admin-products uploadImage action
curl -X POST https://your-project.supabase.co/functions/v1/admin-products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_token>" \
  -d '{"action":"uploadImage","base64":"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="}'
```
Expected: `{"url":"https://..."}`

- [ ] **Step 4: Commit (no code changes needed if storage is already handled in Edge Functions)**

---

### Task 9: End-to-End Verification

**Files:** None (verification only)

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify customer flow**

1. Open `http://localhost:5173`
2. Browse products (should see seed data from Supabase)
3. Click "立即订购" → should redirect to login
4. Enter email, get OTP, verify
5. Should redirect back to order page with product added
6. Fill in shipping info, submit
7. Go to "历史订单" → see own order

- [ ] **Step 3: Verify admin flow**

1. Open `http://localhost:5173/admin.html`
2. Log in with admin password
3. See orders list
4. Expand an order, set prices, save
5. Status should change to "已核算"
6. Add a new product with image
7. Delete a product

- [ ] **Step 4: Verify i18n**

Switch language to EN, RU → all texts should translate.

- [ ] **Step 5: Verify localStorage fallback**

Remove `VITE_SUPABASE_URL` from `.env`, restart dev server → app should work with localStorage.

---

### Task 10: Cleanup & Finalize

**Files:**
- Modify: `README.md`
- Remove: `src/shared/services/seed.ts` (no longer needed in Supabase mode)
- Remove: `src/shared/services/localStorage.ts` (optional, keep for fallback)

- [ ] **Step 1: Update README**

Add section about Supabase setup, replacing the generic template text with actual project info.

- [ ] **Step 2: Remove seed.ts import fallback**

The seed is only used in localStorage mode. If `VITE_SUPABASE_URL` is set, seed is never called. Leave the file for now — it remains useful for demo/tests without a Supabase project.

- [ ] **Step 3: Final commit**

```bash
git add README.md
git commit -m "docs: update README with Supabase setup instructions"
```
