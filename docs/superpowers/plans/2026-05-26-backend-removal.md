# Backend Removal — Pure Frontend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all Supabase/backend dependencies, transforming the app into a pure frontend product display site with localStorage-based cart and seed data for categories/products.

**Architecture:** Zustand stores act as the data access layer. Product and category stores are rewritten to use seed data + localStorage instead of Supabase. Cart store (already pure localStorage) stays unchanged. Page components consume stores through the same interfaces — no component-level API changes needed. Future Firebase integration only requires rewriting store internals.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Tailwind CSS 3, Zustand 5, i18next, react-router-dom 7

---

### Task 1: Delete all backend-related files

**Files:**
- Remove: `src/lib/supabase.ts`
- Remove: `src/lib/migrateImages.ts`
- Remove: `supabase/migrations/001_init.sql` (entire supabase directory)
- Remove: `.env.example`
- Remove: `src/pages/AdminPage.tsx`
- Remove: `src/pages/OrdersPage.tsx`
- Remove: `src/components/admin/AdminPanel.tsx`
- Remove: `src/components/admin/CategoryManager.tsx`
- Remove: `src/components/admin/CompanyEditor.tsx`
- Remove: `src/components/admin/LoginForm.tsx`
- Remove: `src/components/admin/OrderHistory.tsx`
- Remove: `src/components/admin/ProductForm.tsx`
- Remove: `src/components/admin/ProductManager.tsx`
- Remove: `src/components/invoice/ExportButtons.tsx`
- Remove: `src/components/invoice/PriceTable.tsx`
- Remove: `src/components/invoice/TotalBar.tsx`
- Remove: `src/stores/useAuthStore.ts`
- Remove: `src/stores/useInvoiceStore.ts`
- Remove: `src/stores/useCompanyStore.ts`
- Remove: `src/utils/exportExcel.ts`
- Remove: `src/utils/exportWord.ts`
- Remove: `src/components/ui/ImageUploader.tsx`
- Remove: `src/lib/` directory (now empty)

- [ ] **Step 1: Delete files**

```bash
rm -rf "C:/Users/31777/Desktop/网站/src/lib"
rm -rf "C:/Users/31777/Desktop/网站/supabase"
rm "C:/Users/31777/Desktop/网站/.env.example"
rm "C:/Users/31777/Desktop/网站/src/pages/AdminPage.tsx"
rm "C:/Users/31777/Desktop/网站/src/pages/OrdersPage.tsx"
rm "C:/Users/31777/Desktop/网站/src/components/admin/AdminPanel.tsx"
rm "C:/Users/31777/Desktop/网站/src/components/admin/CategoryManager.tsx"
rm "C:/Users/31777/Desktop/网站/src/components/admin/CompanyEditor.tsx"
rm "C:/Users/31777/Desktop/网站/src/components/admin/LoginForm.tsx"
rm "C:/Users/31777/Desktop/网站/src/components/admin/OrderHistory.tsx"
rm "C:/Users/31777/Desktop/网站/src/components/admin/ProductForm.tsx"
rm "C:/Users/31777/Desktop/网站/src/components/admin/ProductManager.tsx"
rm "C:/Users/31777/Desktop/网站/src/components/invoice/ExportButtons.tsx"
rm "C:/Users/31777/Desktop/网站/src/components/invoice/PriceTable.tsx"
rm "C:/Users/31777/Desktop/网站/src/components/invoice/TotalBar.tsx"
rm "C:/Users/31777/Desktop/网站/src/stores/useAuthStore.ts"
rm "C:/Users/31777/Desktop/网站/src/stores/useInvoiceStore.ts"
rm "C:/Users/31777/Desktop/网站/src/stores/useCompanyStore.ts"
rm "C:/Users/31777/Desktop/网站/src/utils/exportExcel.ts"
rm "C:/Users/31777/Desktop/网站/src/utils/exportWord.ts"
rm "C:/Users/31777/Desktop/网站/src/components/ui/ImageUploader.tsx"
```

- [ ] **Step 2: Remove empty directories**

```bash
rmdir "C:/Users/31777/Desktop/网站/src/components/admin" 2>/dev/null || true
rmdir "C:/Users/31777/Desktop/网站/src/components/invoice" 2>/dev/null || true
```

- [ ] **Step 3: Commit**

```bash
cd "C:/Users/31777/Desktop/网站" && git add -A && git commit -m "chore: remove all backend-related files (Supabase, admin, invoice, auth, export)"
```

---

### Task 2: Rewrite useCategoryStore to use seed data only

