# UI Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add view toggle, SKU search, image placeholder, and filter state preservation to HomePage

**Architecture:** All changes within `src/client/pages/HomePage.tsx` — no new files. View toggle adds a second rendering branch (table mode). Filter state uses sessionStorage read-on-mount / save-on-unmount pattern.

**Tech Stack:** React 19, TypeScript, Tailwind CSS

---

### Task 1: SKU/Model Search

**Files:**
- Modify: `src/client/pages/HomePage.tsx:33-38`

- [ ] **Step 1: Extend filtered logic to search variant fields**

Replace the `filtered` block (lines 33-38):

```tsx
const filtered = products.filter(p => {
  if (!p.active) return false;
  if (search && !localName(p.name, lang).toLowerCase().includes(search.toLowerCase())) return false;
  if (selectedCategories.size > 0 && !selectedCategories.has(p.categoryId)) return false;
  return true;
});
```

With:

```tsx
const filtered = products.filter(p => {
  if (!p.active) return false;
  if (search) {
    const q = search.toLowerCase();
    const nameMatch = localName(p.name, lang).toLowerCase().includes(q);
    const variantMatch = p.variants.some(v =>
      v.model.toLowerCase().includes(q) ||
      v.size.toLowerCase().includes(q) ||
      v.weight.toLowerCase().includes(q)
    );
    if (!nameMatch && !variantMatch) return false;
  }
  if (selectedCategories.size > 0 && !selectedCategories.has(p.categoryId)) return false;
  return true;
});
```

- [ ] **Step 2: Verify in browser**

After HMR reload, type "32mm" in search → "前叉总成" appears. Type "18齿" → "差速器总成" appears.

- [ ] **Step 3: Commit**

```bash
git add src/client/pages/HomePage.tsx
git commit -m "feat: extend search to match variant model/size/weight"
```

---

### Task 2: Image Placeholder

**Files:**
- Modify: `src/client/pages/HomePage.tsx:153-154`

- [ ] **Step 1: Replace emoji placeholder with styled div**

Locate the image area inside the product card (around line 153-154):

```tsx
<div className="h-32 bg-slate-100 flex items-center justify-center text-2xl relative">
  {product.images[0] ? <img src={product.images[0]} alt={localName(product.name, lang)} className="w-full h-full object-cover" /> : '🔧'}
```

Replace with:

```tsx
<div className="h-32 bg-slate-100 flex items-center justify-center text-2xl relative">
  {product.images[0] ? (
    <img src={product.images[0]} alt={localName(product.name, lang)} className="w-full h-full object-cover" />
  ) : (
    <span className="text-slate-400 font-semibold text-sm select-none">
      {localName(product.name, lang).slice(0, 2)}
    </span>
  )}
```

- [ ] **Step 2: Verify in browser**

Products without images now show first two characters of their name (e.g. "前叉") on light gray background.

- [ ] **Step 3: Commit**

```bash
git add src/client/pages/HomePage.tsx
git commit -m "feat: replace emoji placeholder with product name initials"
```

---

### Task 3: Filter State Preservation

**Files:**
- Modify: `src/client/pages/HomePage.tsx:13-21`

- [ ] **Step 1: Add sessionStorage key constant**

Add after the component declaration (around line 8-9):

```tsx
const FILTER_CACHE_KEY = 'tricycle_home_filters';
```

- [ ] **Step 2: Initialize state from sessionStorage**

Replace the state init lines (13-15):

```tsx
const [search, setSearch] = useState('');
const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
```

With:

```tsx
const [search, setSearch] = useState(() => {
  try {
    const cached = sessionStorage.getItem(FILTER_CACHE_KEY);
    if (cached) return JSON.parse(cached).search || '';
  } catch { /* ignore */ }
  return '';
});
const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() => {
  try {
    const cached = sessionStorage.getItem(FILTER_CACHE_KEY);
    if (cached) return new Set<string>(JSON.parse(cached).categories || []);
  } catch { /* ignore */ }
  return new Set();
});
```

- [ ] **Step 3: Save filter state on unmount**

Add a `useEffect` for cleanup after the existing data-fetching useEffect (after line 21):

```tsx
useEffect(() => {
  return () => {
    sessionStorage.setItem(FILTER_CACHE_KEY, JSON.stringify({
      search,
      categories: [...selectedCategories],
    }));
  };
}, [search, selectedCategories]);
```

- [ ] **Step 4: Verify in browser**

1. Search "前叉", select category "车架/车斗"
2. Navigate to "历史订单"
3. Click back or navigate to "首页"
4. Search term and category filter are restored

- [ ] **Step 5: Commit**

```bash
git add src/client/pages/HomePage.tsx
git commit -m "feat: preserve search and category filter state across navigations"
```

---

### Task 4: Grid/Table View Toggle

**Files:**
- Modify: `src/client/pages/HomePage.tsx:14-131` (add state, toggle button, table branch)

- [ ] **Step 1: Add viewMode state with localStorage persistence**

After the existing state declarations (around line 15):

```tsx
const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => {
  try { return (localStorage.getItem('tricycle_view_mode') as 'grid' | 'table') || 'grid'; }
  catch { return 'grid'; }
});
```

And a sync effect:

```tsx
useEffect(() => {
  localStorage.setItem('tricycle_view_mode', viewMode);
}, [viewMode]);
```

- [ ] **Step 2: Add view toggle buttons**

Insert after the search input and before the category filters (replace the current `<div className="flex items-center gap-2 mb-4 flex-wrap">` opening section starting at line 109):

Before the category filter `<div>` (around line 109), add the toggle:

