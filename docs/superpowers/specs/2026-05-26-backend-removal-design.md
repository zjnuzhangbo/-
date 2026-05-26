# Backend Removal: Pure Frontend Display Site

## Date

2026-05-26

## Status

Approved. Ready for implementation.

## Goal

Remove all Supabase/backend dependencies and transform the project into a pure frontend product display site. Keep the cart as a localStorage-only feature. Prepare the architecture for future Firebase backend integration with zero impact on existing components.

## Constraint

Future addition of backend (Firebase Auth + Firestore + Storage) must NOT require changes to page-level or component-level code. Only store implementations will be swapped.

---

## What Gets Removed

### Files deleted entirely

| File | Reason |
|------|--------|
| `src/lib/supabase.ts` | Core Supabase client |
| `src/lib/migrateImages.ts` | Image migration tool (Supabase-dependent) |
| `supabase/` directory | Database migration SQL |
| `.env.example` | Supabase credentials template |
| `src/pages/AdminPage.tsx` | Admin backend page |
| `src/pages/OrdersPage.tsx` | Invoice history page |
| `src/components/admin/AdminPanel.tsx` | Admin dashboard |
| `src/components/admin/CategoryManager.tsx` | Category CRUD UI |
| `src/components/admin/CompanyEditor.tsx` | Company info editor |
| `src/components/admin/LoginForm.tsx` | Admin login |
| `src/components/admin/OrderHistory.tsx` | Invoice pricing/list UI |
| `src/components/admin/ProductForm.tsx` | Product create/edit form |
| `src/components/admin/ProductManager.tsx` | Product list/delete UI |
| `src/components/invoice/ExportButtons.tsx` | Excel/Word export buttons |
| `src/components/invoice/PriceTable.tsx` | Pricing table |
| `src/components/invoice/TotalBar.tsx` | Total amount bar |
| `src/stores/useAuthStore.ts` | Auth state |
| `src/stores/useInvoiceStore.ts` | Invoice/order state |
| `src/stores/useCompanyStore.ts` | Company info state |
| `src/utils/exportExcel.ts` | Excel export |
| `src/utils/exportWord.ts` | Word export |

### Dependencies removed from package.json

- `@supabase/supabase-js`
- `pg`
- `xlsx`
- `docx`
- `file-saver`
- `@types/file-saver`

### i18n keys removed

- `invoice.*`
- `orders.*`
- `admin.*`
- `nav.admin`
- `nav.orders`

---

## What Gets Modified

### `src/App.tsx`

- Remove `/admin` route
- Remove `/orders` route
- Keep: `/`, `/product/:id`, `/order`

### `src/stores/useProductStore.ts`

- Remove supabase import
- `load()` → load from seed data + localStorage fallback
- `add()` / `update()` / `remove()` → write to localStorage only
- Keep same method signatures for future Firebase swap

### `src/stores/useCategoryStore.ts`

- Remove supabase import
- `load()` → return seed data directly
- `add()` / `update()` / `remove()` → write to localStorage
- Keep same method signatures

### `src/pages/OrderPage.tsx`

- Remove invoice creation logic (useInvoiceStore, createInvoice)
- Keep cart item display and quantity management
- Remove customer name input and submit button
- Cart acts as a "selected products list" only

### `src/components/layout/Header.tsx`

- Remove "Order History" and "Admin" nav links
- Keep: Home, Cart

### `src/components/layout/Footer.tsx`

- Replace useCompanyStore with static default company info
- Company info from seedData directly

### `src/components/layout/Layout.tsx`

- Remove auth session loading
- Remove invoice loading
- Remove company loading
- Remove Supabase realtime subscription
- Remove Supabase auth state change listener

### `src/components/ui/ImageUploader.tsx`

- Remove Supabase upload logic
- Keep local base64 image handling only

---

## What Stays Unchanged

- `src/types/index.ts` — All type definitions preserved for future backend
- `src/i18n/` — Translation system (trim unused keys only)
- `src/hooks/useVoiceCommands.ts` — Voice commands
- `src/stores/useCartStore.ts` — Already pure localStorage
- `src/components/product/` — Product display
- `src/components/cart/` — Cart UI
- `src/components/ui/` — Generic UI components
- `src/pages/HomePage.tsx` — Product listing
- `src/pages/ProductDetailPage.tsx` — Product detail
- `src/utils/seedData.ts` — Default categories and company
- `src/utils/translate.ts` — Translation utility
- `tailwind.config.js`, `postcss.config.js`, `vite.config.ts` — Build config
- `vercel.json` — Deployment config

---

## Architecture for Future Firebase Integration

The Zustand stores act as a data access layer. Page components never import Firebase/Supabase directly.

```
Page Components
       ↓
  Zustand Stores  ←  Implementation swapped here
       ↓
  [localStorage / seed]  ←  Today
  [Firebase SDK]         ←  Future
```

When Firebase is added later:

1. Create `src/lib/firebase.ts` with Firebase config (read from `.env`)
2. Create a `.env.example` template file
3. Rewrite each store's internal implementation to use Firestore
4. Page components need zero changes — they still call `useProductStore().load()`

### Config sharing

Future `.env.example` will list all required Firebase config keys. The recipient fills in their own Firebase project values and renames to `.env`. Project runs immediately — no code changes needed. This is standard Vite env var behavior; nothing custom required.

---

## Final Page Count

| Route | Page | Function |
|-------|------|----------|
| `/` | HomePage | Browse products, search, filter by category |
| `/product/:id` | ProductDetailPage | Product details, variant selection, add to cart |
| `/order` | OrderPage | Cart management (view, adjust quantity, remove) |

---

## Implementation Steps

1. Remove all files listed above
2. Modify `useProductStore.ts` (localStorage + seed data)
3. Modify `useCategoryStore.ts` (seed data only)
4. Modify `OrderPage.tsx` (remove invoice logic)
5. Modify `App.tsx` (remove routes)
6. Modify `Header.tsx` (remove nav links)
7. Modify `Footer.tsx` (static company info)
8. Modify `Layout.tsx` (remove backend init)
9. Modify `ImageUploader.tsx` (remove Supabase upload)
10. Clean i18n files (remove unused keys)
11. Remove backend dependencies from `package.json`
12. Delete `supabase/` directory and `.env.example`
13. Run `npm install` to sync `package-lock.json`
14. Test: `npm run dev`, verify all 3 pages work