**Files:**
- Modify: `src/stores/useCategoryStore.ts`

- [ ] **Step 1: Write the new store implementation**

Replace the entire file content:

```typescript
import { create } from 'zustand';
import type { Category } from '../types';
import { defaultCategories } from '../utils/seedData';

const STORAGE_KEY = 'tricycle_categories';

function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return defaultCategories;
}

function saveCategories(categories: Category[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

interface CategoryState {
  categories: Category[];
  load: () => void;
  add: (c: Category) => void;
  update: (id: string, data: Partial<Category>) => void;
  remove: (id: string) => void;
  reorder: (ids: string[]) => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],

  load: () => {
    set({ categories: loadCategories() });
  },

  add: (c) => {
    const next = [...get().categories, c];
    saveCategories(next);
    set({ categories: next });
  },

  update: (id, data) => {
    const next = get().categories.map((c) =>
      c.id === id ? { ...c, ...data } : c
    );
    saveCategories(next);
    set({ categories: next });
  },

  remove: (id) => {
    const next = get().categories.filter((c) => c.id !== id);
    saveCategories(next);
    set({ categories: next });
  },

  reorder: (ids) => {
    const next = ids.map((id, i) => {
      const c = get().categories.find((x) => x.id === id)!;
      return { ...c, sortOrder: i };
    });
    saveCategories(next);
    set({ categories: next });
  },
}));
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "C:/Users/31777/Desktop/网站" && npx tsc --noEmit src/stores/useCategoryStore.ts 2>&1
```

Expected: No errors (or only unrelated project-level type errors)

- [ ] **Step 3: Commit**

```bash
cd "C:/Users/31777/Desktop/网站" && git add src/stores/useCategoryStore.ts && git commit -m "refactor: replace Supabase in useCategoryStore with seed data + localStorage"
```

---

### Task 3: Rewrite useProductStore to use seed data + localStorage

**Files:**
- Modify: `src/stores/useProductStore.ts`

- [ ] **Step 1: Write the new store implementation**

Replace the entire file content:

```typescript
import { create } from 'zustand';
import type { Product } from '../types';

const STORAGE_KEY = 'tricycle_products';

function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveProducts(products: Product[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

interface ProductState {
  products: Product[];
  load: () => void;
  add: (p: Product) => void;
  update: (id: string, data: Partial<Product>) => void;
  remove: (id: string) => void;
  getById: (id: string) => Product | undefined;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],

  load: () => {
    set({ products: loadProducts() });
  },

  add: (p) => {
    const next = [p, ...get().products];
    saveProducts(next);
    set({ products: next });
  },

  update: (id, data) => {
    const next = get().products.map((p) =>
      p.id === id ? { ...p, ...data } : p
    );
    saveProducts(next);
    set({ products: next });
  },

  remove: (id) => {
    const next = get().products.filter((p) => p.id !== id);
    saveProducts(next);
    set({ products: next });
  },

  getById: (id) => get().products.find((p) => p.id === id),
}));
```

- [ ] **Step 2: Commit**

```bash
cd "C:/Users/31777/Desktop/网站" && git add src/stores/useProductStore.ts && git commit -m "refactor: replace Supabase in useProductStore with localStorage"
```

---

### Task 4: Rewrite Layout to remove all backend initialization

**Files:**
- Modify: `src/components/layout/Layout.tsx`

- [ ] **Step 1: Write the simplified Layout**

Replace the entire file content:

```tsx
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ToastContainer from '../ui/Toast';
import { useProductStore } from '../../stores/useProductStore';
import { useCategoryStore } from '../../stores/useCategoryStore';
import { useCartStore } from '../../stores/useCartStore';

export default function Layout() {
  const loadProducts = useProductStore((s) => s.load);
  const loadCategories = useCategoryStore((s) => s.load);
  const loadCart = useCartStore((s) => s.load);

  useEffect(() => {
    loadProducts();
    loadCategories();
    loadCart();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ToastContainer />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd "C:/Users/31777/Desktop/网站" && git add src/components/layout/Layout.tsx && git commit -m "refactor: remove backend init from Layout (auth, invoice, company, realtime)"
```

---

### Task 5: Update App.tsx to remove admin and orders routes

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Simplify routes**

Replace the entire file content:

```tsx
import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrderPage from './pages/OrderPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/order" element={<OrderPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd "C:/Users/31777/Desktop/网站" && git add src/App.tsx && git commit -m "refactor: remove admin and orders routes from App"
```

---

### Task 6: Update Header navigation

**Files:**
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: Remove admin and orders nav links**

