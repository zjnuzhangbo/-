# Frontend Redesign — Client Pages UI Overhaul

**Date:** 2026-06-03
**Scope:** 4 client pages (HomePage, OrderPage, OrderHistory, LoginPage)
**Goal:** Products fill screen adaptively, responsive mobile+desktop, unified design language

## Design Direction

- Large showcase cards with image-first layout
- Adaptive grid: desktop 4-5 cols, tablet 3 cols, mobile 2 cols
- Sticky filter bar below header
- Compact hero banner
- Unified card style: white bg, rounded corners, soft shadows, smooth hover transitions
- Keep all existing functionality — UI layer only

---

## Page-by-Page Design

### 1. HomePage (`src/client/pages/HomePage.tsx`)

**Hero banner**
- Reduce from ~128px gradient to ~56px compact bar
- Dark bg + white text, single line: "三轮车配件批发 · 瑞盛商贸"
- Remove subtitle

**Filter bar** (sticky below header)
- `position: sticky; top: 56px` (header height)
- White bg with bottom border
- Search input on left + horizontal scroll category pills
- Mobile: same layout, pills scroll horizontally

**Product grid**
- CSS: `grid-template-columns: repeat(auto-fill, minmax(260px, 1fr))`
- Gap: 16px (desktop) / 12px (mobile)
- Padding: `px-4` or `px-6` instead of centered max-w container
- Remove grid/table view toggle (card grid only)

**Product card**
- Image area: 55-60% of card height (min 140px)
  - Has image: full cover
  - No image: centered initials placeholder (larger font)
- Info area: category badge + product name + variant selector/display + order button
- Hover: slight translateY(-2px) + shadow increase
- Selected state: blue border + light blue bg tint

**Bottom bar** (sticky, only when items selected)
- Same as current: selected count + submit button

### 2. OrderPage (`src/client/pages/OrderPage.tsx`)

**Layout**
- Full width `max-w-7xl` (remove `max-w-5xl`)
- Desktop: 2-column grid (shipping form | product list)
- Mobile: single column stack

**Shipping info card**
- White card with soft shadow
- Clean form labels + inputs
- Focus ring on inputs

**Product list card**
- Each item: product name + spec + quantity stepper + delete
- Empty state: centered prompt
- "+ Add product" link at bottom

**Submit button**
- Full width, larger padding (py-4), blue primary

### 3. OrderHistory (`src/client/pages/OrderHistory.tsx`)

**Layout**
- `max-w-6xl` centered (narrower than homepage, better for reading)

**Filter pills**
- Pill button group: All / Pending / Priced
- Dark bg for active, outline for inactive

**Order card**
- Header row: order number + date + status badge
- Body: item list (name + spec + quantity), shipping info bar (grey bg)
- Footer: delete button (pending) or lock indicator (priced/24h)
- Card gap: 16px

### 4. LoginPage (`src/client/pages/LoginPage.tsx`)

**Layout**
- Centered card, `max-w-sm`, white bg + shadow
- Page bg: slate-50

**Form**
- Email/phone toggle tabs
- Input fields with labels
- Login/Register toggle link
- Submit button full width
- Improved spacing and font hierarchy

---

## Technical Notes

- **No functional changes** — routes, auth, data flow, localStorage/Supabase switching all unchanged
- **CSS changes only** — Tailwind classes in JSX
- **Existing components reused** — Button, Input, Modal, Toast from `src/shared/components/ui/`
- **i18n keys preserved** — all translation keys remain the same
- **Grid view toggle removal** — the table/list view toggle is removed since card grid is now the default

## Responsive Breakpoints

| Breakpoint | Columns | Card min-width |
|---|---|---|
| Desktop (>=1024px) | 4-5 | 260px |
| Tablet (640-1023px) | 3 | 220px |
| Mobile (<640px) | 2 | 160px |
| Small mobile (<400px) | 1 | full width |

## Non-Goals

- Admin panel pages (admin.html) unchanged
- No backend/API changes
- No new dependencies
- No i18n key changes
