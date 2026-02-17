# POS/Receipt App Implementation Summary

## What Was Implemented

### Mobile App (Ionic React + Cordova)

1. **Side Menu Navigation (IonMenu)**
   - Replaced tab navigation with IonMenu
   - Menu items: Checkout, Receipts, Products, Customers, Payments, Printer, Reports, Settings, Support, Logout
   - All labels use i18n

2. **i18n (Multi-language)**
   - English (default), Italian, German
   - `src/i18n/locales/{en,it,de}/translation.json`
   - Language persisted in localStorage (`pos_app_language`)
   - Settings → Language to switch

3. **Routes**
   - `/login` (existing)
   - `/merchant-select`
   - `/checkout`, `/receipts`, `/receipts/:id`
   - `/products`, `/products/new`, `/products/:id/edit`
   - `/customers` (stub)
   - `/settings`, `/settings/language`, `/settings/payments`, `/settings/printer`
   - `/reports`, `/support`
   - `/home` (existing)

4. **Contexts**
   - `AuthContext` – JWT, logout
   - `MerchantContext` – selected merchant, merchants list
   - `MerchantLoader` – fetches /api/me and populates merchants

5. **Core Screens**
   - Checkout, Receipts, Receipt Detail, Products, Product Form
   - Settings, Language, Payments, Printer, Reports, Support
   - All with placeholder UI

6. **Data Layer**
   - `src/data/db/index.ts` – Dexie/IndexedDB schema (products, receipts, syncMeta)
   - `src/api/client.ts` – API client with JWT, merchant header, 401 → logout

7. **Types**
   - `src/types/index.ts` – Merchant, Product, Receipt, CartItem, etc.

### Backend (Node.js + Express)

1. **Extended /api/me**
   - Returns `merchants` array

2. **JWT**
   - Includes `merchantIds` array

3. **New API Routes**
   - `GET /api/products` – list products (merchant-scoped)
   - `POST /api/products` – create product
   - `PUT /api/products/:id` – update product
   - `GET /api/receipts` – list receipts (filters: from, to, status, payment)
   - `GET /api/receipts/:id` – get receipt
   - `POST /api/receipts` – create receipt (idempotent via `clientReceiptId`)

4. **In-memory Stores**
   - `server/src/store/merchants.ts`
   - `server/src/store/products.ts`
   - `server/src/store/receipts.ts`

5. **Tenant Isolation**
   - All endpoints require `X-Merchant-Id` or `merchantId` in body
   - JWT must include `merchantIds` with access

## How to Run

### Mobile
```bash
cd mobile
npm run build
npx cordova run android
```

### Backend
```bash
cd server
npm run dev
```

### Full flow (with ngrok)
1. Start server: `npm run server` (from root)
2. Start ngrok: `ngrok http 4000`
3. Run: `node scripts/start-ngrok-and-update.js`
4. Update Signicat redirect URI
5. Build and run mobile app

## Mock / Offline Mode

- **USE_MOCK**: Set `VITE_USE_MOCK=true` in env for local dev without backend
- **MerchantLoader**: Uses mock merchants if API doesn't return them
- **IndexedDB**: Dexie schema ready for offline products/receipts

## Sync (Planned)

- Receipts created offline: `clientReceiptId` (UUID), `status=PENDING_SYNC`
- Backend: idempotent create via `(merchantId, clientReceiptId)` unique
- Sync queue and connectivity detection: structure in place, full implementation pending

## Not Yet Implemented

- Full offline sync with retry/backoff
- Connectivity detection (navigator.onLine or Capacitor Network)
- Products/receipts CRUD wired to API
- Checkout cart → issue receipt flow
- PostgreSQL migration (current: in-memory)
