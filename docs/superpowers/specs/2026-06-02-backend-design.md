# Backend Design — Tricycle Parts Ordering System

**Date**: 2026-06-02
**Scope**: Migrate from localStorage to Supabase backend with customer auth

## 1. Architecture Overview

```
┌────── Client (Customer) ──────┐    ┌────── Admin Panel ──────────┐
│  React SPA (index.html)       │    │  React SPA (admin.html)     │
│  Supabase SDK (anon key)      │    │  Local password login       │
│  ├─ Auth: email/phone login   │    │  Edge Functions calls       │
│  ├─ DB: RLS-gated CRUD        │    │  ├─ Product CRUD + images   │
│  └─ Storage: image read       │    │  ├─ Category management     │
│                               │    │  ├─ Order pricing           │
│                               │    │  └─ Excel export            │
└──────────┬────────────────────┘    └────────────┬────────────────┘
           │                                      │
           ▼                                      ▼
┌────────────────── Supabase ──────────────────────────┐
│  PostgreSQL  ←── RLS ──→  Edge Functions             │
│  Auth (email OTP / phone)  Storage (product images)  │
└──────────────────────────────────────────────────────┘
```

**Key decisions:**
- Two entry points, one Supabase project: `index.html` (customer) + `admin.html` (admin)
- Customer client uses `anon key` + Row Level Security for permission control
- Admin panel calls Edge Functions using `service_role key` (full DB access, bypasses RLS)
- Admin login stays as simple password check (password stored in Edge Function env var)
- Existing service interfaces (`ProductService`, `OrderService`, etc.) get Supabase implementations; frontend components require zero changes

## 2. Database Schema

### `categories`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name_zh | text NOT NULL | |
| name_en | text NOT NULL | |
| name_ru | text NOT NULL | |
| icon | text | DEFAULT '' |
| sort_order | int | DEFAULT 0 |

### `products`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| name_zh | text NOT NULL | |
| name_en | text NOT NULL | |
| name_ru | text NOT NULL | |
| category_id | uuid FK → categories | |
| images | text[] | Storage URLs, DEFAULT '{}' |
| active | boolean | DEFAULT true |
| created_at | timestamptz | |

### `variants`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| product_id | uuid FK → products | ON DELETE CASCADE |
| model | text | |
| size | text | |
| weight | text | |

### `profiles` (extends auth.users)
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK FK → auth.users | ON DELETE CASCADE |
| phone | text | |
| default_name | text | saved shipping name |
| default_phone | text | saved shipping phone |
| default_address | text | saved shipping address |
| created_at | timestamptz | |

### `orders`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| order_number | text UNIQUE | generated: YYYYMMDD + sequence |
| customer_id | uuid → auth.users | |
| customer_name | text | denormalized |
| customer_phone | text | denormalized |
| customer_address | text | denormalized |
| status | text | CHECK ('pending', 'priced') |
| created_at | timestamptz | |

### `order_items`
| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| order_id | uuid FK → orders | ON DELETE CASCADE |
| product_name | text | denormalized; survives product edits |
| model, spec | text | denormalized |
| quantity | int | DEFAULT 1 |
| unit_price | numeric(10,2) | NULL = unpriced; admin fills |

**Design rationale:**
- Names split into `zh/en/ru` columns rather than JSON — better for SQL indexing and queries
- Order item details (`product_name`, `model`, `spec`) denormalized: if admin later edits a product, historical orders remain correct
- `unit_price` is NULLable — admin sets it during pricing workflow; NULL means "unpriced"
- `ON DELETE CASCADE` on variants and order_items: deleting a product cleans up its variants; deleting an order cleans up its items

## 3. Auth & Security

### Customer Auth (Supabase Auth)
- Email magic link login (OTP)
- Phone SMS OTP login
- On sign-up: a database trigger creates a `profiles` row automatically
- Session managed by Supabase SDK, persisted in browser

### Row Level Security (RLS)

