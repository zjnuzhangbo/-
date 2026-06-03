# Frontend Redesign — Client Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign 4 client pages (HomePage, OrderPage, OrderHistory, LoginPage) with large showcase cards, adaptive grid, sticky filters, and unified card design — CSS/UI only, no functional changes.

**Architecture:** All changes are Tailwind CSS class modifications in existing JSX files. No new files, no new dependencies, no logic changes. Each page is modified in-place with updated layout classes, card styles, and responsive breakpoints.

**Tech Stack:** React 19, TypeScript 6, Tailwind CSS 3.4, Vite 8

---

### Task 1: Redesign HomePage — hero banner + filter bar + grid container

**Files:**
- Modify: `src/client/pages/HomePage.tsx`

- [ ] **Step 1: Replace the hero banner section**

Find the hero banner (lines ~132-136):
```tsx
<div className="bg-gradient-to-b from-slate-800 to-slate-700 text-white py-16 px-4 text-center">
  <h1 className="font-display text-3xl md:text-4xl mb-2">{t('home.title')}</h1>
  <p className="text-slate-300 text-sm">{t('home.subtitle')}</p>
</div>
```

Replace with compact banner:
```tsx
<div className="bg-slate-800 text-white py-3 px-4 text-center">
  <h1 className="font-display text-sm md:text-base tracking-wide">{t('home.title')} · {t('app.companyName')}</h1>
</div>
```

- [ ] **Step 2: Make the filter bar sticky below header**

Find the max-w-7xl container opening (line ~138):
```tsx
<div className="max-w-7xl mx-auto px-4 py-6 flex-1 pb-20">
```

Replace the filter area inside (search input + category pills + view toggle, lines ~139-162). Replace the entire `max-w-7xl` container opening and filter section with:

```tsx
{/* Sticky filter bar */}
<div className="sticky top-[56px] z-30 bg-white border-b border-slate-200 shadow-sm">
  <div className="px-4 py-3">
    <div className="flex items-center gap-3">
      <input
        className="input-field flex-1 max-w-md"
        placeholder={t('home.search')}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
    </div>
    {categories.length > 0 && (
      <div className="flex gap-2 mt-3 overflow-x-auto pb-0.5">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => toggleCategory(cat.id)}
            className={`shrink-0 px-3 py-1.5 rounded-pill text-xs font-semibold border transition-colors
              ${selectedCategories.has(cat.id)
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300'}`}
          >
            {localName(cat.name, lang)}
          </button>
        ))}
      </div>
    )}
  </div>
</div>

