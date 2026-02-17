# POS/Receipt App — Development & Implementation Plan

**Version:** 1.0  
**Last updated:** February 2025  
**Scope:** Pending tasks with UX-first approach, Cordova (not Capacitor), sample data for coffee shop & restaurant

---

## Design Principles

- **Zero training** — UI must be self-explanatory for new merchants and customers
- **Neat & clean** — Consistent spacing, typography, and visual hierarchy
- **Interactive & attractive** — Subtle animations for feedback and delight
- **Cordova-based** — All plugins and APIs must use Cordova (no Capacitor)
- **Sample data** — Coffee shop and restaurant scenarios for realistic demos

---

## Phase 1: Core Flows & UX Foundation

### 1.1 Products CRUD (API + UI)

**Goal:** Full product management with polished UI.

| Task | Description | UX Notes |
|------|-------------|----------|
| 1.1.1 | Wire Products page to `GET /api/products` | Loading skeleton, empty state with CTA |
| 1.1.2 | Wire Product Form to POST/PUT API | Inline validation, success toast, smooth transition back |
| 1.1.3 | Product list: card layout, swipe actions | Swipe-to-edit, swipe-to-deactivate |
| 1.1.4 | Search with debounce (300ms) | Instant filter, no flicker |
| 1.1.5 | Add product image placeholder | Optional image slot for future |
| 1.1.6 | Animations | List item fade-in on load, card press feedback |

**Sample data (Coffee shop):**
- Espresso (€2.50, VAT 10%)
- Cappuccino (€3.50, VAT 10%)
- Croissant (€2.00, VAT 10%)
- Sandwich (€6.50, VAT 10%)
- Mineral Water (€1.50, VAT 22%)

**Sample data (Restaurant):**
- Margherita Pizza (€12.00, VAT 10%)
- Caesar Salad (€9.00, VAT 10%)
- Grilled Salmon (€18.00, VAT 10%)
- Tiramisu (€6.00, VAT 10%)
- House Wine (€8.00, VAT 22%)

---

### 1.2 Checkout Cart → Issue Receipt

**Goal:** Intuitive checkout flow with clear feedback.

| Task | Description | UX Notes |
|------|-------------|----------|
| 1.2.1 | Product grid/list in checkout | Large tap targets, product image placeholder, price visible |
| 1.2.2 | Add to cart: tap product or +/- | Haptic feedback (if available), quantity badge animation |
| 1.2.3 | Cart summary: sticky at bottom | Subtotal, tax breakdown, total; always visible |
| 1.2.4 | Payment method modal (bottom sheet) | Cash, Card, Wallet, Split; icons + labels |
| 1.2.5 | "Issue Receipt" CTA | Primary button, disabled when cart empty |
| 1.2.6 | Success flow | Receipt number toast, auto-navigate to Receipt Detail |
| 1.2.7 | Animations | Cart item add/remove slide, receipt success confetti or checkmark |

**Sample cart flow (Coffee shop):**
- 2x Cappuccino, 1x Croissant → Total €9.50 + VAT

---

### 1.3 Receipts List & Detail

**Goal:** Easy browsing and actions on receipts.

| Task | Description | UX Notes |
|------|-------------|----------|
| 1.3.1 | Wire to GET /api/receipts | Group by date (Today, Yesterday, This week, Older) |
| 1.3.2 | Receipt card: number, time, total, status badge | Color-coded status (green=completed, yellow=pending, red=voided) |
| 1.3.3 | Filters: date range, status, payment | Chip-style filters, clear selection |
| 1.3.4 | Receipt Detail: full layout | Header with number/date, item list, totals, action buttons |
| 1.3.5 | Actions: Send, Print, Void, Refund | Icon + label, confirmation for Void/Refund |
| 1.3.6 | Animations | List stagger on load, pull-to-refresh |

---

## Phase 2: Offline-First & Connectivity

### 2.1 Connectivity Detection (Cordova)

**Goal:** Detect online/offline using Cordova (no Capacitor).

| Task | Description | Implementation |
|------|-------------|----------------|
| 2.1.1 | Use `cordova-plugin-network-information` | `navigator.connection` or `online`/`offline` events |
| 2.1.2 | Fallback: `navigator.onLine` | Works in WebView when plugin not available |
| 2.1.3 | Connectivity context | `useConnectivity()` hook, expose `isOnline` |
| 2.1.4 | Offline badge in header | Visible when offline, subtle animation |
| 2.1.5 | Pending sync badge | "Pending (n)" when receipts queued |

**Cordova plugin:**
```bash
cordova plugin add cordova-plugin-network-information
```

**Events:**
- `document.addEventListener('online', ...)`
- `document.addEventListener('offline', ...)`

---

### 2.2 Sync Manager & Queue

**Goal:** Reliable offline receipt sync.

| Task | Description | UX Notes |
|------|-------------|----------|
| 2.2.1 | Implement `syncQueue.ts` | Store pending receipts in IndexedDB |
| 2.2.2 | Implement `syncManager.ts` | On online: process queue with retry (3 attempts, exponential backoff) |
| 2.2.3 | Idempotent sync | Use `clientReceiptId`; on duplicate, mark synced |
| 2.2.4 | Sync status in Receipt list | Badge: "Syncing...", "Pending", "Synced" |
| 2.2.5 | Manual "Retry sync" in Settings | Button when offline receipts exist |
| 2.2.6 | Animations | Sync spinner, success pulse on sync complete |

