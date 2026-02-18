/**
 * Seed sample data for coffee shop and restaurant.
 * Invoked at server startup when SEED_SAMPLE_DATA=true.
 */
import * as merchantsStore from './store/merchants';
import * as productsStore from './store/products';
import * as receiptsStore from './store/receipts';
import * as customersStore from './store/customers';
import crypto from 'crypto';

function uuid(): string {
  return crypto.randomUUID();
}

function hoursAgo(h: number): string {
  const d = new Date();
  d.setHours(d.getHours() - h);
  return d.toISOString();
}

export function runSeed(): void {
  console.log('[seed] Seeding sample data...');

  merchantsStore.seedMerchants();
  console.log('[seed] Merchants: Caffè Roma (m1), Trattoria Bella (m2)');

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
  console.log('[seed] Products: coffee shop (7), restaurant (8)');

  customersStore.seedCustomer('m1', { name: 'Marco Rossi', email: 'marco@example.com', phone: '+39 333 1234567' });
  customersStore.seedCustomer('m1', { name: 'Anna Bianchi', phone: '+39 320 9876543' });
  customersStore.seedCustomer('m2', { name: 'Giulia Verdi', email: 'giulia@example.com', phone: '+39 347 5551234' });
  console.log('[seed] Customers: 2 (coffee), 1 (restaurant)');

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

  console.log('[seed] Sample receipts: 3 (coffee), 2 (restaurant)');
  console.log('[seed] Done.');
}