{/* Product grid */}
<div className="px-4 md:px-6 py-6 flex-1 pb-20">
```

- [ ] **Step 3: Update the grid class**

Find the grid view div (line ~273):
```tsx
<div className="grid grid-cols-[repeat(auto-fill,minmax(200px,220px))] gap-3">
```

Replace with:
```tsx
<div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
```

- [ ] **Step 4: Remove view mode toggle and table view**

Delete the view mode toggle buttons (lines ~150-161, the `flex rounded-md overflow-hidden` div with grid/table buttons).

Delete the entire table view block (lines ~192-270, from `{/* ---- Table View ---- */}` comment through the closing `</div>` of the table view).

Remove the `viewMode` state and its useEffect:
```tsx
// DELETE these:
const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => { ... });
useEffect(() => { localStorage.setItem('tricycle_view_mode', viewMode); }, [viewMode]);
```

Remove the conditional rendering and keep only the grid view. Change the filtered.length check from:
```tsx
) : viewMode === 'table' ? (
  /* ... table view ... */
) : (
  /* grid view */
```
To simply:
```tsx
) : (
  /* grid view */
```

- [ ] **Step 5: Close container properly**

Ensure the grid container and bottom bar container close properly. The bottom bar (checked.size > 0) stays outside the grid div.

- [ ] **Step 6: Verify HomePage compiles**

Run: `npx tsc --noEmit`
Expected: No new TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add src/client/pages/HomePage.tsx
git commit -m "feat: redesign HomePage hero, sticky filter, adaptive grid"
```

---

### Task 2: Redesign HomePage — product cards

**Files:**
- Modify: `src/client/pages/HomePage.tsx`

- [ ] **Step 1: Redesign the grid card**

Find the grid card div (currently around line ~281):
```tsx
<div
  key={product.id}
  className={`bg-white rounded-lg border-2 overflow-hidden transition-all cursor-pointer ...`}
  onClick={() => toggleCheck(product.id)}
>
```

Replace the entire grid card (from the opening div through the closing div before the next card) with:

```tsx
<div
  key={product.id}
  onClick={() => toggleCheck(product.id)}
  className={`group bg-white rounded-xl border-2 overflow-hidden transition-all duration-200 cursor-pointer
    hover:-translate-y-1 hover:shadow-lg
    ${isChecked ? 'border-primary-500 shadow-md ring-2 ring-primary-200 bg-primary-50/50' : 'border-slate-200 shadow-sm hover:border-slate-300'}`}
>
  {/* Image area */}
  <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center relative overflow-hidden">
    {product.images[0] ? (
      <img src={product.images[0]} alt={localName(product.name, lang)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    ) : (
      <span className="text-4xl text-slate-300 font-display select-none">
        {localName(product.name, lang).slice(0, 2)}
      </span>
    )}
    {/* Checkbox */}
    <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm
      ${isChecked ? 'bg-primary-600 border-primary-600' : 'bg-white/90 border-slate-300 group-hover:border-primary-400'}`}>
      {isChecked && <span className="text-white text-xs font-bold">✓</span>}
    </div>
  </div>

  {/* Info area */}
  <div className="p-4">
    <span className="inline-block text-[10px] text-primary-600 font-semibold bg-primary-50 px-2 py-0.5 rounded-pill mb-2">
      {catName}
    </span>
    <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-2">{localName(product.name, lang)}</h3>

    {hasMultipleVariants ? (
      <select
        className="w-full mb-2 px-2 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-primary-400 bg-slate-50"
        value={currentVariant}
        onClick={e => e.stopPropagation()}
        onChange={e => setSelectedVariants(prev => ({ ...prev, [product.id]: e.target.value }))}
      >
        {product.variants.map(v => (
          <option key={v.id} value={v.id}>{v.model} · {v.size} · {v.weight}</option>
        ))}
      </select>
    ) : product.variants[0] ? (
      <p className="text-xs text-slate-400 mb-2">
        {product.variants[0].model} · {product.variants[0].size} · {product.variants[0].weight}
      </p>
    ) : null}

    <button
      onClick={e => { e.stopPropagation(); quickOrder(product); }}
      className="w-full py-2 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors"
    >
      {t('home.quickOrder')}
    </button>
  </div>
</div>
```

- [ ] **Step 2: Update bottom bar styling**

Find the bottom bar (around line ~337):
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-primary-200 shadow-lg z-30 px-4 py-3">
```

Update to match new design:
```tsx
<div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 shadow-xl z-30 px-4 py-3">
```

And the submit button inside:
```tsx
<button
  onClick={submitChecked}
  className="px-8 py-2.5 bg-primary-600 text-white text-sm font-bold rounded-xl hover:bg-primary-700 active:bg-primary-800 transition-all shadow-lg shadow-primary-200"
>
  {t('home.quickOrder')} ({checked.size})
</button>
```

- [ ] **Step 3: Verify HomePage compiles**

Run: `npx tsc --noEmit`
Expected: No new TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/client/pages/HomePage.tsx
git commit -m "feat: redesign HomePage product cards with large image area"
```

---

### Task 3: Redesign OrderPage

**Files:**
- Modify: `src/client/pages/OrderPage.tsx`

- [ ] **Step 1: Update layout width and back link**

Change the container from `max-w-5xl` to `max-w-7xl`:
```tsx
// OLD (line ~110):
<div className="max-w-5xl mx-auto px-4 py-6 flex-1">

// NEW:
<div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex-1">
```

Update the back link:
```tsx
// OLD:
<Link to="/" className="text-sm text-slate-500 hover:text-primary-600 transition-colors">{t('order.back')}</Link>

// NEW:
<Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-primary-600 transition-colors mb-2">
  <span>←</span> {t('order.back')}
</Link>
```

- [ ] **Step 2: Redesign shipping info card**

Replace the shipping info card (lines ~116-135):
```tsx
{/* OLD: */}
<div className="bg-white rounded-lg border border-slate-200 p-5">

{/* NEW: */}
<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
  <h2 className="font-display text-lg text-slate-800 mb-5 flex items-center gap-2">
    <span className="w-1 h-5 bg-primary-500 rounded-full"></span>
    {t('order.shippingInfo')}
  </h2>