```sql
-- Categories & Products: public read
CREATE POLICY "public_read" ON categories FOR SELECT USING (true);
CREATE POLICY "public_read" ON products FOR SELECT USING (true);
CREATE POLICY "public_read" ON variants FOR SELECT USING (true);

-- Orders: customer owns their orders
CREATE POLICY "orders_select" ON orders FOR SELECT
  USING (auth.uid() = customer_id);
CREATE POLICY "orders_insert" ON orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Order items: accessed through owned orders
CREATE POLICY "items_select" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND customer_id = auth.uid()));
CREATE POLICY "items_insert" ON order_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE id = order_id AND customer_id = auth.uid()));

-- Profiles: own data only
CREATE POLICY "profiles_all" ON profiles FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
```

### Admin Auth
- Standalone password login (not Supabase Auth)
- `admin-login` Edge Function validates password against `ADMIN_PASSWORD` env var
- Returns simple JWT stored in `sessionStorage`
- All admin function calls include this JWT in Authorization header
- Admin Edge Functions use `service_role key` (superuser, bypasses all RLS)

## 4. Edge Functions API

| Function | Method | Auth | Purpose |
|----------|--------|------|---------|
| `admin-login` | POST | None | Validate password, return JWT |
| `admin-products` | POST | Admin JWT | Create/update/delete products + upload images |
| `admin-categories` | POST | Admin JWT | Create/delete categories |
| `admin-orders` | POST | Admin JWT | List all orders, save pricing |
| `admin-export` | POST | Admin JWT | Generate Excel export |
| `init-profile` | Trigger | None | DB trigger: create profiles row on auth.users insert |

### Function details

**admin-login**
```
POST /functions/v1/admin-login
Body: { "password": "..." }
→ 200: { "token": "jwt..." }
→ 401: { "error": "invalid password" }
```

**admin-products** (action-based dispatch)
```
POST /functions/v1/admin-products
Headers: Authorization: Bearer <admin_jwt>
Body: { "action": "create"|"update"|"delete"|"list", ... }
```

**admin-orders** (pricing flow)
```
POST /functions/v1/admin-orders
Headers: Authorization: Bearer <admin_jwt>
Body: { "action": "list"|"get"|"updatePricing", ... }

// updatePricing:
{ "action": "updatePricing", "orderId": "...", "items": [{ "id": "...", "unitPrice": 120.00 }] }
→ Sets order.status = 'priced' when all items have prices
```

## 5. Image Storage

- Bucket: `product-images` (public read)
- Upload flow: Admin selects image in browser → Edge Function receives base64 → uploads to Storage → stores returned URL in `products.images[]`
- On product image removal: Edge Function deletes stale files from Storage
- Client reads images via public Storage URLs (no auth needed)

## 6. Migration Strategy

### Service layer (no interface changes)
```
src/shared/services/
  interfaces.ts           ← unchanged
  index.ts                ← switches between implementations
  localStorage.ts         ← retained for dev/fallback
  supabase/
    client.ts             ← Supabase SDK init (anon key)
    productService.ts     ← implements ProductService via Supabase
    categoryService.ts    ← implements CategoryService via Supabase
    orderService.ts       ← implements OrderService via Supabase
    authService.ts        ← implements AuthService via Supabase Auth
    adminApi.ts           ← Edge Function call helpers (admin only)
```

### Migration plan
1. Set up Supabase project, run migration SQL to create tables + RLS
2. Implement Supabase service classes (keep localStorage as fallback)
3. Test with both implementations in dev
4. Deploy Edge Functions to Supabase
5. Switch production to Supabase implementation
6. Remove localStorage services after stable

## 7. Error Handling

- **Network failures**: services return empty arrays / throw consistent errors; frontend shows Toast
- **Auth expired**: Supabase SDK auto-refreshes session; on failure, redirect to login
- **Edge Function errors**: return `{ error: "message" }` with appropriate HTTP status; admin panel shows Toast
- **DB constraint violations**: caught in Edge Functions, returned as user-friendly messages

## Out of Scope

- Real-time order notifications (can add later via Supabase Realtime)
- Multi-language SMS templates for phone auth (use Supabase defaults)
- Automated order numbering with DB sequence (use timestamp-based generation for simplicity)
- Payment integration (per existing app logic)