Remove the `orders` and `admin` entries from `navLinks`. Change lines 30-35 from:

```typescript
  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/order', label: t('nav.order') },
    { to: '/orders', label: t('nav.orders') },
    { to: '/admin', label: t('nav.admin') },
  ];
```

To:

```typescript
  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/order', label: t('nav.order') },
  ];
```

- [ ] **Step 2: Commit**

```bash
cd "C:/Users/31777/Desktop/网站" && git add src/components/layout/Header.tsx && git commit -m "refactor: remove orders and admin nav links from Header"
```

---

### Task 7: Update Footer to use static company info

**Files:**
- Modify: `src/components/layout/Footer.tsx`

- [ ] **Step 1: Replace useCompanyStore with static data**

Replace the entire file content:

```tsx
import { useTranslation } from 'react-i18next';
import { defaultCompany } from '../../utils/seedData';

export default function Footer() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language as 'zh' | 'en' | 'ru';
  const company = defaultCompany;

  return (
    <footer className="border-t border-gray-100/80 bg-white/40 backdrop-blur-sm mt-auto">
      <div className="max-w-7xl mx-auto px-5 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold text-gray-800">{company.name[lang]}</h3>
            {company.phone && (
              <p className="text-sm text-gray-500 mt-1.5 flex items-center justify-center md:justify-start gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {company.phone}
              </p>
            )}
          </div>

          {company.wechatQR && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl border border-gray-100 overflow-hidden shadow-sm bg-white p-1">
                <img src={company.wechatQR} alt="WeChat QR" className="w-full h-full object-contain rounded-xl" />
              </div>
              <p className="text-[10px] text-gray-400 mt-1.5 font-medium uppercase tracking-wider">WeChat</p>
            </div>
          )}

          <p className="text-xs text-gray-400 text-center md:text-right">
            &copy; {new Date().getFullYear()} {company.name[lang]}
            <span className="mx-1.5 text-gray-300">·</span>
            {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd "C:/Users/31777/Desktop/网站" && git add src/components/layout/Footer.tsx && git commit -m "refactor: use static company info in Footer instead of store"
```

---

### Task 8: Simplify OrderPage to cart-only (no invoice creation)

**Files:**
- Modify: `src/pages/OrderPage.tsx`

- [ ] **Step 1: Rewrite OrderPage as cart management only**

Replace the entire file content:

```tsx
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../stores/useCartStore';
import CartItemList from '../components/cart/CartItemList';

export default function OrderPage() {
  const { t } = useTranslation();
  const items = useCartStore((s) => s.items);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('cart.title')}</h1>
      <CartItemList />
      {items.length > 0 && (
        <p className="text-center text-gray-400 text-sm mt-8">
          {t('cart.contactForPricing')}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add the new i18n key for the hint text**

Add `"contactForPricing": "请联系客服获取报价"` to the `cart` section in `src/i18n/locales/zh.json`:

After `"remove": "删除"` on the `cart` line, add:
```
"contactForPricing": "请联系客服获取报价"
```

Similarly add to `src/i18n/locales/en.json` cart section:
```
"contactForPricing": "Contact customer service for pricing"
```

And `src/i18n/locales/ru.json` cart section:
```
"contactForPricing": "Свяжитесь с нами для получения цен"
```

- [ ] **Step 3: Commit**

```bash
cd "C:/Users/31777/Desktop/网站" && git add src/pages/OrderPage.tsx src/i18n/locales/zh.json src/i18n/locales/en.json src/i18n/locales/ru.json && git commit -m "refactor: simplify OrderPage to cart-only, remove invoice creation"
```

---

### Task 9: Clean i18n files — remove unused keys

**Files:**
- Modify: `src/i18n/locales/zh.json`
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/ru.json`

- [ ] **Step 1: Update zh.json**

Replace entire file content:

```json
{
  "nav": { "home": "首页", "order": "购物车" },
  "home": { "search": "搜索产品...", "all": "全部", "addToCart": "加入购物车", "variants": "个型号" },
  "product": { "detail": "产品详情", "model": "型号", "size": "尺寸", "weight": "重量", "stock": "库存", "inStock": "有货", "outOfStock": "缺货", "addToCart": "加入购物车" },
  "cart": { "title": "购物车", "empty": "购物车是空的", "qty": "数量", "remove": "删除", "contactForPricing": "请联系客服获取报价" },
  "voice": { "listening": "正在聆听...", "notSupported": "浏览器不支持语音识别", "clickToStart": "点击开始语音" },
  "footer": { "rights": "版权所有" },
  "common": { "save": "保存", "cancel": "取消", "delete": "删除", "edit": "编辑", "confirm": "确认", "close": "关闭", "loading": "加载中...", "success": "操作成功", "error": "操作失败" }
}
```