```tsx
<div className="flex items-center gap-2 mb-4">
  <div className="flex rounded-md overflow-hidden border border-slate-200 mr-2">
    <button
      onClick={() => setViewMode('grid')}
      className={`px-3 py-1.5 text-xs font-semibold transition-colors ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
    >
      ▦ 卡片
    </button>
    <button
      onClick={() => setViewMode('table')}
      className={`px-3 py-1.5 text-xs font-semibold transition-colors ${viewMode === 'table' ? 'bg-primary-600 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'}`}
    >
      ☰ 列表
    </button>
  </div>
```

- [ ] **Step 3: Add table rendering branch**

After the empty state check (the `filtered.length === 0` block around line 133-137), modify the render to branch on viewMode. Replace the grid rendering block (lines 139-194):

```tsx
) : viewMode === 'table' ? (
  /* ---- Table View ---- */
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200 text-left text-xs text-slate-400">
          <th className="py-2 px-1 w-8"></th>
          <th className="py-2 px-2 w-12"></th>
          <th className="py-2 px-2">{t('home.productName')}</th>
          <th className="py-2 px-2">{t('home.spec')}</th>
          <th className="py-2 px-2">{t('home.category')}</th>
          <th className="py-2 px-2 w-24"></th>
        </tr>
      </thead>
      <tbody>
        {filtered.map(product => {
          const hasMultipleVariants = product.variants.length > 1;
          const currentVariant = selectedVariants[product.id] || product.variants[0]?.id || '';
          const isChecked = checked.has(product.id);
          const catName = localName(categories.find(c => c.id === product.categoryId)?.name || { zh: '', en: '', ru: '' }, lang);

          return (
            <tr
              key={product.id}
              className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${isChecked ? 'bg-primary-50' : ''}`}
              onClick={() => toggleCheck(product.id)}
            >
              <td className="py-2 px-1">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
                  ${isChecked ? 'bg-primary-600 border-primary-600' : 'border-slate-300'}`}>
                  {isChecked && <span className="text-white text-xs">✓</span>}
                </div>
              </td>
              <td className="py-2 px-2">
                {product.images[0] ? (
                  <img src={product.images[0]} alt={localName(product.name, lang)} className="w-10 h-10 rounded object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                    <span className="text-slate-400 font-semibold text-[10px] select-none">
                      {localName(product.name, lang).slice(0, 2)}
                    </span>
                  </div>
                )}
              </td>
              <td className="py-2 px-2">
                <span className="font-semibold text-slate-800 text-xs">{localName(product.name, lang)}</span>
              </td>
              <td className="py-2 px-2">
                {hasMultipleVariants ? (
                  <select
                    className="px-1.5 py-1 border border-slate-200 rounded text-[11px] outline-none focus:border-primary-400"
                    value={currentVariant}
                    onClick={e => e.stopPropagation()}
                    onChange={e => setSelectedVariants(prev => ({ ...prev, [product.id]: e.target.value }))}
                  >
                    {product.variants.map(v => (
                      <option key={v.id} value={v.id}>{v.model} {v.size}·{v.weight}</option>
                    ))}
                  </select>
                ) : product.variants[0] ? (
                  <span className="text-[11px] text-slate-500">{product.variants[0].model} {product.variants[0].size}·{product.variants[0].weight}</span>
                ) : <span className="text-[11px] text-slate-400">-</span>}
              </td>
              <td className="py-2 px-2">
                <span className="text-[10px] text-primary-600 font-semibold bg-primary-50 px-1.5 py-0.5 rounded-pill">{catName}</span>
              </td>
              <td className="py-2 px-2">
                <button
                  onClick={e => { e.stopPropagation(); quickOrder(product); }}
                  className="px-3 py-1 bg-primary-600 text-white text-[11px] font-semibold rounded hover:bg-primary-700 transition-colors"
                >
                  {t('home.quickOrder')}
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
) : (
  /* ---- Grid View (existing) ---- */
  <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,220px))] gap-3">
    {/* ... existing grid code unchanged ... */}
  </div>
)}
```

- [ ] **Step 4: Add missing i18n keys**

Add these keys to `src/shared/i18n/locales/zh.json`, `en.json`, `ru.json`:

In `zh.json`:
```json
"home": {
  "title": "三轮车配件批发",
  "subtitle": "优质配件，一站式采购",
  "search": "搜索配件名称...",
  "noProducts": "暂无商品",
  "productName": "产品名称",
  "spec": "型号/规格",
  "category": "分类",
  "quickOrder": "立即订购"
}
```

In `en.json`:
```json
"home": {
  "title": "Tricycle Parts Wholesale",
  "subtitle": "Quality parts, one-stop procurement",
  "search": "Search parts...",
  "noProducts": "No products",
  "productName": "Product",
  "spec": "Spec",
  "category": "Category",
  "quickOrder": "Quick Order"
}
```

In `ru.json`:
```json
"home": {
  "title": "Запчасти для трициклов",
  "subtitle": "Качественные запчасти, комплексные закупки",
  "search": "Поиск запчастей...",
  "noProducts": "Нет товаров",
  "productName": "Товар",
  "spec": "Характеристики",
  "category": "Категория",
  "quickOrder": "Заказать"
}
```

- [ ] **Step 5: Verify in browser**

1. Toggle to table view → compact table renders with all columns
2. Toggle back to grid → card grid returns
3. Refresh page → view preference persists (localStorage)
4. Check responsiveness at <768px width

- [ ] **Step 6: Commit**

```bash
git add src/client/pages/HomePage.tsx src/shared/i18n/locales/zh.json src/shared/i18n/locales/en.json src/shared/i18n/locales/ru.json
git commit -m "feat: add grid/table view toggle with localStorage persistence"
```
