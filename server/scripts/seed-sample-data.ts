/**
 * Seed sample data for coffee shop (Caffè Roma) and restaurant (Trattoria Bella).
 * Run: npx ts-node server/scripts/seed-sample-data.ts
 * Or: npm run seed (if added to package.json)
 */
import * as merchantsStore from '../src/store/merchants';
import * as productsStore from '../src/store/products';
import * as receiptsStore from '../src/store/receipts';
import crypto from 'crypto';

function uuid(): string {
  return crypto.randomUUID();
}

function hoursAgo(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
}

function runSeed() {
  console.log('[seed] Seeding sample data...');

  // 1. Merchants
  merchantsStore.seedMerchants();
  console.log('[seed] Merchants: Caffè Roma (m1), Trattoria Bella (m2)');

  // 2. Coffee shop products (m1)
  productsStore.clearProducts();
  const coffeeProducts = [
    { name: 'Espresso', priceCents: 250, vatRate: 10, category: 'Beverages', sku: 'CF-001' },
    { name: 'Cappuccino', priceCents: 350, vatRate: 10, category: 'Beverages', sku: 'CF-002' },
    { name: 'Croissant', priceCents: 200, vatRate: 10, category: 'Pastries', sku: 'PK-001' },
    { name: 'Sandwich', priceCents: 650, vatRate: 10, category: 'Food', sku: 'FD-001' },
    { name: 'Mineral Water', priceCents: 150, vatRate: 22, category: 'Beverages', sku: 'BV-001' },
    { name: 'Orange Juice', priceCents: 400, vatRate: 10, category: 'Beverages', sku: 'BV-002' },
    { name: 'Chocolate Cake', priceCents: 450, vatRate: 10, category: 'Desserts', sku: 'DS-001' },
  ];
  coffeeProducts.forEach((p) => productsStore.seedProduct('m1', p));
  console.log('[seed] Coffee shop products:', coffeeProducts.length);

  // 3. Restaurant products (m2)
  const restaurantProducts = [
    { name: 'Margherita Pizza', priceCents: 1200, vatRate: 10, category: 'Main', sku: 'MN-001' },
    { name: 'Caesar Salad', priceCents: 900, vatRate: 10, category: 'Starters', sku: 'ST-001' },
    { name: 'Grilled Salmon', priceCents: 1800, vatRate: 10, category: 'Main', sku: 'MN-002' },
    { name: 'Tiramisu', priceCents: 600, vatRate: 10, category: 'Desserts', sku: 'DS-001' },
    { name: 'House Wine', priceCents: 800, vatRate: 22, category: 'Beverages', sku: 'BV-001' },
    { name: 'Spaghetti Carbonara', priceCents: 1100, vatRate: 10, category: 'Main', sku: 'MN-003' },
    { name: 'Bruschetta', priceCents: 550, vatRate: 10, category: 'Starters', sku: 'ST-002' },
    { name: 'Espresso', priceCents: 200, vatRate: 10, category: 'Beverages', sku: 'BV-002' },
  ];
  restaurantProducts.forEach((p) => productsStore.seedProduct('m2', p));
  console.log('[seed] Restaurant products:', restaurantProducts.length);

  // 4. Sample receipts - Coffee shop
  receiptsStore.seedReceipt('m1', uuid(), {
    issuedAt: hoursAgo(1),
    status: 'COMPLETED',
    paymentMethod: 'CASH',
    currency: 'EUR',
    subtotalCents: 850,
    taxCents: 85,
    totalCents: 935,
    items: [
      { name: 'Cappuccino', qty: 2, unitPriceCents: 350, vatRate: 10, lineTotalCents: 700 },
      { name: 'Croissant', qty: 1, unitPriceCents: 200, vatRate: 10, lineTotalCents: 200 },
    ],
    createdOffline: false,
  });
  receiptsStore.seedReceipt('m1', uuid(), {
    issuedAt: hoursAgo(3),
    status: 'COMPLETED',
    paymentMethod: 'CARD',
    currency: 'EUR',
    subtotalCents: 250,
    taxCents: 25,
    totalCents: 275,
    items: [{ name: 'Espresso', qty: 1, unitPriceCents: 250, vatRate: 10, lineTotalCents: 250 }],
    createdOffline: false,
  });
  receiptsStore.seedReceipt('m1', uuid(), {
    issuedAt: hoursAgo(5),
    status: 'COMPLETED',
    paymentMethod: 'CASH',
    currency: 'EUR',
    subtotalCents: 1200,
    taxCents: 120,
    totalCents: 1320,
    items: [
      { name: 'Sandwich', qty: 1, unitPriceCents: 650, vatRate: 10, lineTotalCents: 650 },
      { name: 'Cappuccino', qty: 1, unitPriceCents: 350, vatRate: 10, lineTotalCents: 350 },
      { name: 'Mineral Water', qty: 1, unitPriceCents: 150, vatRate: 22, lineTotalCents: 150 },
    ],
    createdOffline: false,
  });

  // 5. Sample receipts - Restaurant
  receiptsStore.seedReceipt('m2', uuid(), {
    issuedAt: hoursAgo(2),
    status: 'COMPLETED',
    paymentMethod: 'CARD',
    currency: 'EUR',
    subtotalCents: 3500,
    taxCents: 350,
    totalCents: 3850,
    items: [
      { name: 'Margherita Pizza', qty: 1, unitPriceCents: 1200, vatRate: 10, lineTotalCents: 1200 },
      { name: 'Caesar Salad', qty: 1, unitPriceCents: 900, vatRate: 10, lineTotalCents: 900 },
      { name: 'House Wine', qty: 1, unitPriceCents: 800, vatRate: 22, lineTotalCents: 800 },
      { name: 'Tiramisu', qty: 1, unitPriceCents: 600, vatRate: 10, lineTotalCents: 600 },
    ],
    createdOffline: false,
  });
  receiptsStore.seedReceipt('m2', uuid(), {
    issuedAt: hoursAgo(4),
    status: 'COMPLETED',
    paymentMethod: 'CASH',
    currency: 'EUR',
    subtotalCents: 1100,
    taxCents: 110,
    totalCents: 1210,
    items: [{ name: 'Spaghetti Carbonara', qty: 1, unitPriceCents: 1100, vatRate: 10, lineTotalCents: 1100 }],
    createdOffline: false,
  });

  console.log('[seed] Sample receipts created (3 coffee, 2 restaurant)');
  console.log('[seed] Done.');
}

runSeed();