```

Add focused ring styling to inputs: The `input-field` class already has focus ring. Keep as-is.

- [ ] **Step 3: Redesign product list card**

Replace the product list card (lines ~138-164):
```tsx
{/* OLD: */}
<div className="bg-white rounded-lg border border-slate-200 p-5">

{/* NEW: */}
<div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
  <h2 className="font-display text-lg text-slate-800 mb-5 flex items-center gap-2">
    <span className="w-1 h-5 bg-primary-500 rounded-full"></span>
    {t('order.productList')}
  </h2>
```

Update empty state text style:
```tsx
<p className="text-slate-400 text-sm py-8 text-center bg-slate-50 rounded-lg">{t('order.productList')}</p>
```

Update the "+ Add Product" button:
```tsx
<button onClick={() => setPickerOpen(true)} className="mt-5 w-full py-2.5 border-2 border-dashed border-slate-300 text-sm text-slate-500 font-semibold rounded-xl hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50/50 transition-colors">
  {t('order.addProduct')}
</button>
```

- [ ] **Step 4: Redesign submit button**

```tsx
{/* OLD: */}
<button onClick={handleSubmit} className="w-full mt-6 py-3 bg-primary-600 text-white font-bold rounded-lg hover:bg-primary-700 transition-colors text-sm">

{/* NEW: */}
<button onClick={handleSubmit} className="w-full mt-6 py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 active:bg-primary-800 transition-all shadow-lg shadow-primary-200 text-base">
```

- [ ] **Step 5: Polish success page**

Update the success page container:
```tsx
<div className="flex-1 flex items-center justify-center p-6">
  <div className="text-center max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-10">
```

- [ ] **Step 6: Verify OrderPage compiles**

Run: `npx tsc --noEmit`
Expected: No new TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add src/client/pages/OrderPage.tsx
git commit -m "feat: redesign OrderPage with card layout and improved spacing"
```

---

### Task 4: Redesign OrderHistory

**Files:**
- Modify: `src/client/pages/OrderHistory.tsx`

- [ ] **Step 1: Update layout and header**

Change container width:
```tsx
// OLD (line ~50):
<div className="max-w-3xl mx-auto px-4 py-6 flex-1">

// NEW:
<div className="max-w-5xl mx-auto px-4 md:px-6 py-6 flex-1">
```

Update header:
```tsx
<h1 className="font-display text-2xl text-slate-800 mb-1">{t('history.title')}</h1>
<p className="text-sm text-slate-400 mb-5">{t('history.count', { count: orders.length })}</p>
```

- [ ] **Step 2: Redesign filter pills to be sticky**

```tsx
{/* OLD: */}
<div className="flex gap-2 mb-5">

{/* NEW: */}
<div className="sticky top-[56px] z-20 bg-slate-50 pt-2 pb-3 -mx-4 px-4 md:-mx-6 md:px-6 flex gap-2">
```

- [ ] **Step 3: Redesign order cards**

Replace the order card structure (lines ~78-130). Key changes:
- Card: `rounded-xl border border-slate-200 shadow-sm overflow-hidden` (add shadow)
- Header: `bg-slate-50 px-5 py-3.5` background tint
- Order number: larger font
- Items: better spacing `py-2.5`
- Shipping info bar: `bg-slate-50 rounded-lg px-4 py-2.5`
- Card gap: `gap-4` instead of `gap-3`

Full replacement:

```tsx
<div className="flex flex-col gap-4">
  {filtered.map(order => {
    const locked = isLocked(order);
    return (
      <div key={order.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3.5 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-800 text-sm">#{order.orderNumber}</span>
            <span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
          </div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-pill text-xs font-semibold
            ${order.status === 'pending'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            {order.status === 'pending' ? '○ ' : '● '}
            {order.status === 'pending' ? t('history.pending') : t('history.priced')}
          </span>
        </div>

        {/* Body */}
        <div className="px-5 py-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-3 min-w-0">
                {item.imageUrl ? (
                  <img src={item.imageUrl} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-slate-400 font-semibold">{item.productName.slice(0,1)}</span>
                  </div>
                )}
                <div className="min-w-0">
                  <span className="font-semibold text-slate-800 text-sm block truncate">{item.productName}</span>
                  <span className="text-xs text-slate-400">{item.spec}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-slate-400">×</span>
                {locked ? (
                  <span className="font-semibold text-sm w-8 text-center">{item.quantity}</span>
                ) : (
                  <input
                    type="number"
                    min={1}
                    defaultValue={item.quantity}
                    onChange={e => saveQuantity(order, idx, parseInt(e.target.value) || 1)}
                    className="w-14 px-2 py-1.5 text-center border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                  />
                )}
              </div>
            </div>
          ))}
          {/* Shipping info */}
          <div className="bg-slate-50 rounded-lg px-4 py-2.5 mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
            <span>📦 {order.customerName}</span>
            <span>📞 {order.customerPhone}</span>
            <span className="truncate">📍 {order.customerAddress}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex justify-end">
          {locked ? (
            <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium bg-amber-50 px-3 py-1.5 rounded-lg">
              🔒 {t('history.locked')}
            </span>
          ) : (
            <button onClick={() => setDeleteId(order.id)}
              className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
              {t('history.delete')}
            </button>
          )}
        </div>
      </div>
    );
  })}
</div>
```