---

### 2.3 Local Repositories (IndexedDB)

**Goal:** Offline product cache and receipt queue.

| Task | Description |
|------|-------------|
| 2.3.1 | `productsRepo.ts` | Upsert products from API, read for offline |
| 2.3.2 | `receiptsRepo.ts` | Insert pending, update with server ID after sync |
| 2.3.3 | Seed sample data on first launch | Coffee shop + restaurant products if no data |

---

## Phase 3: UI Polish & Animations

### 3.1 Design System

| Task | Description |
|------|-------------|
| 3.1.1 | Define spacing scale (4, 8, 12, 16, 24, 32px) | Consistent padding/margins |
| 3.1.2 | Typography: clear hierarchy | Title, subtitle, body, caption |
| 3.1.3 | Color tokens | Primary, success, warning, error, neutral |
| 3.1.4 | Icon set | Use ionicons consistently |

---

### 3.2 Animations (Ionic + CSS)

| Component | Animation | Trigger |
|------------|-----------|---------|
| List items | Fade-in + slide-up | On load |
| Cart add | Scale pulse | Add item |
| Button press | Opacity 0.8 | Tap |
| Modal | Slide-up | Open |
| Toast | Fade-in | Show |
| Receipt success | Checkmark + brief green flash | Issue receipt |
| Pull-to-refresh | Built-in Ionic | Pull |
| Offline badge | Subtle pulse | When offline |

**Tools:** Ionic's `IonRefresher`, CSS `@keyframes`, `transition`

---

### 3.3 Empty States & Onboarding

| Screen | Empty state | CTA |
|--------|-------------|-----|
| Products | "No products yet" + illustration | "Add first product" |
| Receipts | "No receipts yet" | "Start checkout" |
| Cart | "Cart is empty" | "Add products" |
| Checkout | Product grid with sample data hint | — |

---

## Phase 4: Sample Data & Seed

### 4.1 Backend Seed Script

**Goal:** Populate in-memory stores with coffee shop and restaurant data.

| Task | Description |
|------|-------------|
| 4.1.1 | Create `server/scripts/seed-sample-data.ts` | Run on server start (dev mode) or via CLI |
| 4.1.2 | Merchants | "Caffè Roma" (coffee), "Trattoria Bella" (restaurant) |
| 4.1.3 | Products per merchant | See 1.1 sample data |
| 4.1.4 | Sample receipts | 5–10 receipts per merchant with realistic items |

---

### 4.2 Mobile Seed (First Launch)

| Task | Description |
|------|-------------|
| 4.2.1 | On first app open (no products in DB) | Offer "Load sample data" or auto-load for demo |
| 4.2.2 | Sample products in IndexedDB | Coffee shop + restaurant |

---

## Phase 5: Additional Features

### 5.1 Receipt Void/Refund (Backend + UI)

| Task | Description |
|------|-------------|
| 5.1.1 | `POST /api/receipts/:id/void` | Backend |
| 5.1.2 | `POST /api/receipts/:id/refund` | Backend |
| 5.1.3 | Wire to Receipt Detail | Confirmation modal before void/refund |

---

### 5.2 Customers Screen (Full)

| Task | Description |
|------|-------------|
| 5.2.1 | Customer list (stub → real) | Name, phone, email |
| 5.2.2 | Add/Edit customer | Form with validation |
| 5.2.3 | Link customer to receipt (optional) | For future loyalty |

---

### 5.3 Reports

| Task | Description |
|------|-------------|
| 5.3.1 | Today's sales from local receipts | Summary card |
| 5.3.2 | Export CSV | Download file |
| 5.3.3 | Date range picker | For custom reports |

---

### 5.4 Auth Guard

| Task | Description |
|------|-------------|
| 5.4.1 | Route guard component | Redirect to /login if no token |
| 5.4.2 | Apply to all protected routes | Except /login |

---

## Implementation Order (Sprint View)

### Sprint 1 (Core)
1. Backend seed script (coffee + restaurant data)
2. Products CRUD wired to API
3. Product list UI polish (cards, animations)

### Sprint 2 (Checkout)
4. Checkout cart logic
5. Payment method modal
6. Issue receipt flow (API + offline fallback)

### Sprint 3 (Receipts)
7. Receipts list wired to API
8. Receipt Detail wired
9. Void/Refund backend + UI

### Sprint 4 (Offline)
10. Cordova network plugin + connectivity context
11. Sync manager + queue
12. Local repositories (products, receipts)

### Sprint 5 (Polish)
13. Design system + spacing/typography
14. Animations (list, cart, modals)
15. Empty states + onboarding

### Sprint 6 (Extras)
16. Customers screen
17. Reports (today sales, CSV)
18. Auth guard

---

## Cordova Plugins Required

| Plugin | Purpose |
|--------|---------|
| `cordova-plugin-network-information` | Connectivity detection |
| (Existing) `cordova-plugin-inappbrowser` | System browser for SPID |
| (Existing) `cordova-plugin-customurlscheme` | Callback URL |

---

## Out of Scope (Per Request)

- **PostgreSQL migration** — Not required; keep in-memory stores for now.

---

## Success Criteria

- New merchant can add products and issue first receipt without documentation
- Offline: create receipt → sync when back online
- UI feels responsive and polished with subtle animations
- Sample data demonstrates coffee shop and restaurant use cases
