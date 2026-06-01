# UI Optimization Design — TricycleParts

**Date**: 2026-06-01
**Scope**: HomePage UI improvements + filter state preservation

## 1. View Toggle (Grid ↔ Table)

**File**: `src/client/pages/HomePage.tsx`

- Add `viewMode` state: `'grid' | 'table'`, default from localStorage
- Toggle button group above product grid (📱 Grid / 📋 Table)
- **Grid**: unchanged card layout
- **Table**: `<table>` with columns — checkbox, 40px thumbnail, product name, variant dropdown, category badge, quick-order button
- **Mobile (<768px)**: table collapses to stacked card list
- Persist preference to localStorage

## 2. SKU/Model Search

**File**: `src/client/pages/HomePage.tsx`

Extend the `filtered` logic to match against all variant fields:
```
search matches: product.name OR variant.model OR variant.size OR variant.weight
```
Search "32mm" finds products with that variant; "18齿" finds "差速器总成".

## 3. Image Placeholder

**File**: `src/client/pages/HomePage.tsx`

Replace `🔧` emoji with: light gray background (`bg-slate-100`), first two characters of product name centered in dark gray text.

## 4. Filter State Preservation

**File**: `src/client/pages/HomePage.tsx`

- On unmount: save `search`, `selectedCategories` to sessionStorage
- On mount: restore from sessionStorage if available
- sessionStorage auto-clears on tab close
- First visit → clean initial state

## Out of Scope

- Excel export: already implemented in `OrderManager.tsx`