- [ ] **Step 4: Verify OrderHistory compiles**

Run: `npx tsc --noEmit`
Expected: No new TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/client/pages/OrderHistory.tsx
git commit -m "feat: redesign OrderHistory with improved order cards"
```

---

### Task 5: Redesign LoginPage

**Files:**
- Modify: `src/client/pages/LoginPage.tsx`

- [ ] **Step 1: Update the card container**

```tsx
{/* OLD (lines ~85-86): */}
<div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
  <div className="bg-white rounded-lg border border-slate-200 p-8 w-full max-w-sm shadow-sm">

{/* NEW: */}
<div className="min-h-[80vh] flex items-center justify-center p-4">
  <div className="bg-white rounded-2xl border border-slate-200 p-8 w-full max-w-sm shadow-xl">
```

- [ ] **Step 2: Update title and tabs**

```tsx
{/* Title (line ~87): */}
<h1 className="font-display text-2xl text-slate-800 text-center mb-6">{t('auth.title')}</h1>

{/* Tab buttons: add rounded-lg */}
<div className="flex rounded-lg overflow-hidden border border-slate-200 mb-5">
```

- [ ] **Step 3: Update input fields and buttons**

Add more spacing and rounded-xl to buttons:
```tsx
{/* Login button (email mode): */}
<button onClick={handleEmailLogin} disabled={loading}
  className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:opacity-50 text-sm transition-all shadow-lg shadow-primary-200 mt-1">
  {t('auth.login')}
</button>

{/* Register button: */}
<button onClick={handleRegister} disabled={loading}
  className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 text-sm transition-all shadow-lg shadow-emerald-200 mt-1">
  {t('auth.register')}
</button>
```

- [ ] **Step 4: Update back button**

```tsx
{/* Back button (line ~181): */}
<button onClick={() => navigate(-1)} className="w-full mt-5 text-xs text-slate-400 hover:text-slate-600 transition-colors">
  ← {t('order.back')}
</button>
```

- [ ] **Step 5: Add subtle error/message styling**

```tsx
{error && (
  <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl">
    <p className="text-xs text-red-600 text-center">{error}</p>
  </div>
)}
{message && (
  <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
    <p className="text-xs text-emerald-600 text-center">{message}</p>
  </div>
)}
```

- [ ] **Step 6: Verify LoginPage compiles**

Run: `npx tsc --noEmit`
Expected: No new TypeScript errors.

- [ ] **Step 7: Commit**

```bash
git add src/client/pages/LoginPage.tsx
git commit -m "feat: redesign LoginPage with elevated card and improved form"
```

---

### Task 6: Responsive verification and final polish

**Files:**
- Modify: `src/index.css` (minor global style additions)

- [ ] **Step 1: Add responsive card tweaks for small screens**

Add media query to `src/index.css`:

```css
/* Mobile card adjustments */
@media (max-width: 640px) {
  .grid {
    gap: 0.75rem;
  }
}
```

Wrap in the `@layer components` block or add at end of file.

- [ ] **Step 2: Run dev server and verify**

```bash
npm run dev
```

Open `http://localhost:5173` and check:
- Desktop (1920px): 4-5 columns, cards fill width
- Tablet (768px): 3 columns
- Mobile (375px): 2 columns
- Small mobile (320px): 1 column
- Sticky filter bar works on scroll
- Cards have hover effects
- Check OrderPage, OrderHistory, LoginPage all render correctly

- [ ] **Step 3: Verify build**

```bash
npm run build
```
Expected: Build succeeds with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat: add responsive mobile card tweaks"
```