- [ ] **Step 2: Update en.json**

Replace entire file content:

```json
{
  "nav": { "home": "Home", "order": "Cart" },
  "home": { "search": "Search products...", "all": "All", "addToCart": "Add to Cart", "variants": "variants" },
  "product": { "detail": "Product Detail", "model": "Model", "size": "Size", "weight": "Weight", "stock": "Stock", "inStock": "In Stock", "outOfStock": "Out of Stock", "addToCart": "Add to Cart" },
  "cart": { "title": "Cart", "empty": "Cart is empty", "qty": "Qty", "remove": "Remove", "contactForPricing": "Contact customer service for pricing" },
  "voice": { "listening": "Listening...", "notSupported": "Browser does not support speech recognition", "clickToStart": "Click to start voice" },
  "footer": { "rights": "All Rights Reserved" },
  "common": { "save": "Save", "cancel": "Cancel", "delete": "Delete", "edit": "Edit", "confirm": "Confirm", "close": "Close", "loading": "Loading...", "success": "Success", "error": "Error" }
}
```

- [ ] **Step 3: Update ru.json**

Replace entire file content:

```json
{
  "nav": { "home": "Главная", "order": "Корзина" },
  "home": { "search": "Поиск...", "all": "Все", "addToCart": "В корзину", "variants": "вариантов" },
  "product": { "detail": "Детали", "model": "Модель", "size": "Размер", "weight": "Вес", "stock": "Наличие", "inStock": "В наличии", "outOfStock": "Нет в наличии", "addToCart": "В корзину" },
  "cart": { "title": "Корзина", "empty": "Корзина пуста", "qty": "Кол-во", "remove": "Удалить", "contactForPricing": "Свяжитесь с нами для получения цен" },
  "voice": { "listening": "Слушаю...", "notSupported": "Браузер не поддерживает распознавание речи", "clickToStart": "Нажмите для голоса" },
  "footer": { "rights": "Все права защищены" },
  "common": { "save": "Сохранить", "cancel": "Отмена", "delete": "Удалить", "edit": "Изменить", "confirm": "Подтвердить", "close": "Закрыть", "loading": "Загрузка...", "success": "Успешно", "error": "Ошибка" }
}
```

- [ ] **Step 4: Commit**

```bash
cd "C:/Users/31777/Desktop/网站" && git add src/i18n/locales/ && git commit -m "refactor: remove unused i18n keys (invoice, orders, admin)"
```

---

### Task 10: Remove backend npm dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Remove dependencies from package.json**

Remove the following lines from `dependencies`:
- `"@supabase/supabase-js": "^2.106.1",`
- `"docx": "^9.7.0",`
- `"file-saver": "^2.0.5",`
- `"pg": "^8.21.0",`
- `"xlsx": "^0.18.5",`

Remove from `devDependencies`:
- `"@types/file-saver": "^2.0.7",`

- [ ] **Step 2: Run npm install to sync lock file**

```bash
cd "C:/Users/31777/Desktop/网站" && npm install 2>&1
```

Expected: installs without errors, lock file updated.

- [ ] **Step 3: Commit**

```bash
cd "C:/Users/31777/Desktop/网站" && git add package.json package-lock.json && git commit -m "chore: remove backend npm deps (supabase-js, pg, xlsx, docx, file-saver)"
```

---

### Task 11: Verify the app runs correctly

- [ ] **Step 1: Start dev server**

```bash
cd "C:/Users/31777/Desktop/网站" && npx vite --host &
sleep 3
```

- [ ] **Step 2: Verify homepage loads**

```bash
curl -s http://localhost:5173/ | grep -o '<title>[^<]*</title>'
```

Expected: `<title>TricycleParts</title>`

- [ ] **Step 3: Verify no import errors in browser console**

Navigate with Playwright (if available) or check that Vite dev server has no build errors in terminal output.

```bash
curl -s http://localhost:5173/src/main.tsx 2>&1 | head -20
```

Expected: returns compiled JS, not an error page.

- [ ] **Step 4: Clean up .mcp.json if it exists**

The `.mcp.json` file was created earlier for Playwright config. Remove it if it's no longer needed:

```bash
rm "C:/Users/31777/Desktop/网站/.mcp.json" 2>/dev/null || true
```

- [ ] **Step 5: Final commit if any cleanup changes**

```bash
cd "C:/Users/31777/Desktop/网站" && git status
```
